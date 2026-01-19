import { Agent } from "@openai/agents";
import prompts from '../prompts'
import { z } from "zod";

export const elberAgent = (name: string, summary: string) => {
    const agent = Agent.create({
        name: 'Elber',
        model: 'gpt-4o-mini',
        instructions: prompts.elberPrompt(name, summary),        
    })

    return agent
} 

export const chatTitleAgent = (title: string, lastMessage: string, conversationContext?: string) => {
     const TitleEvent = z.object({
        changeTitle: z.boolean().describe("true si necesita cambiar el título, false si debe mantener el actual"),
        chatTitle: z.string().describe("nuevo título propuesto (solo si changeTitle es true)"),
        reasoning: z.string().optional().describe("breve explicación de la decisión tomada")
    })

    const agent = Agent.create({
        name: 'Title Generator',
        model: 'gpt-4o-mini',
        instructions: prompts.chatTitlePrompt(title, lastMessage, conversationContext),
        outputType: TitleEvent
    })

    return agent
}