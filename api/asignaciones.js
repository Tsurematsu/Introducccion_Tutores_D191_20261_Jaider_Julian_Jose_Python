// api/asignaciones.js — CRUD de AsignacionTutor
// GET    /api/asignaciones                 → listar todas
// GET    /api/asignaciones?id=X            → obtener una
// GET    /api/asignaciones?tutoria_id=X    → historial de asignaciones de una tutoría
// GET    /api/asignaciones?tutor_id=X      → asignaciones de un tutor
// POST   /api/asignaciones                 → crear asignación (asignar tutor a tutoría)
// PUT    /api/asignaciones?id=X            → actualizar (aceptar/rechazar)
// DELETE /api/asignaciones?id=X            → eliminar

import { getPool, getBody, setCors, sendError } from './_db.js';

const ESTADOS_VALIDOS = ['Aceptada', 'Rechazada', 'Reemplazada'];

const SELECT_DETALLE = `
  SELECT
    a.*,
    t.asignatura    AS tutoria_asignatura,
    t.estado        AS tutoria_estado,
    e.nombre        AS estudiante_nombre,
    tu.nombre       AS tutor_nombre,
    tu.email        AS tutor_email
  FROM asignaciones_tutor a
  JOIN tutorias    t  ON t.id  = a.tutoria_id
  JOIN estudiantes e  ON e.id  = t.estudiante_id
  JOIN tutores     tu ON tu.id = a.tutor_id
`;

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id, tutoria_id, tutor_id } = req.query;

  const client = await getPool().connect();

  try {
    // ── LIST / GET ONE ──────────────────────────────────────────────────
    if (req.method === 'GET') {
      if (id) {
        const { rows } = await client.query(`${SELECT_DETALLE} WHERE a.id = $1`, [id]);
        if (!rows.length) return sendError(res, 404, 'Asignación no encontrada');
        return res.status(200).json(rows[0]);
      }
      if (tutoria_id) {
        const { rows } = await client.query(
          `${SELECT_DETALLE} WHERE a.tutoria_id = $1 ORDER BY a.fecha_asignacion DESC`,
          [tutoria_id]
        );
        return res.status(200).json(rows);
      }
      if (tutor_id) {
        const { rows } = await client.query(
          `${SELECT_DETALLE} WHERE a.tutor_id = $1 ORDER BY a.fecha_asignacion DESC`,
          [tutor_id]
        );
        return res.status(200).json(rows);
      }
      const { rows } = await client.query(`${SELECT_DETALLE} ORDER BY a.fecha_asignacion DESC`);
      return res.status(200).json(rows);
    }

    // ── CREATE (ASIGNAR TUTOR) ──────────────────────────────────────────
    if (req.method === 'POST') {
      const { tutoria_id: tId, tutor_id: tuId, dentro_de_24h } = getBody(req);
      if (!tId || !tuId) return sendError(res, 400, 'tutoria_id y tutor_id son requeridos');

      try {
        await client.query('BEGIN');
        // Crear la asignación
        const { rows } = await client.query(
          `INSERT INTO asignaciones_tutor (tutoria_id, tutor_id, dentro_de_24h)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [tId, tuId, dentro_de_24h ?? true]
        );
        // Actualizar la tutoría: asignar tutor y cambiar estado a ASIGNADO
        await client.query(
          `UPDATE tutorias
           SET tutor_id = $1, estado = 'ASIGNADO'::estado_tutoria, fecha_asignacion = CURRENT_DATE, actualizado_en = NOW()
           WHERE id = $2`,
          [tuId, tId]
        );
        await client.query('COMMIT');
        return res.status(201).json(rows[0]);
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      }
    }

    // ── UPDATE (ACEPTAR / RECHAZAR) ─────────────────────────────────────
    if (req.method === 'PUT') {
      if (!id) return sendError(res, 400, 'Falta el parámetro id');
      const { estado, fecha_rechazo, dentro_de_24h, reemplazo_conseguido } = getBody(req);

      if (estado && !ESTADOS_VALIDOS.includes(estado)) {
        return sendError(res, 400, `Estado inválido. Valores: ${ESTADOS_VALIDOS.join(', ')}`);
      }

      const { rows } = await client.query(
        `UPDATE asignaciones_tutor
         SET estado               = COALESCE($1::estado_asignacion, estado),
             fecha_rechazo        = COALESCE($2, fecha_rechazo),
             dentro_de_24h        = COALESCE($3, dentro_de_24h),
             reemplazo_conseguido = COALESCE($4, reemplazo_conseguido)
         WHERE id = $5
         RETURNING *`,
        [estado, fecha_rechazo, dentro_de_24h, reemplazo_conseguido, id]
      );
      if (!rows.length) return sendError(res, 404, 'Asignación no encontrada');
      return res.status(200).json(rows[0]);
    }

    // ── DELETE ──────────────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      if (!id) return sendError(res, 400, 'Falta el parámetro id');
      const { rowCount } = await client.query('DELETE FROM asignaciones_tutor WHERE id = $1', [id]);
      if (!rowCount) return sendError(res, 404, 'Asignación no encontrada');
      return res.status(200).json({ ok: true, message: 'Asignación eliminada' });
    }

    return sendError(res, 405, 'Método no permitido');
  } catch (err) {
    console.error('[api/asignaciones]', err);
    return sendError(res, 500, 'Error interno del servidor', err.message);
  } finally {
    client.release();
  }
}
