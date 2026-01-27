import LongTermMemoryReader from "../services/ltm/ltmReader.service";
import LongTermMemoryWriter, { ExtractedMemory } from "../services/ltm/ltmWriter.service";
import PgVectorMemoryStore from "../services/ltm/vectoreStore.service";
import { MemoryHit } from "./elber.model";

class LongTermMemory {
    async getMemory(userId: string, userText: string): Promise<string> {
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

    async getUserData(userId: string) {
        const store = new PgVectorMemoryStore();
        const reader = new LongTermMemoryReader(store);
        
        const data = await reader.retriveAll(userId)
        let lines = data.map((m, index) => `${index + 1}: ${m.text}`);

        const longList = lines.length > 10
        lines = lines.slice(0, 10)

        if(lines.length === 0) return 'No se nada de ti'

        return `
            ${longList ? 'Se varias cosas de ti pero esto es lo más reciente. Si quieres otra cosa pregúntame al más especifico.' : 'Esto es lo que se de ti: \n'}
            ${lines.join("\n")}
        `.trim()
    }

    buildLtmBlock(memories: MemoryHit[], opts?: {
        minScore?: number;          // default 0.75
        minProfileScore?: number;   // default 0.35
        maxItems?: number;          // default 8
        fallbackTopN?: number;      // default 1
        fallbackMinScore?: number;  // default 0.30
    }): string {
        const minScore = opts?.minScore ?? 0.75;
        const minProfileScore = opts?.minProfileScore ?? 0.35;
        const maxItems = opts?.maxItems ?? 8;

        const fallbackTopN = opts?.fallbackTopN ?? 1;
        const fallbackMinScore = opts?.fallbackMinScore ?? 0.30;

        // 1) Primero seleccionamos por umbrales “inteligentes”
        const strong = memories.filter((m) => {
            const t = m.type ?? "other";
            const threshold = t === "profile" ? minProfileScore : minScore;
            return m.score >= threshold;
        });

        // Ordena por score desc para quedarte con lo mejor
        strong.sort((a, b) => b.score - a.score);

        let selected = strong.slice(0, maxItems);

        // 2) Fallback: si no pasó nada (caso "¿dónde trabajo?"), mete los mejores N
        // pero solo si su score no es demasiado bajo (para no contaminar con basura)
        if (!selected.length && memories.length) {
            const best = [...memories].sort((a, b) => b.score - a.score);
            selected = best.filter(m => m.score >= fallbackMinScore).slice(0, fallbackTopN);
        }

        if (!selected.length) return "";

        // 3) Formateo
        const lines = selected.map((m) => `- ${m.text}`);

        return `
            MEMORIA LARGA DEL USUARIO (hechos recordados; si algo contradice al usuario hoy, dale prioridad a lo que diga hoy):
            ${lines.join("\n")}
            `.trim();
    }

    async ingestLTM(userId: string, roomId: string, extracted: ExtractedMemory[]) {                 
        const store = new PgVectorMemoryStore();
        const writer = new LongTermMemoryWriter(store);

        await writer.upsertMany({
            userId,
            roomId,
            extracted,
            minImportanceToStore: 3,
            dedupeThreshold: 0.70,
        });
    }
}

export default LongTermMemory