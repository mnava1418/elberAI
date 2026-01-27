import { MemoryHit } from "../../models/elber.model";
import { embedText } from "../ai.service";
import PgVectorMemoryStore from "./vectoreStore.service";

export type LTMReader = {
    userId: string;
    queryText: string;
    topK?: number;
    minImportance?: number;
}

class LongTermMemoryReader {
    constructor(private store: PgVectorMemoryStore) {}

    async retrieve(params: LTMReader): Promise<MemoryHit[]> {
        const { userId, queryText, topK = 8, minImportance = 2 } = params;

        const queryEmbedding = await embedText(queryText);

        return this.store.search({
            userId,
            queryEmbedding,
            topK,
            minImportance            
        });
    }

    async retriveAll(userId: string): Promise<{text: string}[]> {
        return this.store.getUserInfo(userId)
    }
}

export default LongTermMemoryReader