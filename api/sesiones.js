// api/sesiones.js — CRUD de Sesiones
// GET    /api/sesiones                  → listar todas
// GET    /api/sesiones?id=X             → obtener una
// GET    /api/sesiones?tutoria_id=X     → sesiones de una tutoría (más común)
// POST   /api/sesiones                  → crear sesión (incrementa numero_sesiones en tutoría)
// PUT    /api/sesiones?id=X             → actualizar
// DELETE /api/sesiones?id=X             → eliminar (decrementa numero_sesiones)

import { getPool, getBody, setCors, sendError } from './_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id, tutoria_id } = req.query;

  const client = await getPool().connect();

  try {
    // ── LIST / GET ONE ──────────────────────────────────────────────────
    if (req.method === 'GET') {
      if (id) {
        const { rows } = await client.query('SELECT * FROM sesiones WHERE id = $1', [id]);
        if (!rows.length) return sendError(res, 404, 'Sesión no encontrada');
        return res.status(200).json(rows[0]);
      }
      if (tutoria_id) {
        const { rows } = await client.query(
          'SELECT * FROM sesiones WHERE tutoria_id = $1 ORDER BY fecha DESC',
          [tutoria_id]
        );
        return res.status(200).json(rows);
      }
      const { rows } = await client.query('SELECT * FROM sesiones ORDER BY fecha DESC');
      return res.status(200).json(rows);
    }

    // ── CREATE ──────────────────────────────────────────────────────────
    if (req.method === 'POST') {
      const {
        tutoria_id: tId, fecha,
        tutor_evaluacion_bases, tutor_evaluacion_comprension,
        observaciones, estado_sesion,
      } = getBody(req);

      if (!tId || !fecha) return sendError(res, 400, 'tutoria_id y fecha son requeridos');

      // Verificar que la tutoría existe
      const check = await client.query('SELECT id FROM tutorias WHERE id = $1', [tId]);
      if (!check.rows.length) return sendError(res, 404, 'Tutoría no encontrada');

      try {
        await client.query('BEGIN');
        const { rows } = await client.query(
          `INSERT INTO sesiones
             (tutoria_id, fecha, tutor_evaluacion_bases, tutor_evaluacion_comprension, observaciones, estado_sesion)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [tId, fecha, tutor_evaluacion_bases ?? null, tutor_evaluacion_comprension ?? null, observaciones ?? null, estado_sesion ?? 'Realizada']
        );
        // Incrementar contador de sesiones en la tutoría si la sesión fue realizada
        if (!estado_sesion || estado_sesion === 'Realizada') {
          await client.query(
            'UPDATE tutorias SET numero_sesiones = numero_sesiones + 1, actualizado_en = NOW() WHERE id = $1',
            [tId]
          );
        }
        await client.query('COMMIT');
        return res.status(201).json(rows[0]);
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }

    // ── UPDATE ──────────────────────────────────────────────────────────
    if (req.method === 'PUT') {
      if (!id) return sendError(res, 400, 'Falta el parámetro id');
      const { fecha, tutor_evaluacion_bases, tutor_evaluacion_comprension, observaciones, estado_sesion } = getBody(req);

      const { rows } = await client.query(
        `UPDATE sesiones
         SET fecha                        = COALESCE($1, fecha),
             tutor_evaluacion_bases       = COALESCE($2, tutor_evaluacion_bases),
             tutor_evaluacion_comprension = COALESCE($3, tutor_evaluacion_comprension),
             observaciones                = COALESCE($4, observaciones),
             estado_sesion                = COALESCE($5::estado_sesion, estado_sesion)
         WHERE id = $6
         RETURNING *`,
        [fecha, tutor_evaluacion_bases, tutor_evaluacion_comprension, observaciones, estado_sesion, id]
      );
      if (!rows.length) return sendError(res, 404, 'Sesión no encontrada');
      return res.status(200).json(rows[0]);
    }

    // ── DELETE ──────────────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      if (!id) return sendError(res, 400, 'Falta el parámetro id');

      // Obtener la sesión antes de eliminar para ajustar el contador
      const { rows: sesRows } = await client.query('SELECT * FROM sesiones WHERE id = $1', [id]);
      if (!sesRows.length) return sendError(res, 404, 'Sesión no encontrada');

      try {
        await client.query('BEGIN');
        await client.query('DELETE FROM sesiones WHERE id = $1', [id]);
        if (sesRows[0].estado_sesion === 'Realizada') {
          await client.query(
            'UPDATE tutorias SET numero_sesiones = GREATEST(0, numero_sesiones - 1), actualizado_en = NOW() WHERE id = $1',
            [sesRows[0].tutoria_id]
          );
        }
        await client.query('COMMIT');
        return res.status(200).json({ ok: true, message: 'Sesión eliminada' });
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }

    return sendError(res, 405, 'Método no permitido');
  } catch (err) {
    console.error('[api/sesiones]', err);
    return sendError(res, 500, 'Error interno del servidor', err.message);
  } finally {
    client.release();
  }
}
