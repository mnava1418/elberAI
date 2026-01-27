import { Agent } from "@openai/agents";
import prompts from '../prompts'
import { z } from "zod";

export const summaryAgent = (currentSummary: string) => {
    const agent = Agent.create({
        name: 'Summary Generator',
        model: 'gpt-4o-mini',
        instructions: prompts.memory.summary(currentSummary),        
    })

    return agent
}

export const ltmAgent = () => {    
    const LTMItem = z.object({
        text: z.string().describe('Informacion relevante para el usuario que puede ser usada en el futuro. SIEMPRE en primera persona'),
        type: z.string().describe('tipo de informacion. Puede ser unicamente: goal, plan, preference, constraint, profile u other '),
        importance: z.number().describe('que tan importante puede ser para el usuario'),
        reasoning: z.string().describe('breve explicación de porque esto puede ser relevante para el usuario en un futuro')
    })

    const LTMList = z.object({
        memories: z.array(LTMItem).describe('Lista de posibles datos relevantes para el usuario en un futuro'),
        reasoning: z.string().describe('breve explicación de la decisión que tomaste')
    })

    const agent = Agent.create({
        name: 'Long Term Memory Extractor',
        model: 'gpt-4o-mini',
        instructions: prompts.memory.ltm,
        outputType: LTMList
    })

    return agent
}

export const relevantInfoAgent = () => {
    const IsRelevantType = z.object({
        isRelevant: z.boolean().describe('Indica si el texto proporcionado es información relevante del usuario y puede ser usada en futuras conversaciones'),
        reasoning: z.string().describe('breve explicación de la decisión que tomaste')
    })

    const agent = Agent.create({
        name: 'Relevant User Information Detector',
        model: 'gpt-4o-mini',
        instructions: prompts.memory.relevantInfo,
        outputType: IsRelevantType
    })

    return agent
}