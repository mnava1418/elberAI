import { ElberResponse } from "../models/elber.model";
import MidTermMemory from "../models/midTermMemory.model";
import ShortTermMemory from "../models/shortTermMemory.model";
import { updateChatSummary } from "./chat.service";
import { run } from '@openai/agents';
import agents from "../agents";
import LongTermMemory from "../models/longTermMemory.model";

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
    } else {
        /***Manejamos informacion que puede ser relevante del usuario***/
        handleUserRelevantInformation(originalRequest.text, user.uid, originalRequest.chatId)
        .catch(error => {
            console.error(error)
        })   
    }
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

            extractLongTermMemory(result.finalOutput, uid, chatId)
            .catch(error => {
                console.error(error)
            })
        }
    } catch (error) {
        console.error(error)
        throw new Error('Error al generar summary del chat')
    }
}

const handleUserRelevantInformation = async (userText: string, uid: string, chatId: number) => {
    try {        
        const result = await run(agents.memory.relevantInfo(), userText)
        console.info(result.finalOutput)
        
        if(result.finalOutput && result.finalOutput.isRelevant) {
            extractLongTermMemory(`${result.finalOutput.reasoning}. ${userText}`, uid, chatId)
            .catch(error => {
                console.error(error)
            })
        }
    } catch (error) {
        console.error(error)
        throw new Error('Error obteniendo informacion relevante para el usuario')
    }
}

const extractLongTermMemory = async (text: string, uid: string, chatId: number) => {
    try {
        const result = await run(agents.memory.ltm(), text)
        console.info(result.finalOutput)

        if(result.finalOutput && result.finalOutput.memories && result.finalOutput.memories.length > 0) {
            const ltm = new LongTermMemory()
            ltm.ingestLTM(uid, chatId.toString(), result.finalOutput.memories)
        }

    } catch (error) {        
        console.error( error)
        throw new Error('Error al extraer memoria largo plazo')
    }
}