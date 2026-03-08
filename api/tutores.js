// api/tutores.js — CRUD de Tutores
// GET    /api/tutores         → listar todos
// GET    /api/tutores?id=X    → obtener uno
// POST   /api/tutores         → crear
// PUT    /api/tutores?id=X    → actualizar
// DELETE /api/tutores?id=X    → eliminar

import { getPool, getBody, setCors, sendError } from './_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  const client = await getPool().connect();

  try {
    // ── LIST / GET ONE ──────────────────────────────────────────────────
    if (req.method === 'GET') {
      if (id) {
        const { rows } = await client.query('SELECT * FROM tutores WHERE id = $1', [id]);
        if (!rows.length) return sendError(res, 404, 'Tutor no encontrado');
        return res.status(200).json(rows[0]);
      }
      const { rows } = await client.query('SELECT * FROM tutores ORDER BY nombre ASC');
      return res.status(200).json(rows);
    }

    // ── CREATE ──────────────────────────────────────────────────────────
    if (req.method === 'POST') {
      const { nombre, email, especialidades, disponibilidad, estado } = getBody(req);
      if (!nombre || !email) return sendError(res, 400, 'nombre y email son requeridos');

      const { rows } = await client.query(
        `INSERT INTO tutores (nombre, email, especialidades, disponibilidad, estado)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          nombre,
          email,
          especialidades ?? [],        // TEXT[]
          disponibilidad ? JSON.stringify(disponibilidad) : null, // JSONB
          estado ?? 'Activo',
        ]
      );
      return res.status(201).json(rows[0]);
    }

    // ── UPDATE ──────────────────────────────────────────────────────────
    if (req.method === 'PUT') {
      if (!id) return sendError(res, 400, 'Falta el parámetro id');
      const { nombre, email, especialidades, disponibilidad, estado } = getBody(req);

      const { rows } = await client.query(
        `UPDATE tutores
         SET nombre         = COALESCE($1, nombre),
             email          = COALESCE($2, email),
             especialidades = COALESCE($3, especialidades),
             disponibilidad = COALESCE($4, disponibilidad),
             estado         = COALESCE($5, estado),
             actualizado_en = NOW()
         WHERE id = $6
         RETURNING *`,
        [
          nombre,
          email,
          especialidades ?? null,
          disponibilidad ? JSON.stringify(disponibilidad) : null,
          estado,
          id,
        ]
      );
      if (!rows.length) return sendError(res, 404, 'Tutor no encontrado');
      return res.status(200).json(rows[0]);
    }

    // ── DELETE ──────────────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      if (!id) return sendError(res, 400, 'Falta el parámetro id');
      const { rowCount } = await client.query('DELETE FROM tutores WHERE id = $1', [id]);
      if (!rowCount) return sendError(res, 404, 'Tutor no encontrado');
      return res.status(200).json({ ok: true, message: 'Tutor eliminado' });
    }

    return sendError(res, 405, 'Método no permitido');
  } catch (err) {
    console.error('[api/tutores]', err);
    return sendError(res, 500, 'Error interno del servidor', err.message);
  } finally {
    client.release();
  }
}
