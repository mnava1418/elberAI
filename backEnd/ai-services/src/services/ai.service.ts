import OpenAI from "openai";
import { openaiCfg } from "../config/index.config";

export async function embedText(text: string): Promise<number[]> {
    const input = text.trim();
    const openAi = new OpenAI({apiKey: openaiCfg.cred})

    const res = await openAi.embeddings.create({
        model: 'text-embedding-3-small',
        input,
    });

    return res.data[0].embedding;
}