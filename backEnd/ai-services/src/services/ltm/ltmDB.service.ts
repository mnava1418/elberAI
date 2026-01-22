import { Pool } from 'pg';
import { postgres } from '../../config/index.config';

export const pgPool = new Pool({
  connectionString: postgres.db
  // Si tu proveedor de DB requiere SSL, normalmente aquí lo configuras.
  // Para local no necesitas SSL.
  // ssl: { rejectUnauthorized: false }
});