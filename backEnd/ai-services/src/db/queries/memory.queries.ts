// ── Long-Term Memory (user_memories) ────────────────────────────────────────

// Recency boost: multiplica el cosine score por un factor de hasta 1.15 para
// memorias recientes. Memorias de más de 180 días no reciben boost.
// Preserva el rango de scores existente — memorias viejas con cosine alto
// siguen pasando el threshold de 0.75.
export const searchMemory = `
    SELECT
        id, user_id, room_id, type, importance, text, subject, created_at, updated_at,
        (1 - (embedding <=> $2::vector))
        * (1.0 + 0.15 * GREATEST(0.0, 1.0 - EXTRACT(EPOCH FROM (now() - updated_at)) / (180.0 * 86400)))
        AS score
    FROM user_memories
    WHERE user_id = $1
    AND importance >= $3
    ORDER BY score DESC
    LIMIT $4
`

export const getUserData = `
    SELECT text, type, importance, subject, updated_at
    FROM user_memories
    WHERE user_id = $1
    AND importance >= 3
    ORDER BY updated_at DESC
`

export const findDuplicateMemory = `
    SELECT id, (1 - (embedding <=> $2::vector)) AS score
    FROM user_memories
    WHERE user_id = $1
    AND subject IS NULL
    ORDER BY embedding <=> $2::vector ASC
    LIMIT 1
`

// $1 user_id, $2 room_id, $3 type, $4 importance, $5 text, $6 subject, $7 embedding
export const insertMemory = `
    INSERT INTO user_memories (user_id, room_id, type, importance, text, subject, embedding)
    VALUES ($1, $2, $3, $4, $5, $6, $7::vector)
    RETURNING id, user_id, room_id, type, importance, text, subject, created_at, updated_at
`

// Upsert determinístico por subject. Si ya existe un registro con el mismo
// (user_id, subject), sobreescribe — el dato más reciente siempre gana.
// $1 user_id, $2 room_id, $3 type, $4 importance, $5 text, $6 subject, $7 embedding
export const upsertMemoryBySubject = `
    INSERT INTO user_memories (user_id, room_id, type, importance, text, subject, embedding)
    VALUES ($1, $2, $3, $4, $5, $6, $7::vector)
    ON CONFLICT (user_id, subject) WHERE subject IS NOT NULL
    DO UPDATE SET
        type       = EXCLUDED.type,
        importance = EXCLUDED.importance,
        text       = EXCLUDED.text,
        embedding  = EXCLUDED.embedding,
        updated_at = now()
    RETURNING id, user_id, room_id, type, importance, text, subject, created_at, updated_at
`

export const deleteAll = `
    DELETE
    FROM user_memories
    WHERE user_id = $1
`

export const deleteMemories = `
    DELETE
    FROM user_memories
    WHERE user_id = $1
    AND id = ANY($2)
`

// ── Mid-Term Memory (conversation_turns) ────────────────────────────────────

export const insertTurn = `
    INSERT INTO conversation_turns
        (conversation_id, user_id, chat_id, user_message, assistant_message, token_estimate)
    VALUES ($1, $2, $3, $4, $5, $6)
`

export const getTurnsByConversation = `
    SELECT user_message, assistant_message
    FROM   conversation_turns
    WHERE  conversation_id = $1
    ORDER  BY created_at ASC
`

export const deleteTurnsByConversation = `
    DELETE FROM conversation_turns
    WHERE  conversation_id = $1
`

export const deleteTurnsByUser = `
    DELETE FROM conversation_turns
    WHERE  user_id = $1
`
