import { ElberResponse } from "../models/elber.model";
import MidTermMemory from "../models/midTermMemory.model";
import ShortTermMemory from "../models/shortTermMemory.model";
import { updateChatSummary } from "./chat.service";
import { run } from '@openai/agents';
import agents from "../agents";

const MEMORY_TURNS_LIMIT = 8

export const handleMemory = (elberResponse: ElberResponse) => {
    const { user, originalRequest, agentResponse, memory, conversationId } = elberResponse

    /***Manejamos memoria a mediano plazo***/
    MidTermMemory.getInstance().addTurn(conversationId, originalRequest.text, agentResponse)

    if(memory.turnsCount >= MEMORY_TURNS_LIMIT) {
        generateSummary(memory.summary, conversationId, user.uid, originalRequest.chatId)
        .catch(error => {
            console.error(error)
        })
    }

    /***Manejamos informacion que puede ser relevante del usuario***/
    handleUserRelevantInformation(originalRequest.text)
    .catch(error => {
        console.error(error)
    })   
}

const generateSummary = async (currentSummary: string, conversationId: string, uid: string, chatId: number) => {
    try {
        const formatedTurns = MidTermMemory.getInstance().formatTurns(conversationId)
        const result = await run(agents.memory.summary(currentSummary), formatedTurns, {
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
    } catch (error) {
        console.error(error)
        throw new Error('Error al generar summary del chat')
    }
}

const handleUserRelevantInformation = async (userText: string) => {
    try {        
        const result = await run(agents.memory.relevantInfo(), userText)
        
        if(result.finalOutput && result.finalOutput.isRelevant) {
            extractLongTermMemory(result.finalOutput.reasoning)
            .catch(error => {
                console.error(error)
            })
        }
    } catch (error) {
        console.error(error)
        throw new Error('Error obteniendo informacion relevante para el usuario')
    }
}

const extractLongTermMemory = async (text: string) => {
    try {
        const result = await run(agents.memory.ltm(), text)
        console.info(result.finalOutput)

        if(result.finalOutput && result.finalOutput.memories && result.finalOutput.memories.length > 0) {
            console.log('Vamos a guardar memoria')
        }

    } catch (error) {        
        console.error( error)
        throw new Error('Error al extraer memoria largo plazo')
    }
}