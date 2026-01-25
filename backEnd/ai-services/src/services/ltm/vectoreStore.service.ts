import { MemoryHit, MemoryRecord } from "../../models/elber.model";
import { pgPool } from "./ltmDB.service";

type PgVectorSearch = {
    userId: string;
    queryEmbedding: number[];
    topK: number;
    minImportance?: number;
}

type PgVectorDup = {
    userId: string;
    candidateEmbedding: number[];
    threshold: number;
}

type PgVectorUpdate = {
    id: string;
    type?: string;
    importance?: number;
    text?: string;
    embedding?: number[];
}

type PgVectorInsert = {
    userId: string;
    roomId?: string | null;
    type: string;
    importance: number;
    text: string;
    embedding: number[];
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

    async findNearDuplicate(params: PgVectorDup): Promise<{ id: string; score: number } | null> {
        const { userId, candidateEmbedding, threshold } = params;

        const result = await pgPool.query(
            `
            SELECT id, (1 - (embedding <=> $2::vector)) AS score
            FROM user_memories
            WHERE user_id = $1
            ORDER BY embedding <=> $2::vector ASC
            LIMIT 1
            `,
            [userId, toPgVector(candidateEmbedding)]
        );

        if (!result.rows.length) return null;

        const best = result.rows[0];
        const score = Number(best.score);
        
        if (score >= threshold) return { id: best.id, score };

        return null;
    }

    async update(params: PgVectorUpdate ): Promise<void> {
        const { id, type, importance, text, embedding } = params;

        const sets: string[] = [];
        const values: any[] = [];
        let i = 1;

        if (type) {
            sets.push(`type = $${i++}`);
            values.push(type);
        }
        
        if (typeof importance === "number") {
            sets.push(`importance = $${i++}`);
            values.push(importance);
        }
        
        if (text) {
            sets.push(`text = $${i++}`);
            values.push(text);
        }
        
        if (embedding) {
            sets.push(`embedding = $${i++}::vector`);
            values.push(toPgVector(embedding));
        }

        sets.push(`updated_at = now()`);

        values.push(id);

        await pgPool.query(
            `
            UPDATE user_memories
            SET ${sets.join(", ")}
            WHERE id = $${i}
            `,
            values
        );
    }

    async insert(params: PgVectorInsert): Promise<MemoryRecord> {
        const { userId, roomId = null, type, importance, text, embedding } = params;

        const result = await pgPool.query(
            `
            INSERT INTO user_memories (user_id, room_id, type, importance, text, embedding)
            VALUES ($1, $2, $3, $4, $5, $6::vector)
            RETURNING id, user_id, room_id, type, importance, text, created_at, updated_at
            `,
            [userId, roomId, type, importance, text, toPgVector(embedding)]
        );

        const row = result.rows[0];
        return {
            id: row.id,
            userId: row.user_id,
            roomId: row.room_id,
            type: row.type,
            importance: row.importance,
            text: row.text,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}

export default PgVectorMemoryStore