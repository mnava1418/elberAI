import { OpenAIConversationsSession } from "@openai/agents"

type SessionEntry = {
    session: OpenAIConversationsSession
}

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
        const currentSession = this.sessions.get(conversationId)

        if(currentSession) {
            return currentSession.session
        }

        const newSession = new OpenAIConversationsSession()
        this.sessions.set(conversationId, { session: newSession })

        return newSession
    }

    deleteSession(conversationId: string) {
        if(this.sessions.has(conversationId)) {
            this.sessions.delete(conversationId)
        }
    }

    deleteUserSessions(uid: string) {
        for (const conversationId of this.sessions.keys()) {
            if (conversationId.startsWith(uid)) {
                this.sessions.delete(conversationId)
            }
        }
    }
}

export default ShortTermMemory
