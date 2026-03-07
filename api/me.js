// api/me.js — Vercel Serverless Function
// GET /api/me → Verifica el JWT y retorna la info del usuario

import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({
      id: payload.id,
      email: payload.email,
      rol: payload.rol,
      nombre: payload.nombre,
    });
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
