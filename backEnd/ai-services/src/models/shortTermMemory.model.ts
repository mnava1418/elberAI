import { OpenAIConversationsSession } from "@openai/agents"

type SessionEntry = {
    session: OpenAIConversationsSession,
    expiresAt: number
}

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; //24 hours

class ShortTermMemory {
    private sessions = new Map<string, SessionEntry>()
    private static instance: ShortTermMemory

    static getInstance(): ShortTermMemory {
        if(!ShortTermMemory.instance) {
            ShortTermMemory.instance = new ShortTermMemory()
        }

        return ShortTermMemory.instance
    }
    
    getSession(conversationId: string): OpenAIConversationsSession {
        const now = Date.now()

        const currentSession = this.sessions.get(conversationId)

        if(currentSession && currentSession.expiresAt > now) {
            currentSession.expiresAt = now + SESSION_TTL_MS
            return currentSession.session
        }

        const newSession = new OpenAIConversationsSession()

        this.sessions.set(conversationId, {
            session: newSession,
            expiresAt: now + SESSION_TTL_MS
        })

        return newSession
    }

    deleteSession(conversationId: string) {
        if(this.sessions.has(conversationId)) {
            this.sessions.delete(conversationId)
        }
    }

    deleteOldSessions() {
        const now = Date.now()

        this.sessions.forEach((entry, conversationId) => {
            if(entry.expiresAt <= now) {
                this.sessions.delete(conversationId)
            }
        })
    }
}

export default ShortTermMemory