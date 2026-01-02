import { ElberEvent, ElberUser } from "../models/elber.model";
import { run, withTrace } from '@openai/agents'
import agents from "../agents";
import { shortTermMemory } from "../models/shortTermMemory.model";
import { saveChatMessage, updateTitle } from "./chat.service";

export const chat = async(user: ElberUser, text: string, chatId: number, emitMessage: (event: ElberEvent, chatId: number, text: string) => void) => {
    await withTrace('Elber workflow', async() => {

        const conversationId = `${user.uid}_${chatId.toString()}`
        const session = shortTermMemory.getSession(conversationId)
        
        try {
            const result = await run(agents.elber(user.name), text, {
                session,
                maxTurns: 8,
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

export const generateChatTitle = async (uid: string, text: string, chatId: number, emitMessage: (event: ElberEvent, chatId: number, text: string) => void) => {
    await withTrace('Title Generator', async () => {
        try {
            const result = await run(agents.chatTitle(), text)

            if(result.finalOutput) {
                updateTitle(uid, chatId, result.finalOutput)
                emitMessage('elber:title', chatId, result.finalOutput)
            }            
        } catch (error) {
            console.error(error)            
        }
    })
}