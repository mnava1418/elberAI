import { chatAgent, chatTitleAgent } from "./elber.agent";
import { ltmAgent, relevantInfoAgent, summaryAgent } from "./memory.agent"

const elberAgents = {
    chat: chatAgent,
    chatTitle: chatTitleAgent
}

const memoryAgents = {
    ltm: ltmAgent,
    relevantInfo: relevantInfoAgent,
    summary: summaryAgent
}

const agents = {
    elber: elberAgents,
    memory: memoryAgents
}

export default agents