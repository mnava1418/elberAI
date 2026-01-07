import { ElberEvent, ElberRequest, ElberUser } from "../models/elber.model";
import { run, withTrace } from '@openai/agents';
import agents from "../agents";
import { saveChatMessage, updateTitle } from "./chat.service";
import ShortTermMemory from "../models/shortTermMemory.model";

export const chat = async(user: ElberUser, request: ElberRequest, emitMessage: (event: ElberEvent, chatId: number, text: string) => void) => {
    await withTrace('Elber workflow', async() => {
        const {chatId, text} = request
        try {            
            const conversationId = `${user.uid}_${chatId.toString()}`
            const session = ShortTermMemory.getInstance().getSession(conversationId)

            const result = await run(agents.elber(user.name), text, {
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
                        
                        saveChatMessage(user.uid, chatId, 'assistant', agentResponse)
                        .catch(error => {
                            console.error(error)
                        })                        
                        
                        generateChatTitle(user.uid, request, emitMessage)
                        .catch(error => {
                            console.error('Error actualizando título:', error)
                        })
                        
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

export const generateChatTitle = async (uid: string, request: ElberRequest, emitMessage: (event: ElberEvent, chatId: number, text: string) => void) => {
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