import { RunContext, tool } from '@openai/agents';
import { z } from 'zod';
import { UserContext } from '../models/elber.model';
import LongTermMemory from '../models/longTermMemory.model';

export const getUserData = tool({
    name: 'get_user_data',
    description: `
        Obtiene y retorna toda la información personal almacenada del usuario.
        La información se presenta en orden cronológico (más reciente primero).
        En caso de datos duplicados, prevalece la información más reciente.
        
        **Se ejecuta cuando el usuario pregunta:**
        - ¿Qué sabes de mí?
        - ¿Qué información tienes sobre mí?
        - Dame mis datos personales
        - Cuéntame lo que recuerdas de mí
        - ¿Qué conoces de mi perfil?
    `,
    parameters: z.object({}),
    async execute({}, runContext?: RunContext<UserContext>) {
        const userContext = runContext?.context

        if(!userContext?.userId) {
            return "No pude identificar al usuario"
        }
        
        try {
            const ltm = new LongTermMemory()
            let data = await ltm.getUserData(userContext.userId)
            data = data.slice(0,10)
            return data            
        } catch (error) {
            return "Hubo un error al buscar información del usuario."   
        }        
    }
})

export const deleteAllUserData = tool({
    name: 'delete_all_user_data',
    description: `
        Elimina permanentemente toda la información personal almacenada del usuario.
        Esta acción es irreversible y borra completamente la memoria a largo plazo.
        
        **Se ejecuta cuando el usuario solicita:**
        - Olvida todo lo que sabes de mí
        - Borra toda tu memoria sobre mí
        - Elimina mis datos personales
        - Reinicia mi perfil
        - Quiero empezar de cero
        - Borra mi historial personal
    `,
    parameters: z.object({}),
    async execute({}, runContext?: RunContext<UserContext>) {
        const userContext = runContext?.context

        if(!userContext?.userId) {
            return "No pude identificar al usuario"
        }

        try {
            const ltm = new LongTermMemory()    
            await ltm.resetMemory(userContext.userId)
            return 'He borrado toda la memoria'
        } catch (error) {
            return 'Hubo un error al borrar la memoria'
        }       
    }
})

export const deleteUserData = tool({
    name: 'delete_user_Data',
    description: `
        Elimina información específica del usuario de la memoria a largo plazo.
        Permite borrar datos particulares sin eliminar todo el perfil del usuario.
        
        **Se ejecuta cuando el usuario solicita:**
        - Olvida dónde trabajo y dónde vivo
        - Borra mi información laboral
        - Elimina mis datos de contacto
        - Olvida mi edad y mi cumpleaños
        - Borra que tengo mascotas
        - Elimina información sobre mi familia
    `,
    parameters: z.object({
        dataToDelete: z.array(z.string()).describe('Lista de elementos específicos que el usuario quiere borrar de la memoria a largo plazo.')
    }),
    async execute({ dataToDelete }, runContext?: RunContext<UserContext>) {
        const userContext = runContext?.context

        if(!userContext?.userId) {
            return "No pude identificar al usuario"
        }

        if(!dataToDelete || dataToDelete.length === 0) {
            return "No se especificaron datos para borrar"
        }

        try {
            let memoryIds: string[] = []
            const ltm = new LongTermMemory()    
            
            for (let i = 0; i < dataToDelete.length; i++) {
                const memories = await ltm.getMemory(userContext.userId, dataToDelete[i])
                const ids = memories.map((memory) => memory.id)
                memoryIds = [...memoryIds, ...ids]
            }

            if(memoryIds.length > 0) {
                await ltm.deleteMemories(userContext.userId, memoryIds)
                return "He borrado los datos"
            } else {
                return "No encontre lo que me has pedido en mi memoria"
            }            
        } catch (error) {
            return "Hubo un error al olvidar lo que me has pedido."
        }
    }
})