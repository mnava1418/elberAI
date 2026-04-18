import titleGeneratorPrompt from "./title_generator.prompt";

const promptsRegistry: Record<string, string> = {
    titleGeneratorPrompt: titleGeneratorPrompt()
}

export default promptsRegistry