// api/usuarios.js — Gestión de cuentas de usuario por el admin
// GET    /api/usuarios         → listar todos (sin contraseña)
// POST   /api/usuarios         → crear cuenta + perfil (estudiante o tutor)
// DELETE /api/usuarios?id=X    → eliminar cuenta (y perfil si existe)

import bcrypt from 'bcryptjs';
import { getPool, getBody, setCors, sendError } from './_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = getPool();
  const { id } = req.query;

  try {
    // ── LIST ────────────────────────────────────────────────────────────
    if (req.method === 'GET') {
      const { rows } = await db.query(
        `SELECT id, nombre, email, rol, creado_en FROM usuarios ORDER BY creado_en DESC`
      );
      return res.status(200).json(rows);
    }

    // ── CREATE ──────────────────────────────────────────────────────────
    // Crea la cuenta en `usuarios` y opcionalmente el perfil en
    // `estudiantes` o `tutores` según el rol.
    if (req.method === 'POST') {
      const {
        nombre, email, password, rol,
        // campos extra de perfil
        carrera, semestre, especialidades,
      } = getBody(req);

      if (!nombre || !email || !password || !rol) {
        return sendError(res, 400, 'nombre, email, password y rol son requeridos');
      }
      if (!['estudiante', 'tutor', 'admin'].includes(rol)) {
        return sendError(res, 400, 'rol inválido. Valores: estudiante, tutor, admin');
      }

      // Verificar email duplicado
      const { rows: existe } = await db.query(
        'SELECT id FROM usuarios WHERE email = $1', [email]
      );
      if (existe.length) return sendError(res, 409, 'Ya existe una cuenta con ese email');

      const hash = bcrypt.hashSync(password, 10);

      // Transacción: usuario + perfil
      await db.query('BEGIN');
      try {
        const { rows: [usuario] } = await db.query(
          `INSERT INTO usuarios (nombre, email, password, rol)
           VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol, creado_en`,
          [nombre, email, hash, rol]
        );

        let perfil = null;
        if (rol === 'estudiante') {
          const { rows: [p] } = await db.query(
            `INSERT INTO estudiantes (nombre, email, carrera, semestre)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [nombre, email, carrera ?? null, semestre ?? null]
          );
          perfil = p;
        } else if (rol === 'tutor') {
          const { rows: [p] } = await db.query(
            `INSERT INTO tutores (nombre, email, especialidades)
             VALUES ($1, $2, $3) RETURNING *`,
            [nombre, email, especialidades ?? []]
          );
          perfil = p;
        }

        await db.query('COMMIT');
        return res.status(201).json({ usuario, perfil });
      } catch (txErr) {
        await db.query('ROLLBACK');
        throw txErr;
      }
    }

    // ── DELETE ──────────────────────────────────────────────────────────
    // Elimina la cuenta y el perfil asociado (por email)
    if (req.method === 'DELETE') {
      if (!id) return sendError(res, 400, 'Falta el parámetro id');

      // Obtener el usuario para saber su rol y email
      const { rows: [u] } = await db.query(
        'SELECT id, email, rol FROM usuarios WHERE id = $1', [id]
      );
      if (!u) return sendError(res, 404, 'Usuario no encontrado');

      await db.query('BEGIN');
      try {
        // Eliminar perfil primero (si corresponde)
        if (u.rol === 'estudiante') {
          await db.query('DELETE FROM estudiantes WHERE email = $1', [u.email]);
        } else if (u.rol === 'tutor') {
          await db.query('DELETE FROM tutores WHERE email = $1', [u.email]);
        }
        // Eliminar cuenta
        await db.query('DELETE FROM usuarios WHERE id = $1', [id]);
        await db.query('COMMIT');
        return res.status(200).json({ ok: true, message: 'Usuario y perfil eliminados' });
      } catch (txErr) {
        await db.query('ROLLBACK');
        throw txErr;
      }
    }

    return sendError(res, 405, 'Método no permitido');
  } catch (err) {
    console.error('[api/usuarios]', err);
    return sendError(res, 500, 'Error interno del servidor', err.message);
  }
}
