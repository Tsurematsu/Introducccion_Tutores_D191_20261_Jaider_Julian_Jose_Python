// api/login.js — Vercel Serverless Function
// POST /api/login → { email, password } → { token, rol, nombre }

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool, setCors, sendError } from './_db.js';

export default async function handler(req, res) {
  setCors(res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return sendError(res, 405, 'Método no permitido');

  const { email, password } = req.body || {};
  if (!email || !password) {
    return sendError(res, 400, 'Email y contraseña son requeridos');
  }

  const client = await getPool().connect();
  try {
    // Buscar usuario
    const { rows } = await client.query(
      'SELECT id, email, password, rol, nombre FROM usuarios WHERE email = $1 LIMIT 1',
      [email.toLowerCase().trim()]
    );

    if (!rows.length) return sendError(res, 401, 'Credenciales incorrectas');

    const usuario = rows[0];

    // Verificar contraseña
    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok) return sendError(res, 401, 'Credenciales incorrectas');

    // Buscar perfil_id específico (estudiantes / tutores)
    let perfilId = null;
    if (usuario.rol === 'estudiante') {
      const { rows: p } = await client.query(
        'SELECT id FROM estudiantes WHERE email = $1 LIMIT 1', [usuario.email]
      );
      if (p.length) perfilId = p[0].id;
    } else if (usuario.rol === 'tutor') {
      const { rows: p } = await client.query(
        'SELECT id FROM tutores WHERE email = $1 LIMIT 1', [usuario.email]
      );
      if (p.length) perfilId = p[0].id;
    }

    const token = jwt.sign(
      {
        id:        usuario.id,
        perfil_id: perfilId,   // ID en la tabla estudiantes/tutores (null para admin)
        email:     usuario.email,
        rol:       usuario.rol,
        nombre:    usuario.nombre,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      token,
      rol:    usuario.rol,
      nombre: usuario.nombre,
      email:  usuario.email,
    });
  } catch (err) {
    console.error('[api/login]', err);
    return sendError(res, 500, 'Error interno del servidor', err.message);
  } finally {
    client.release();
  }
}
