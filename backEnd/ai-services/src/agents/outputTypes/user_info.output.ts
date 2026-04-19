import { z } from "zod";

const IsRelevantType = z.object({
    isRelevant: z.boolean().describe('Indica si el texto proporcionado es información relevante del usuario y puede ser usada en futuras conversaciones'),
    reasoning: z.string().describe('breve explicación de la decisión que tomaste')
})

export default IsRelevantType