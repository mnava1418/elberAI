import relevantInfoPrompt from "./relevantInfo.prompt";
import chatSummaryPrompt from "./summary.prompt";
import titleGeneratorPrompt from "./title_generator.prompt";

const promptsRegistry: Record<string, string> = {
    titleGeneratorPrompt: titleGeneratorPrompt(),
    chatSummaryPrompt: chatSummaryPrompt(),
    relevantInfoPrompt: relevantInfoPrompt(),
}

export default promptsRegistry