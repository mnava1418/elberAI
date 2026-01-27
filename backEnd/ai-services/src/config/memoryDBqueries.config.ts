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
    SELECT text
    FROM user_memories
    WHERE user_id = $1
    AND importance >= 3
    ORDER BY created_at    
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
