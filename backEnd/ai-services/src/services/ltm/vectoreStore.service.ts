import { MemoryHit, MemoryRecord, UserData } from "../../models/elber.model";
import { pgPool } from "./ltmDB.service";
import * as db from "../../db/queries/memory.queries"

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
            db.searchMemory,
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

    async getUserInfo(userId: string): Promise<UserData[]> {
        const result = await pgPool.query(
            db.getUserData,
            [userId]
        )

        return result.rows.map((row: any) => ({
            importance: row.importance,
            info: row.text,
            type: row.type,
            updatedAt: row.updated_at
        }))
    }

    async findNearDuplicate(params: PgVectorDup): Promise<{ id: string; score: number } | null> {
        const { userId, candidateEmbedding, threshold } = params;

        const result = await pgPool.query(
            db.findDuplicateMemory,
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
            db.insertMemory,
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

    async deleteAll(userId: string) {
        await pgPool.query(
            db.deleteAll,
            [userId]
        )
    }

    async deleteMemories(userId: string, memoryIds: string[]) {
        await pgPool.query(
            db.deleteMemories,
            [userId, memoryIds]
        )
    }
}

export default PgVectorMemoryStore