import { ElberAction, ElberEvent, ElberResponse, ElberUser } from "../models/elber.model";
import { run, withTrace } from '@openai/agents'
import agents from "../agents";
import { shortTermMemory } from "../models/shortTermMemory.model";

const response: ElberResponse = {
    action: ElberAction.CHAT_TEXT,
    payload: {message: 'Error al hacer streaming'}
}

export const chat = async(user: ElberUser, text: string, conversationId: string, emitMessage: (event: ElberEvent, response: ElberResponse | string) => void) => {
    await withTrace('Elber workflow', async() => {

        const session = shortTermMemory.getSession(user.uid, conversationId)
        
        try {
            const result = await run(agents.elber(user.name), text, {
                session,
                maxTurns: 8,
                stream: true
            })

            for await(const event of result) {
                if(event.type == 'raw_model_stream_event' && event.data.event) {
                    if(event.data.event.type == 'response.output_text.delta') {
                        emitMessage('elber:stream', event.data.event?.delta )
                    }

                    if(event.data.event.type == 'response.completed') {
                        emitMessage('elber:response', '' );
                    }    

                    if(event.data.event.type == 'response.error') {
                        emitMessage('elber:error', response);
                    }                    
                }
            }
        } catch (error) {
            console.error(error)
            emitMessage('elber:error', response);
        }    
    })
}
