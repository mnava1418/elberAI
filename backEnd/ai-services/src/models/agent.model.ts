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
