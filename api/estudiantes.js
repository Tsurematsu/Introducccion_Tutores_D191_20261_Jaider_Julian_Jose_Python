// api/estudiantes.js — CRUD de Estudiantes
// GET    /api/estudiantes         → listar todos
// GET    /api/estudiantes?id=X    → obtener uno
// POST   /api/estudiantes         → crear
// PUT    /api/estudiantes?id=X    → actualizar
// DELETE /api/estudiantes?id=X    → eliminar

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
        const { rows } = await client.query(
          'SELECT * FROM estudiantes WHERE id = $1',
          [id]
        );
        if (!rows.length) return sendError(res, 404, 'Estudiante no encontrado');
        return res.status(200).json(rows[0]);
      }
      const { rows } = await client.query(
        'SELECT * FROM estudiantes ORDER BY nombre ASC'
      );
      return res.status(200).json(rows);
    }

    // ── CREATE ──────────────────────────────────────────────────────────
    if (req.method === 'POST') {
      const { nombre, email, carrera, semestre, fecha_ingreso, estado_general } = getBody(req);
      if (!nombre || !email) return sendError(res, 400, 'nombre y email son requeridos');

      const { rows } = await client.query(
        `INSERT INTO estudiantes (nombre, email, carrera, semestre, fecha_ingreso, estado_general)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [nombre, email, carrera ?? null, semestre ?? null, fecha_ingreso ?? null, estado_general ?? 'Activo']
      );
      return res.status(201).json(rows[0]);
    }

    // ── UPDATE ──────────────────────────────────────────────────────────
    if (req.method === 'PUT') {
      if (!id) return sendError(res, 400, 'Falta el parámetro id');
      const { nombre, email, carrera, semestre, fecha_ingreso, estado_general } = getBody(req);

      const { rows } = await client.query(
        `UPDATE estudiantes
         SET nombre         = COALESCE($1, nombre),
             email          = COALESCE($2, email),
             carrera        = COALESCE($3, carrera),
             semestre       = COALESCE($4, semestre),
             fecha_ingreso  = COALESCE($5, fecha_ingreso),
             estado_general = COALESCE($6, estado_general),
             actualizado_en = NOW()
         WHERE id = $7
         RETURNING *`,
        [nombre, email, carrera, semestre, fecha_ingreso, estado_general, id]
      );
      if (!rows.length) return sendError(res, 404, 'Estudiante no encontrado');
      return res.status(200).json(rows[0]);
    }

    // ── DELETE ──────────────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      if (!id) return sendError(res, 400, 'Falta el parámetro id');
      const { rowCount } = await client.query('DELETE FROM estudiantes WHERE id = $1', [id]);
      if (!rowCount) return sendError(res, 404, 'Estudiante no encontrado');
      return res.status(200).json({ ok: true, message: 'Estudiante eliminado' });
    }

    return sendError(res, 405, 'Método no permitido');
  } catch (err) {
    console.error('[api/estudiantes]', err);
    return sendError(res, 500, 'Error interno del servidor', err.message);
  } finally {
    client.release();
  }
}
