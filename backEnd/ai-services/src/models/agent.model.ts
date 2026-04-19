export interface AgentConfig {
    id: string;
    name: string;
    model: string;
    description: string;    
    prompt: string;
    outputType?: string;
    tools?: string[];
    skills?: string[];
}

export type AgentId = 'chat_summary' | 'title_generator' | 'user_info' | 'long_memory'