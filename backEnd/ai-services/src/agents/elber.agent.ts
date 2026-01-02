import { Agent } from "@openai/agents";
import prompts from '../prompts'

export const elberAgent = (name: string) => {
    const agent = Agent.create({
        name: 'Elber',
        model: 'gpt-4.1-mini',
        instructions: prompts.elberPrompt(name),        
    })

    return agent
} 

export const chatTitleAgent = () => {
    const agent = Agent.create({
        name: 'Title Generator',
        model: 'gpt-4.1-mini',
        instructions: prompts.chatTitlePrompt
    })

    return agent
}