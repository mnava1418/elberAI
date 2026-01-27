import { RunContext, tool } from '@openai/agents';
import { z } from 'zod';
import { UserContext } from '../models/elber.model';
import LongTermMemory from '../models/longTermMemory.model';

export const getUserData = tool({
    name: 'get_user_data',
    description: `
        Regresa información general del usuario en el mismo orden que el usuario fué proporcionandola. 
        Si algun dato se repite, el último registro con esa información es el más relevante.
        Responde a preguntas como: ¿Que sabes de mi?, ¿Que conoces de mi?, Dame datos sobre mi`,
    parameters: z.object({}),
    async execute({}, runContext?: RunContext<UserContext>) {
        const userContext = runContext?.context

        if(!userContext?.userId) {
            return "No pude identificar al usuario"
        }
        
        const ltm = new LongTermMemory()
        const response = await ltm.getUserData(userContext.userId)
        return response
    }
})