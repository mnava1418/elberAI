import { MemoryHit } from "../../models/elber.model";
import { pgPool } from "./ltmDB.service";

type PgVectorSearch = {
    userId: string;
    queryEmbedding: number[];
    topK: number;
    minImportance?: number;
}

const toPgVector = (embedding: number[]): string => {
  return `[${embedding.join(",")}]`;
}

class PgVectorMemoryStore {
    async search(params: PgVectorSearch ): Promise<MemoryHit[]> {
        const { userId, queryEmbedding, topK, minImportance = 1 } = params;

        const result = await pgPool.query(
            `
            SELECT
            id, user_id, room_id, type, importance, text, created_at, updated_at,
            (1 - (embedding <=> $2::vector)) AS score
            FROM user_memories
            WHERE user_id = $1
            AND importance >= $3
            ORDER BY embedding <=> $2::vector ASC
            LIMIT $4
            `,
            [userId, toPgVector(queryEmbedding), minImportance, topK]
        );

        return result.rows.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            roomId: row.room_id,
            type: row.type,
            importance: row.importance,
            text: row.text,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            score: Number(row.score),
        }));
  }
}

export default PgVectorMemoryStore