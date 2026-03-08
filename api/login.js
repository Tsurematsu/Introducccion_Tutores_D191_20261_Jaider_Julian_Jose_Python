// api/login.js — Vercel Serverless Function
// POST /api/login → { email, password } → { token, rol, nombre }

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Reutilizar el pool entre invocaciones (warm starts)
let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
    const db = getPool();

    // Buscar usuario en la base de datos
    // La tabla debe tener: id, email, password (hash bcrypt), rol, nombre
    const result = await db.query(
      'SELECT id, email, password, rol, nombre FROM usuarios WHERE email = $1 LIMIT 1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = result.rows[0];

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Generar JWT
    // Buscar el id del perfil específico (estudiantes o tutores) por email
    let perfilId = null;
    if (usuario.rol === 'estudiante') {
      const perfil = await db.query('SELECT id FROM estudiantes WHERE email = $1 LIMIT 1', [usuario.email]);
      if (perfil.rows.length > 0) perfilId = perfil.rows[0].id;
    } else if (usuario.rol === 'tutor') {
      const perfil = await db.query('SELECT id FROM tutores WHERE email = $1 LIMIT 1', [usuario.email]);
      if (perfil.rows.length > 0) perfilId = perfil.rows[0].id;
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        perfil_id: perfilId,   // ID en la tabla estudiantes/tutores (null para admin)
        email: usuario.email,
        rol: usuario.rol,
        nombre: usuario.nombre,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      token,
      rol: usuario.rol,
      nombre: usuario.nombre,
      email: usuario.email,
    });
  } catch (error) {
    console.error('[API/LOGIN] Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
