export const searchMemory = `
    SELECT
    id, user_id, room_id, type, importance, text, created_at, updated_at,
    (1 - (embedding <=> $2::vector)) AS score
    FROM user_memories
    WHERE user_id = $1
    AND importance >= $3
    ORDER BY embedding <=> $2::vector ASC
    LIMIT $4
`

export const getUserData = `
    SELECT text, type, importance, updated_at
    FROM user_memories
    WHERE user_id = $1
    AND importance >= 3
    ORDER BY updated_at    
`
export const findDuplicateMemory = `
    SELECT id, (1 - (embedding <=> $2::vector)) AS score
    FROM user_memories
    WHERE user_id = $1
    ORDER BY embedding <=> $2::vector ASC
    LIMIT 1
`
export const insertMemory = `
    INSERT INTO user_memories (user_id, room_id, type, importance, text, embedding)
    VALUES ($1, $2, $3, $4, $5, $6::vector)
    RETURNING id, user_id, room_id, type, importance, text, created_at, updated_at
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