import { Agent } from "@openai/agents";
import { deleteAllUserData, deleteUserData, getUserData } from "../tools/user.tools";
import { webSearch } from "../tools/search.tools";
import chatPrompt from "../prompts/chat.prompt";
import { ChatPromptContext } from "../../models/prompt.model";
import webSearchSkill from "../skills/web_search.skill";

const chatAgent = (context: ChatPromptContext) => {
    const userTools = [getUserData, deleteAllUserData, deleteUserData]
    const searchTools = [webSearch]
    const tools = [...userTools, ...searchTools]

    const prompt = chatPrompt(context)
    const skill = webSearchSkill()
    const instructions = `${prompt} \n SKILLS DE AGENTE: \n ${skill}`

    const agent = Agent.create({
        name: 'chat-agent',
        model: 'gpt-4o-mini',
        instructions: instructions,
        tools: tools as any       
    })

    return agent
} 

export default chatAgent