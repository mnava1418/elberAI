import { z } from "zod";

const TitleOutputType = z.object({
    changeTitle: z.boolean().describe("true si necesita cambiar el título, false si debe mantener el actual"),
    chatTitle: z.string().describe("nuevo título propuesto (solo si changeTitle es true)"),
    reasoning: z.string().optional().describe("breve explicación de la decisión tomada")
})

export default TitleOutputType