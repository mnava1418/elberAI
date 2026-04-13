import { embedText } from "../ai.service";
import PgVectorMemoryStore from "./vectoreStore.service";

export type ExtractedMemory = {
    text: string,
    type: string,
    importance: number,
    subject?: string | null
}

export type LTMWriter = {
    userId: string;
    roomId?: string;
    extracted: ExtractedMemory[];
    minImportanceToStore?: number;
    dedupeThreshold?: number;
}

class LongTermMemoryWriter {
    constructor(private store: PgVectorMemoryStore) {}

    async upsertMany(params: LTMWriter): Promise<void> {
        const {
            userId,
            roomId,
            extracted,
            minImportanceToStore = 2,
            dedupeThreshold = 0.75,
        } = params;

        for (const mem of extracted) {
            if (mem.importance < minImportanceToStore) continue;

            const embedding = await embedText(mem.text);

            if (mem.subject) {
                // Upsert determinístico por subject: el dato más reciente siempre gana.
                // No hay heurística de similitud — es un key exacto.
                await this.store.upsertBySubject({
                    userId,
                    roomId: roomId ?? null,
                    type: mem.type,
                    importance: mem.importance,
                    text: mem.text,
                    subject: mem.subject,
                    embedding,
                });
                continue;
            }

            // Sin subject: dedup por similitud vectorial (memorias episódicas)
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

            await this.store.insert({
                userId,
                roomId: roomId ?? null,
                type: mem.type,
                importance: mem.importance,
                text: mem.text,
                subject: null,
                embedding,
            });
        }
    }

    async deleteAll(userId: string) {
        await this.store.deleteAll(userId)
    }

    async deleteMemories(userId: string, memoryIds: string[]) {
        await this.store.deleteMemories(userId, memoryIds)
    }
}

export default LongTermMemoryWriter
