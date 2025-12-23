import { Agent } from "@openai/agents";
import prompts from '../prompts'

const elberAgent = (name: string) => {
    const agent = Agent.create({
        name: 'Elber',
        model: 'gpt-4.1-mini',
        instructions: prompts.elberPrompt(name),
        modelSettings: {
            maxTokens: 384
        }
    })

    return agent
} 

export default elberAgent