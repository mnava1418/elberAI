import { Agent } from '@openai/agents';
import { updateProfile } from '../tools/profile.tools';
import { loadProfile } from '../../services/profile.service';
import userMemoryPrompt from '../prompts/userMemory.prompt';

const userMemoryAgent = async (userId: string) => {
    const currentProfile = await loadProfile(userId);
    const instructions = userMemoryPrompt(currentProfile);

    return Agent.create({
        name: 'user-memory-agent',
        model: 'gpt-4o-mini',
        instructions,
        tools: [updateProfile] as any,
    });
};

export default userMemoryAgent;
