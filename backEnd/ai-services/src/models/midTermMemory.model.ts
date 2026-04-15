import { getChatSummary } from "../services/chat.service";
import { MemoryEntry, TurnChat } from "./elber.model";
import { pgPool } from "../services/ltm/ltmDB.service";
import * as db from "../db/queries/memory.queries";

// Presupuesto de tokens para los turnos en cache antes de disparar un summary.
// ~4 chars por token (aprox). 2500 tokens ≈ 10000 chars ≈ 8-10 turnos moderados.
const TOKEN_BUDGET = 2500

const estimateTokens = (text: string): number => Math.ceil(text.length / 4)

class MidTermMemory {
    private cache = new Map<string, MemoryEntry>()
    private static instance: MidTermMemory

    static getInstance(): MidTermMemory {
        if (!MidTermMemory.instance) {
            MidTermMemory.instance = new MidTermMemory()
        }
        return MidTermMemory.instance
    }

    // ── Lectura ────────────────────────────────────────────────────────────

    async getMemory(conversationId: string, uid: string, chatId: number): Promise<MemoryEntry> {
        const cached = this.cache.get(conversationId)
        if (cached) return cached

        // Cold-start: cargamos summary de Firebase y turnos pendientes de DB en paralelo
        const [summary, turns] = await Promise.all([
            getChatSummary(uid, chatId).catch(() => ''),
            this.loadTurns(conversationId)
        ])

        const tokenCount = turns.reduce(
            (acc, t) => acc + estimateTokens(t.userMessage) + estimateTokens(t.assistantMessage),
            0
        )

        const entry: MemoryEntry = { summary, turns, tokenCount, state: 'COLLECTING' }
        this.cache.set(conversationId, entry)
        return entry
    }

    getSummary(conversationId: string): string {
        return this.cache.get(conversationId)?.summary ?? ''
    }

    formatTurns(conversationId: string): string {
        const memory = this.cache.get(conversationId)
        if (!memory) return ''

        return memory.turns
            .map((t, i) => `Turno ${i + 1}\n Usuario: ${t.userMessage}\n Elber: ${t.assistantMessage}`)
            .join('\n\n')
    }

    formatLastTurns(conversationId: string, n: number): string {
        const memory = this.cache.get(conversationId)
        if (!memory) return ''

        const lastTurns = memory.turns.slice(-n)
        return lastTurns
            .map((t, i) => `Usuario: ${t.userMessage}\n Elber: ${t.assistantMessage}`)
            .join('\n\n')
    }

    // ── Escritura ──────────────────────────────────────────────────────────

    async addTurn(
        conversationId: string,
        uid: string,
        chatId: number,
        userMessage: string,
        assistantMessage: string
    ): Promise<void> {
        const memory = this.cache.get(conversationId)
        if (!memory) return

        const tokenEstimate = estimateTokens(userMessage) + estimateTokens(assistantMessage)

        // Write-through: primero DB, luego cache
        await pgPool.query(db.insertTurn, [
            conversationId, uid, chatId, userMessage, assistantMessage, tokenEstimate
        ])

        memory.turns.push({ userMessage, assistantMessage })
        memory.tokenCount += tokenEstimate
    }

    async updateSummary(conversationId: string, newSummary: string): Promise<void> {
        const memory = this.cache.get(conversationId)
        if (!memory) return

        // Limpiamos turnos de DB ahora que están comprimidos en el summary
        await pgPool.query(db.deleteTurnsByConversation, [conversationId])

        memory.summary = newSummary
        memory.turns = []
        memory.tokenCount = 0
        memory.state = 'COLLECTING'
    }

    // ── State machine ──────────────────────────────────────────────────────

    shouldSummarize(conversationId: string): boolean {
        const memory = this.cache.get(conversationId)
        if (!memory) return false
        return memory.tokenCount >= TOKEN_BUDGET && memory.state === 'COLLECTING'
    }

    startSummarizing(conversationId: string): void {
        const memory = this.cache.get(conversationId)
        if (memory) memory.state = 'SUMMARIZING'
    }

    resetToCollecting(conversationId: string): void {
        const memory = this.cache.get(conversationId)
        if (memory) memory.state = 'COLLECTING'
    }

    // ── Limpieza ───────────────────────────────────────────────────────────

    deleteMemory(conversationId: string): void {
        this.cache.delete(conversationId)
    }

    async deleteUserMemory(uid: string): Promise<void> {
        for (const conversationId of this.cache.keys()) {
            if (conversationId.startsWith(uid)) {
                this.cache.delete(conversationId)
            }
        }
        await pgPool.query(db.deleteTurnsByUser, [uid])
    }

    // ── Helpers privados ───────────────────────────────────────────────────

    private async loadTurns(conversationId: string): Promise<TurnChat[]> {
        const result = await pgPool.query(db.getTurnsByConversation, [conversationId])
        return result.rows.map((row: any) => ({
            userMessage: row.user_message,
            assistantMessage: row.assistant_message
        }))
    }
}

export default MidTermMemory
