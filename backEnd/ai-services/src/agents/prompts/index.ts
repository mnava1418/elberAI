import chatSummaryPrompt from "./summary.prompt";
import titleGeneratorPrompt from "./title_generator.prompt";

const promptsRegistry: Record<string, string> = {
    titleGeneratorPrompt: titleGeneratorPrompt(),
    chatSummaryPrompt: chatSummaryPrompt(),
}

export default promptsRegistry