import { embedText } from "../ai.service";
import PgVectorMemoryStore from "./vectoreStore.service";

export type ExtractedMemory = {
    text: string,
    type: string,
    importance: number    
}

export type LTMWriter = {
    userId: string;
    roomId?: string;
    extracted: ExtractedMemory[];
    minImportanceToStore?: number; // ej 3
    dedupeThreshold?: number;      // ej 0.88
}

class LongTermMemoryWriter {
    constructor(private store: PgVectorMemoryStore) {}

    async upsertMany(params: LTMWriter ): Promise<void> {
        const {
            userId,
            roomId,
            extracted,
            minImportanceToStore = 3,
            dedupeThreshold = 0.75,
        } = params;

        for (const mem of extracted) {
            // 1) Filtra memorias poco importantes
            if (mem.importance < minImportanceToStore) continue;

            // 2) Embedding del texto
            const embedding = await embedText(mem.text);

            // 3) Dedupe: si ya existe algo MUY similar, lo actualizamos
            const dup = await this.store.findNearDuplicate({
                userId,
                candidateEmbedding: embedding,
                threshold: dedupeThreshold,
            });

            if (dup) {
                await this.store.update({
                    id: dup.id,
                    type: mem.type,
                    importance: mem.importance,
                    text: mem.text,
                    embedding,
                });
                continue;
            }

            // 4) Si no hay duplicado cercano, insertamos un nuevo recuerdo
            await this.store.insert({
                userId,
                roomId: roomId ?? null,
                type: mem.type,
                importance: mem.importance,
                text: mem.text,
                embedding,
            });
        }
    }
}

export default LongTermMemoryWriter