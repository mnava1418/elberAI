import { Agent } from '@openai/agents';
import { recordMemory, updateMemory } from '../tools/memory.tools';
import { loadUserMemory } from '../../services/userMemory.service';
import userMemoryPrompt from '../prompts/userMemory.prompt';

const userMemoryAgent = async (userId: string) => {
    const currentMemory = await loadUserMemory(userId);
    const instructions = userMemoryPrompt(currentMemory);

    return Agent.create({
        name: 'user-memory-agent',
        model: 'gpt-4o-mini',
        instructions,
        tools: [recordMemory, updateMemory] as any,
    });
};

export default userMemoryAgent;
