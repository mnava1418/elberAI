import ltmPrompt from "./longTermMemory.prompt";
import relevantInfoPrompt from "./relevantInfo.prompt";
import chatSummaryPrompt from "./summary.prompt";
import titleGeneratorPrompt from "./title_generator.prompt";

const promptsRegistry: Record<string, string> = {
    titleGeneratorPrompt: titleGeneratorPrompt(),
    chatSummaryPrompt: chatSummaryPrompt(),
    relevantInfoPrompt: relevantInfoPrompt(),
    ltmPrompt: ltmPrompt()
}

export default promptsRegistry