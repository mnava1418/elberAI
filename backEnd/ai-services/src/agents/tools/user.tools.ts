import { RunContext, tool } from '@openai/agents';
import { z } from 'zod';
import { UserContext } from '../../models/elber.model';
import {
    fetchUserData,
    deleteAllUserData as deleteAllUserDataService,
    deleteUserDataByItems,
} from '../../services/user.service';

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
            return await fetchUserData(userContext.userId)
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
            await deleteAllUserDataService(userContext.userId)
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
            const deleted = await deleteUserDataByItems(userContext.userId, dataToDelete)
            return deleted
                ? "He borrado los datos"
                : "No encontre lo que me has pedido en mi memoria"
        } catch (error) {
            return "Hubo un error al olvidar lo que me has pedido."
        }
    }
})
