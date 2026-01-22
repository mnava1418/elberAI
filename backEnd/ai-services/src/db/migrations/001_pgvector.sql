-- Habilita pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabla de memorias a largo plazo por usuario
CREATE TABLE IF NOT EXISTS user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Memoria a largo plazo es "por usuario"
  user_id TEXT NOT NULL,

  -- Útil para saber de dónde salió el recuerdo (no es clave primaria)
  room_id TEXT,

  -- Clasificación básica
  type TEXT NOT NULL,                 -- goal|plan|preference|constraint|profile|other
  importance INT NOT NULL DEFAULT 3,  -- 1-5

  -- El recuerdo en texto (corto y claro)
  text TEXT NOT NULL,

  -- El embedding para búsqueda semántica
  embedding VECTOR(1536) NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice por usuario (filtramos siempre por user_id)
CREATE INDEX IF NOT EXISTS user_memories_user_idx
  ON user_memories (user_id);

-- Índice vectorial (cosine). IVFFLAT requiere ANALYZE para mejores resultados.
CREATE INDEX IF NOT EXISTS user_memories_embedding_idx
  ON user_memories
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
