import { Agent } from "@openai/agents";
import { webSearch } from "../tools/search.tools";
import { getWeather, geocodeLocation } from "../tools/weather.tools";
import { saveMemory, searchMemory, updateMemory, deleteMemory, clearAllMemories } from "../tools/memory.tools";
import chatPrompt from "../prompts/chat.prompt";
import { ChatPromptContext } from "../../models/prompt.model";
import webSearchSkill from "../skills/web_search.skill";
import memorySkill from "../skills/memory.skill";

const chatAgent = (context: ChatPromptContext) => {
    const searchTools = [webSearch]
    const weatherTools = [getWeather, geocodeLocation]
    const memoryTools = [saveMemory, searchMemory, updateMemory, deleteMemory, clearAllMemories]
    const tools = [...searchTools, ...weatherTools, ...memoryTools]

    const prompt = chatPrompt(context)
    const instructions = `
        ${prompt} \n 
        SKILLS DE AGENTE: \n 
        ${webSearchSkill()} \n 
        ${memorySkill()}
    `

    const agent = Agent.create({
        name: 'chat-agent',
        model: 'gpt-4o-mini',
        instructions: instructions,
        tools: tools as any       
    })

    return agent
} 

export default chatAgent