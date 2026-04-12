-- Tabla de turnos de conversación para memoria a mediano plazo (MTM)
-- Permite recuperar contexto reciente tras reinicios del servicio
CREATE TABLE IF NOT EXISTS conversation_turns (
    id          SERIAL PRIMARY KEY,
    conversation_id  VARCHAR(255) NOT NULL,
    user_id          VARCHAR(255) NOT NULL,
    chat_id          BIGINT       NOT NULL,
    user_message     TEXT         NOT NULL,
    assistant_message TEXT        NOT NULL,
    token_estimate   INTEGER      NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conv_turns_conversation
    ON conversation_turns (conversation_id);

CREATE INDEX IF NOT EXISTS idx_conv_turns_user
    ON conversation_turns (user_id);
