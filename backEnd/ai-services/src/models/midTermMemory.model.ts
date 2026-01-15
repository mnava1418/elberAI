import { getChatSummary } from "../services/chat.service";

type MemoryEntry = {
    summary: string
    turnsCount: number
    expiresAt: number
}

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
            return this.getCachedMemory(conversationId, currMemory)
        } else {
            return await this.getStoredMemory(conversationId, uid, chatId)
        }
    }

    private getCachedMemory(conversationId: string, currMemory: MemoryEntry): MemoryEntry {
        const now = Date.now()

        if(currMemory.expiresAt > now) {
            currMemory.expiresAt = now + SESSION_TTL_MS
            return currMemory
        }
        
        return this.getNewMemory(conversationId, '')
    }

    private async getStoredMemory(conversationId: string, uid: string, chatId: number): Promise<MemoryEntry> {
        const summary = await getChatSummary(uid, chatId)
        .catch(() => '')
        
        return this.getNewMemory(conversationId, summary)
    }

    private getNewMemory(conversationId: string, summary: string): MemoryEntry {
        const now = Date.now()
        const memory: MemoryEntry = {
            summary,
            expiresAt: now + SESSION_TTL_MS,
            turnsCount: 0
        }

        this.memories.set(conversationId, memory)
        return memory
    }
}

export default MidTermMemory