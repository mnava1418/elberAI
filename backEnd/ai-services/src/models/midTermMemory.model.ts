import { getChatSummary } from "../services/chat.service";
import { MemoryEntry } from "./elber.model";

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; //24 hours

class MidTermMemory {
    private memories = new Map<string, MemoryEntry>()
    private static instance: MidTermMemory

    static getInstance(): MidTermMemory {
        if(!MidTermMemory.instance) {
            MidTermMemory.instance = new MidTermMemory()
        }

        return MidTermMemory.instance
    }

    async getMemory(conversationId: string, uid: string, chatId: number): Promise<MemoryEntry> {
        const currMemory = this.memories.get(conversationId)

        if(currMemory) {
            return currMemory
        } 

        const summary = await getChatSummary(uid, chatId)
        .catch(() => '')

        const newMemory: MemoryEntry = {
            summary,
            turnsCount: 0,
            turns: []
        }

        this.memories.set(conversationId, newMemory)
        return newMemory
    }

    addTurn(conversationId: string, userMessage: string, assistantMessage: string) {
        if(this.memories.has(conversationId)) {
            const memory = this.memories.get(conversationId)!
            memory.turnsCount += 1
            memory.turns.push({
                assistantMessage,
                userMessage
            })
        }
    }

    updateSummary(conversationId: string, newSummary: string) {
        if(this.memories.has(conversationId)) {
            const memory = this.memories.get(conversationId)!
            memory.summary = newSummary
            memory.turnsCount = 0
            memory.turns = []
        }
    }

    formatTurns(conversationId: string) {
        if(this.memories.has(conversationId)) {
            const memory = this.memories.get(conversationId)!
            return memory.turns
            .map((t, i) => `Turno ${i + 1}\n Usuario: ${t.userMessage}\n Elber: ${t.assistantMessage}`)
            .join("\n\n");
        }

        return ''
    }
}

export default MidTermMemory