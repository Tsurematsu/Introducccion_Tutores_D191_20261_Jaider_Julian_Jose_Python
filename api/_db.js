// api/_db.js — Helper compartido de conexión a PostgreSQL
// Reutiliza el pool entre invocaciones (Vercel warm starts)

import { Pool } from 'pg';

let pool;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
    });
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
