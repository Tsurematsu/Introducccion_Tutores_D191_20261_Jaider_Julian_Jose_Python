// api/_db.js — Helper compartido de conexión a PostgreSQL
// Reutiliza el pool entre invocaciones (Vercel warm starts)
//
// ─── VARIABLES DE ENTORNO REQUERIDAS ─────────────────────────────────────────
//  Agrega estas variables en:
//  · Local:  archivo .env.local  (o .env)
//  · Vercel: Settings → Environment Variables
//
//  Opción A — cadena de conexión única (recomendada para Neon/Supabase/Railway):
//    POSTGRES_URL=postgresql://usuario:contraseña@host:5432/nombre_db
//
//  Opción B — variables individuales (si no usas POSTGRES_URL):
//    POSTGRES_HOST=localhost
//    POSTGRES_PORT=5432
//    POSTGRES_DB=edututor
//    POSTGRES_USER=mi_usuario
//    POSTGRES_PASSWORD=mi_contraseña
//    POSTGRES_SSL=false   ← pon "false" si es local sin SSL
//
//  JWT:
//    JWT_SECRET=una_clave_secreta_larga_y_aleatoria
//
//  ⚠ Nunca subas valores reales al repositorio. Usa siempre variables de entorno.
// ─────────────────────────────────────────────────────────────────────────────

import { Pool } from 'pg';

const DB_CONFIG = {
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  host:     process.env.POSTGRES_HOST     || 'localhost',
  port:     Number(process.env.POSTGRES_PORT)  || 5432,
  database: process.env.POSTGRES_DB       || 'edututor',
  user:     process.env.POSTGRES_USER     || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  ssl:      process.env.POSTGRES_SSL === 'false'
              ? false
              : { rejectUnauthorized: false }, // true por defecto (Vercel/Neon/Supabase)
};

let pool;

export function getPool() {
  if (!pool) {
    pool = new Pool(
      DB_CONFIG.connectionString
        ? { connectionString: DB_CONFIG.connectionString, ssl: DB_CONFIG.ssl }
        : DB_CONFIG
    );
  }
  return pool;
}

/** Helper: lee el body JSON de la request (Vercel ya lo parsea como objeto) */
export function getBody(req) {
  return req.body ?? {};
}

/** Helper: respuesta estándar de error */
export function sendError(res, status, message, detail = null) {
  return res.status(status).json({ error: message, ...(detail && { detail }) });
}

/** Headers CORS comunes */
export function setCors(res, methods = 'GET, POST, PUT, DELETE, OPTIONS') {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
