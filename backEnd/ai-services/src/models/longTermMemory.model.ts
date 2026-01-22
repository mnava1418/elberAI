import LongTermMemoryReader from "../services/ltm/ltmReader.service";
import PgVectorMemoryStore from "../services/ltm/vectoreStore.service";
import { MemoryHit } from "./elber.model";

class LongTermMemory {
    private static instance: LongTermMemory

    static getInstance(): LongTermMemory {
        if(!LongTermMemory.instance) {
            LongTermMemory.instance = new LongTermMemory()
        }

        return LongTermMemory.instance
    }

    async getLTM(userId: string, userText: string): Promise<string> {
        try {
            const store = new PgVectorMemoryStore();
            const reader = new LongTermMemoryReader(store);

            const hits = await reader.retrieve({
                userId,
                queryText: userText,
                topK: 8,
                minImportance: 2,
            });
            
            const ltmBlock = this.buildLtmBlock(hits, { minScore: 0.75, maxItems: 8 });
            return ltmBlock    
        } catch (error) {
            console.error('Error obteniendo long term memory', error)
            return ''
        }        
    }

    buildLtmBlock(memories: MemoryHit[], opts?: {
        minScore?: number;
        maxItems?: number;
    }): string {
        const minScore = opts?.minScore ?? 0.75;
        const maxItems = opts?.maxItems ?? 8;

        const selected = memories
            .filter(m => m.score >= minScore)
            .slice(0, maxItems);

        if (!selected.length) return "";

        const lines = selected.map(m => `- ${m.text}`);

        return `
        MEMORIA LARGA DEL USUARIO (hechos recordados; si algo contradice al usuario hoy, dale prioridad a lo que diga hoy):
        ${lines.join("\n")}
        `.trim();
    }
}

export default LongTermMemory