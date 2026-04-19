import fs from 'fs';
import path from 'path';
import { Agent } from '@openai/agents';
import { AgentConfig, AgentId } from '../models/agent.model';
import outputTypesRegistry from '../agents/outputTypes';
import toolRegistry from '../agents/tools';
import promptsRegistry from '../agents/prompts';

let agents: Record<string, Agent<unknown, any>> = {};

const getInstructions = (config: AgentConfig) => {
    const promptKey = config.prompt as keyof typeof promptsRegistry;
    
    if (!(promptKey in promptsRegistry)) {
        throw new Error(`[agents.loader] Prompt "${config.prompt}" not found in registry (agent: ${config.id})`);
    }
    
    return promptsRegistry[promptKey]
}

const getTools = (config: AgentConfig) => {
    if( config.tools) {
        const tools = config.tools
            .filter(toolName => {
                if (!toolRegistry[toolName]) {
                    console.warn(`[agents.loader] Tool "${toolName}" not found in registry (agent: ${config.id})`);
                    return false;
                }
                return true;
            })
            .map(toolName => toolRegistry[toolName]);
        return tools
    } else {
        return []
    }
}

const getOutputType = (config: AgentConfig) => {
    const outputType = config.outputType
        ? outputTypesRegistry[config.outputType] ?? (() => { throw new Error(`[agents.loader] outputType "${config.outputType}" not found (agent: ${config.id})`) })()
        : undefined;

    return outputType
}

const loadAgents = (): void => {
    const agentsDir = path.resolve(__dirname, '../agents/definitions');
    const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.agent.json'));

    files.forEach(file => {
        const raw = fs.readFileSync(path.join(agentsDir, file), 'utf-8');
        const config: AgentConfig = JSON.parse(raw);
        
        const instructions = getInstructions(config);
        const tools = getTools(config);
        const outputType = getOutputType(config);

        const agent = Agent.create({
            name: config.name,
            model: config.model,
            instructions,
            tools,
            ...(outputType && { outputType }),
        });

        console.info(`[agents.loader] Loaded agent: ${config.id}`);
        agents[config.id] = agent;
    })

    console.info(`[agents.loader] ${Object.keys(agents).length} agent(s) loaded`);
};

export const getAgents = (id: AgentId): Agent<unknown, any> | undefined => agents[id]

export default loadAgents;
