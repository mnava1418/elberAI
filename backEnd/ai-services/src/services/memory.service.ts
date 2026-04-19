import { ElberResponse } from "../models/elber.model";
import MidTermMemory from "../models/midTermMemory.model";
import ShortTermMemory from "../models/shortTermMemory.model";
import { updateChatSummary } from "./chat.service";
import { run } from '@openai/agents';
import agents from "../agents";
import LongTermMemory from "../models/longTermMemory.model";
import { getAgents } from "../loaders/agents.loader";

// ── Entry point ────────────────────────────────────────────────────────────────

export const handleMemory = async (elberResponse: ElberResponse): Promise<void> => {
    const { originalRequest, agentResponse, conversationId } = elberResponse
    const { user } = originalRequest

    // 1. Persistir turno (write-through cache → DB)
    await MidTermMemory.getInstance().addTurn(
        conversationId,
        user.uid,
        originalRequest.chatId,
        originalRequest.text,
        agentResponse
    )

    // 2. Extracción LTM en cada turno (pipeline independiente del ciclo de summary)
    // Pasamos los últimos 3 turnos para que el agente tenga contexto conversacional
    // (ej: si el usuario responde "El 30 de abril" a "¿Cuándo es tu cumpleaños?")
    const recentContext = MidTermMemory.getInstance().formatLastTurns(conversationId, 3)
    handleUserRelevantInformation(recentContext, user.uid, originalRequest.chatId)
        .catch(error => console.error('Error extrayendo LTM por turno:', error))

    // 3. Verificar si corresponde generar un nuevo summary (state machine)
    const mtm = MidTermMemory.getInstance()
    if (mtm.shouldSummarize(conversationId)) {
        mtm.startSummarizing(conversationId)

        generateSummary(conversationId, user.uid, originalRequest.chatId)
            .catch(error => {
                // Si falla, volvemos a COLLECTING para que el próximo turno pueda reintentar
                mtm.resetToCollecting(conversationId)
                console.error('Error generando summary MTM:', error)
            })
    }
}

// ── Summary rolling ────────────────────────────────────────────────────────────

const generateSummary = async (conversationId: string, uid: string, chatId: number): Promise<void> => {
    const mtm = MidTermMemory.getInstance()
    const formattedTurns = mtm.formatTurns(conversationId)
    const currentSummary = mtm.getSummary(conversationId)

    const context = `
        CONTEXTO ACTUAL:
        - Resumen previo: "${currentSummary || 'Sin resumen previo'}"

        TURNOS:
            ${formattedTurns}
    `
    
    const chat_summary_agent = getAgents('chat_summary')

    if(!chat_summary_agent) {
        throw new Error(' Chat Summary agent not available.')
    }

    const result = await run(chat_summary_agent, context, { maxTurns: 3 })

    if (!result.finalOutput) {
        mtm.resetToCollecting(conversationId)
        return
    }

    await mtm.updateSummary(conversationId, result.finalOutput)

    // Limpiar STM para forzar contexto fresco en el próximo turno
    ShortTermMemory.getInstance().deleteSession(conversationId)

    updateChatSummary(uid, chatId, result.finalOutput)
        .catch(error => console.error('Error actualizando summary en Firebase:', error))

    // LTM extraction del summary comprimido
    extractLongTermMemory(result.finalOutput, uid, chatId)
        .catch(error => console.error('Error extrayendo LTM desde summary:', error))
}

// ── LTM pipelines ──────────────────────────────────────────────────────────────

const handleUserRelevantInformation = async (conversationContext: string, uid: string, chatId: number): Promise<void> => {
    const result = await run(agents.memory.relevantInfo(), conversationContext)
    console.info(result.finalOutput)

    if (result.finalOutput?.isRelevant) {
        await extractLongTermMemory(`${result.finalOutput.reasoning}. ${conversationContext}`, uid, chatId)
    }
}

const extractLongTermMemory = async (text: string, uid: string, chatId: number): Promise<void> => {
    const result = await run(agents.memory.ltm(), text)
    console.info(result.finalOutput)

    if (result.finalOutput?.memories?.length > 0) {
        const ltm = new LongTermMemory()
        await ltm.ingestLTM(uid, chatId.toString(), result.finalOutput.memories)
    }
}
