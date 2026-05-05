import ltmPrompt from "./longTermMemory.prompt";
import relevantInfoPrompt from "./relevantInfo.prompt";
import chatSummaryPrompt from "./summary.prompt";
import titleGeneratorPrompt from "./title_generator.prompt";
import userMemoryPrompt from "./userMemory.prompt";

const promptsRegistry: Record<string, string> = {
    titleGeneratorPrompt: titleGeneratorPrompt(),
    chatSummaryPrompt: chatSummaryPrompt(),
    relevantInfoPrompt: relevantInfoPrompt(),
    ltmPrompt: ltmPrompt(),
    userMemoryPrompt: userMemoryPrompt()
}

export default promptsRegistry