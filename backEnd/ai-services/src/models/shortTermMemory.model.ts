import { OpenAIConversationsSession } from "@openai/agents"

type SessionEntry = {
    session: OpenAIConversationsSession,
    expiresAt: number
}

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; //24 hours

class ShortTermMemory {
    private sessions = new Map<string, Map<string, SessionEntry>>()
    
    getSession(uid: string, conversationId: string): OpenAIConversationsSession {
        const now = Date.now()

        if(!this.sessions.has(uid)) {
            this.sessions.set(uid, new Map<string, SessionEntry>())
        }

        const currentSession = this.sessions.get(uid)?.get(conversationId)

        if(currentSession && currentSession.expiresAt > now) {
            currentSession.expiresAt = now + SESSION_TTL_MS
            return currentSession.session
        }

        const newSession = new OpenAIConversationsSession()

        this.sessions.get(uid)?.set(conversationId, {
            session: newSession,
            expiresAt: now + SESSION_TTL_MS
        })

        return newSession
    }
}

export const shortTermMemory = new ShortTermMemory()