import { z } from "zod";

const LTMItem = z.object({
    text: z.string().describe('Informacion relevante para el usuario que puede ser usada en el futuro. SIEMPRE en primera persona'),
    type: z.string().describe('tipo de informacion. Puede ser unicamente: profile, preference, constraint, goal, plan, project, event u other'),
    importance: z.number().describe('que tan importante puede ser para el usuario (1-5)'),
    reasoning: z.string().describe('breve explicación de porque esto puede ser relevante para el usuario en un futuro'),
    subject: z.string().nullable().describe('clave canónica en snake_case para hechos de perfil/preferencia (ej: "birthday", "workplace"). null para tipos episódicos como goal, plan, project, event')
})

const LTMList = z.object({
    memories: z.array(LTMItem).describe('Lista de posibles datos relevantes para el usuario en un futuro'),
    reasoning: z.string().describe('breve explicación de la decisión que tomaste')
})

export default LTMList