import { ElberEvent, ElberRequest, ElberResponse, ElberUser } from "../models/elber.model";
import { run, withTrace } from '@openai/agents';
import agents from "../agents";
import { saveChatMessage, updateTitle, updateChatSummary } from "./chat.service";
import ShortTermMemory from "../models/shortTermMemory.model";
import MidTermMemory from "../models/midTermMemory.model";

const MEMORY_TURNS_LIMIT = 8

const handleResponse = (elberResponse: ElberResponse, emitMessage: (event: ElberEvent, chatId: number, text: string) => void) => {
    const { user, originalRequest, agentResponse, memory, conversationId } = elberResponse
    
    generateChatTitle(user.uid, originalRequest, emitMessage)
    .catch(error => {
        console.error('Error actualizando título:', error)
    })
    
    saveChatMessage(user.uid, originalRequest.chatId, 'assistant', agentResponse)
    .catch(error => {
        console.error('Error guardando respuesta', error)
    })    

    MidTermMemory.getInstance().increaseTurnsCount(conversationId)

    if(memory.turnsCount >= MEMORY_TURNS_LIMIT ) {
        generateSummary(memory.summary, conversationId, user.uid, originalRequest.chatId)
        .catch(error => {
            console.error('Error generando resumen de la conversacion', error)
        })
    } 
}

export const chat = async(user: ElberUser, request: ElberRequest, emitMessage: (event: ElberEvent, chatId: number, text: string) => void) => {
    await withTrace('Elber workflow', async() => {
        const {chatId, text} = request
        try {            
            const conversationId = `${user.uid}_${chatId.toString()}`
            const session = ShortTermMemory.getInstance().getSession(conversationId)
            const midMemory = await MidTermMemory.getInstance().getMemory(conversationId, user.uid, chatId)

            const result = await run(agents.elber(user.name, midMemory.summary), text, {
                session,
                maxTurns: 3,
                stream: true
            })            

            let agentResponse = ''
            let responseCompleted = false

            for await(const event of result) {
                if(event.type == 'raw_model_stream_event' && event.data.event) {
                    if(event.data.event.type == 'response.output_text.delta') {
                        agentResponse = `${agentResponse}${event.data.event?.delta}`
                        emitMessage('elber:stream', chatId, event.data.event?.delta )
                    }

                    if(event.data.event.type == 'response.completed' && !responseCompleted) {
                        responseCompleted = true
                        emitMessage('elber:response', chatId, '' );
                        
                        const elberResponse: ElberResponse = {
                            user,
                            agentResponse,
                            conversationId,
                            originalRequest: request,
                            memory: midMemory
                        }
                        
                        handleResponse(elberResponse, emitMessage)
                    }    

                    if(event.data.event.type == 'response.error') {
                        emitMessage('elber:error', chatId, 'Error en la respuesta de Elber agent');
                    }                    
                }
            }
        } catch (error) {
            console.error(error)
            emitMessage('elber:error', chatId, 'Error en la respuesta de Elber agent');
        }    
    })
}

const generateChatTitle = async (uid: string, request: ElberRequest, emitMessage: (event: ElberEvent, chatId: number, text: string) => void) => {
    try {
        const {chatId, text, title} = request
        const conversationId = `${uid}_${chatId.toString()}`
        const session = ShortTermMemory.getInstance().getSession(conversationId)

        const result = await run(agents.chatTitle(title, text), text, {
            session,
            maxTurns: 3
        })           
        
        if(result.finalOutput && result.finalOutput.changeTitle) {
            console.info(`Cambiando título: "${title}" → "${result.finalOutput.chatTitle}" | Razón: ${result.finalOutput.reasoning || 'No especificada'}`)
            
            updateTitle(uid, chatId, result.finalOutput.chatTitle)
            .catch(error => {
                console.error(error)
            })
            emitMessage('elber:title', chatId, result.finalOutput.chatTitle)
        } else {
            console.info(`Manteniendo título: "${title}" | Razón: ${result.finalOutput?.reasoning || 'No hay cambio necesario'}`)
        }            
    } catch (error) {
        console.error('Error en generateChatTitle:', error)            
    }
}

const generateSummary = async (currentSummary: string, conversationId: string, uid: string, chatId: number) => {
    const session = ShortTermMemory.getInstance().getSession(conversationId)
    const result = await run(agents.summary(currentSummary), '', {
        session,
        maxTurns: 3
    })

    if(result.finalOutput) {
        MidTermMemory.getInstance().updateSummary(conversationId, result.finalOutput)
        ShortTermMemory.getInstance().deleteSession(conversationId)
        updateChatSummary(uid, chatId, result.finalOutput)
        .catch(error => {
            console.error('Error updating summary in firebase', error)
        })
    }
}