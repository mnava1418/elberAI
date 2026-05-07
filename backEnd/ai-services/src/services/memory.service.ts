import { ElberRequest, ElberResponse, UserContext } from "../models/elber.model";
import MidTermMemory from "../models/midTermMemory.model";
import ShortTermMemory from "../models/shortTermMemory.model";
import { updateChatSummary } from "./chat.service";
import { run } from '@openai/agents';
import { getAgents } from "../loaders/agents.loader";
import userMemoryAgent from "../agents/builders/userMemory.agent";

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
    handleUserRelevantInformation(originalRequest, recentContext, user.uid, originalRequest.chatId)
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
}

const handleUserRelevantInformation = async (originalRequest: ElberRequest, conversationContext: string, uid: string, chatId: number): Promise<void> => {
    const {timeZone, location} = originalRequest
    const userContext: UserContext = {
        userId: uid,
        timeZone,
        location
    }

    const agent = await userMemoryAgent(uid)
    await run(agent, conversationContext, {context: userContext})
}

// ── Episodic memory CRUD ───────────────────────────────────────────────────────

import { embedText } from './ai.service'
import PgVectorMemoryStore from './ltm/vectoreStore.service'

export const saveMemoryEntry = async (userId: string, memory: string): Promise<string> => {
    const store = new PgVectorMemoryStore()
    const embedding = await embedText(memory)

    const duplicate = await store.findNearDuplicate({ userId, candidateEmbedding: embedding, threshold: 0.85 })
    if (duplicate) return 'Recuerdo guardado correctamente.'

    await store.insert({ userId, type: 'event', importance: 4, subject: null, text: memory, embedding })
    return 'Recuerdo guardado correctamente.'
}

export const searchMemoryEntries = async (userId: string, query: string): Promise<string> => {
    const store = new PgVectorMemoryStore()
    const queryEmbedding = await embedText(query)
    const results = await store.search({ userId, queryEmbedding, topK: 5, minImportance: 1 })

    if (!results.length) return 'No encontré recuerdos relacionados con esa búsqueda.'

    return results
        .map((r) => {
            const date = new Date(r.updatedAt).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            })
            return `- ${r.text} (${date})`
        })
        .join('\n')
}

export const updateMemoryEntry = async (userId: string, original: string, correction: string): Promise<string> => {
    const store = new PgVectorMemoryStore()
    const originalEmbedding = await embedText(original)
    const results = await store.search({ userId, queryEmbedding: originalEmbedding, topK: 1, minImportance: 1 })

    if (!results.length || results[0].score < 0.5) {
        return 'No encontré un recuerdo que coincida con esa descripción.'
    }

    const newEmbedding = await embedText(correction)
    await store.update({ id: results[0].id, text: correction, embedding: newEmbedding })
    return `Recuerdo actualizado: "${correction}"`
}

export const deleteMemoryEntry = async (userId: string, description: string): Promise<string> => {
    const store = new PgVectorMemoryStore()
    const embedding = await embedText(description)
    const results = await store.search({ userId, queryEmbedding: embedding, topK: 1, minImportance: 1 })

    if (!results.length || results[0].score < 0.5) {
        return 'No encontré un recuerdo que coincida con esa descripción.'
    }

    await store.deleteMemories(userId, [results[0].id])
    return `He olvidado: "${results[0].text}"`
}

export const clearAllMemoryEntries = async (userId: string): Promise<string> => {
    const store = new PgVectorMemoryStore()
    const count = await store.deleteAll(userId)
    return `He borrado ${count} recuerdo(s) de tu historial.`
}
