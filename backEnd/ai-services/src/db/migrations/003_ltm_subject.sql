-- Agrega el campo subject a user_memories para deduplicación determinística de hechos.
-- subject es una clave canónica en snake_case (ej: "birthday", "workplace").
-- El unique index parcial garantiza un solo registro por hecho por usuario.

ALTER TABLE user_memories ADD COLUMN IF NOT EXISTS subject TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS user_memories_user_subject_idx
    ON user_memories (user_id, subject)
    WHERE subject IS NOT NULL;
