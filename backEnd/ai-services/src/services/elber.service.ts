import { ElberEvent, ElberRequest, ElberResponse, MemoryEntry, UserContext } from "../models/elber.model";
import { run, withTrace } from '@openai/agents';
import agents from "../agents";
import { saveChatMessage, updateTitle } from "./chat.service";
import ShortTermMemory from "../models/shortTermMemory.model";
import MidTermMemory from "../models/midTermMemory.model";
import LongTermMemory from "../models/longTermMemory.model";
import { handleMemory } from "./memory.service";
import { textToSpeech, splitIntoSentences } from "./polly.service";

const handleResponse = (elberResponse: ElberResponse, emitMessage: (event: ElberEvent, chatId: number, text: string) => void) => {
    const { originalRequest, agentResponse } = elberResponse
    const { user } = originalRequest
    
    /***Generamos o actualizamos el titulo del chat***/
    generateChatTitle(user.uid, originalRequest, emitMessage)
    .catch(error => {
        console.error(error)
    })
    
    /***Guardamos respuesta de Elber en firbase para mantener el historial***/
    saveChatMessage(user.uid, originalRequest.chatId, 'assistant', agentResponse)
    .catch(error => {
        console.error('Error guardando respuesta', error)
    })    

    /***Manejamos la memoria medio y largo plazo***/
    handleMemory(elberResponse)
}

const formatMemories = async (uid: string, text: string): Promise<string> => {
    const ltm = new LongTermMemory()
    const memories = await ltm.getMemory(uid, text)
    
    if (!memories.length) return '';

    const lines = memories.map((m) => `- ${m.text}`);

    return `
        MEMORIA LARGA DEL USUARIO (hechos recordados; si algo contradice al usuario hoy, dale prioridad a lo que diga hoy):
        ${lines.join("\n")}
        `.trim();
}

export const chat = async(request: ElberRequest, emitMessage: (event: ElberEvent, chatId: number, text: string) => void, abortController?: AbortController) => {
    await withTrace('Elber workflow', async() => {
        const {chatId, text, user, timeStamp, timeZone, isVoiceMode} = request
        try {            
            const conversationId = `${user.uid}_${chatId.toString()}`
            
            const session = ShortTermMemory.getInstance().getSession(conversationId)
            const midMemory = await MidTermMemory.getInstance().getMemory(conversationId, user.uid, chatId)            
            const longMemory = await formatMemories(user.uid, text)
            
            const userContext: UserContext = {
                userId: user.uid,
                timeZone
            }            

            const result = isVoiceMode
                ? await run(agents.elber.chat(user.name, midMemory.summary, longMemory, timeStamp), text, {
                    session,
                    maxTurns: 3,
                    stream: false,
                    context: userContext
                })
                : await run(agents.elber.chat(user.name, midMemory.summary, longMemory, timeStamp), text, {
                    session,
                    maxTurns: 3,
                    stream: true,
                    context: userContext
                })            

            if(isVoiceMode) {
                await processVoiceResponse(result, request, midMemory, emitMessage, abortController)
            } else {
                await processTextResponse(result, request, midMemory, emitMessage, abortController)
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

        if(title != 'Chat Nuevo') {
            return
        }

        const conversationId = `${uid}_${chatId.toString()}`
        const session = ShortTermMemory.getInstance().getSession(conversationId)

        const result = await run(agents.elber.chatTitle(title, text), text, {
            session,
            maxTurns: 3
        })           
        
        if(result.finalOutput && result.finalOutput.changeTitle) {
            updateTitle(uid, chatId, result.finalOutput.chatTitle)
            .catch(error => {
                console.error(error)
            })
            emitMessage('elber:title', chatId, result.finalOutput.chatTitle)
        }            
    } catch (error) {
        console.error(error)
        throw  new Error('Error en generateChatTitle')   
    }
}

const processTextResponse = async (result: any, request: ElberRequest, midMemory: MemoryEntry, emitMessage: (event: ElberEvent, chatId: number, text: string) => void, abortController?: AbortController) => {
    let wasCancelled = false
    let agentResponse = ''
    let responseCompleted = false

    const {user, chatId} = request
    const conversationId = `${user.uid}_${chatId.toString()}`
    
    for await(const event of result) {
        if(abortController?.signal.aborted) {
            wasCancelled = true
            break
        }

        if(event.type == 'raw_model_stream_event' && event.data.event) {
            if(event.data.event.type == 'response.output_text.delta') {
                agentResponse = `${agentResponse}${event.data.event?.delta}`.trim()
                emitMessage('elber:stream', chatId, event.data.event?.delta )
            }

            if(event.data.event.type == 'response.completed' && !responseCompleted && agentResponse.trim() != '') {
                responseCompleted = true
                emitMessage('elber:response', chatId, '' );
                
                const elberResponse: ElberResponse = {
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

    if(wasCancelled && agentResponse.trim() !== '' && !responseCompleted) {
        emitMessage('elber:cancelled', chatId, '');
        
        const elberResponse: ElberResponse = {
            agentResponse,
            conversationId,
            originalRequest: request,
            memory: midMemory
        }
        
        handleResponse(elberResponse, emitMessage)
    }
}

const processVoiceResponse = async (result: any, request: ElberRequest, midMemory: MemoryEntry, emitMessage: (event: ElberEvent, chatId: number, text: string) => void, abortController?: AbortController) => {
    const {user, chatId} = request
    const conversationId = `${user.uid}_${chatId.toString()}`

    if(result.finalOutput) {
        const agentResponse = result.finalOutput

        const elberResponse: ElberResponse = {
            agentResponse,
            conversationId,
            originalRequest: request,
            memory: midMemory
        }

        handleResponse(elberResponse, emitMessage)

        const sentences = splitIntoSentences(agentResponse)

        for (const sentence of sentences) {
            try {
                if(abortController?.signal.aborted) {
                    emitMessage('elber:cancelled', chatId, '');
                    break
                }
                const audioBuffer = await textToSpeech(sentence)
                emitMessage('elber:audio_chunk', chatId, audioBuffer.toString('base64'))
            } catch (error) {
                console.error('Error sintetizando oración con Polly:', error)
            }
        }

        emitMessage('elber:audio_end', chatId, '')
    }
}