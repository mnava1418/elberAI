import chatPrompt from "./chat.prompt";
import chatTitlePrompt from "./chatTitle.prompt";
import summaryPrompt from "./summary.prompt";
import ltmPrompt from "./longTermMemory.prompt";
import relevantInfoPrompt from "./relevantInfo.prompt";

const elberPrompts = {
    chat: chatPrompt,
    chatTitle: chatTitlePrompt
}

const memoryPrompts = {
    summary: summaryPrompt,
    ltm: ltmPrompt,
    relevantInfo: relevantInfoPrompt
}

const prompts = {
    elber: elberPrompts,
    memory: memoryPrompts
}

export default prompts