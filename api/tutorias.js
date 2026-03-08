// api/tutorias.js — CRUD de Tutorias
// GET    /api/tutorias                       → listar todas (con JOIN a estudiante y tutor)
// GET    /api/tutorias?id=X                  → obtener una con detalle
// GET    /api/tutorias?estudiante_id=X       → filtrar por estudiante
// GET    /api/tutorias?tutor_id=X            → filtrar por tutor
// POST   /api/tutorias                       → crear (inscribir)
// PUT    /api/tutorias?id=X                  → actualizar estado/campos
// DELETE /api/tutorias?id=X                 → eliminar

import { getPool, getBody, setCors, sendError } from './_db.js';

const ESTADOS_VALIDOS = [
  'INSCRITO', 'ASIGNADO', 'EN_DIAGNOSTICO', 'EN_SEGUIMIENTO_ACTIVO',
  'DERIVADO', 'PROCESO_ESPECIAL', 'CANCELADO', 'APLAZADO', 'COMPLETADO',
];

const SELECT_DETALLE = `
  SELECT
    t.*,
    e.nombre  AS estudiante_nombre,
    e.email   AS estudiante_email,
    e.carrera AS estudiante_carrera,
    tu.nombre AS tutor_nombre,
    tu.email  AS tutor_email
  FROM tutorias t
  JOIN estudiantes e  ON e.id  = t.estudiante_id
  LEFT JOIN tutores tu ON tu.id = t.tutor_id
`;

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id, estudiante_id, tutor_id } = req.query;

  const client = await getPool().connect();

  try {
    // ── LIST / GET ONE ──────────────────────────────────────────────────
    if (req.method === 'GET') {
      if (id) {
        const { rows } = await client.query(`${SELECT_DETALLE} WHERE t.id = $1`, [id]);
        if (!rows.length) return sendError(res, 404, 'Tutoría no encontrada');
        return res.status(200).json(rows[0]);
      }
      if (estudiante_id) {
        const { rows } = await client.query(
          `${SELECT_DETALLE} WHERE t.estudiante_id = $1 ORDER BY t.fecha_inscripcion DESC`,
          [estudiante_id]
        );
        return res.status(200).json(rows);
      }
      if (tutor_id) {
        const { rows } = await client.query(
          `${SELECT_DETALLE} WHERE t.tutor_id = $1 ORDER BY t.fecha_inscripcion DESC`,
          [tutor_id]
        );
        return res.status(200).json(rows);
      }
      const { rows } = await client.query(
        `${SELECT_DETALLE} ORDER BY t.fecha_inscripcion DESC`
      );
      return res.status(200).json(rows);
    }

    // ── CREATE (INSCRIPCIÓN) ────────────────────────────────────────────
    if (req.method === 'POST') {
      const { estudiante_id: eId, asignatura, tema, observaciones } = getBody(req);
      if (!eId || !asignatura) return sendError(res, 400, 'estudiante_id y asignatura son requeridos');

      const { rows } = await client.query(
        `INSERT INTO tutorias (estudiante_id, asignatura, tema, observaciones)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [eId, asignatura, tema ?? null, observaciones ?? null]
      );
      return res.status(201).json(rows[0]);
    }

    // ── UPDATE ──────────────────────────────────────────────────────────
    if (req.method === 'PUT') {
      if (!id) return sendError(res, 400, 'Falta el parámetro id');
      const {
        tutor_id: tId, asignatura, tema, estado,
        fecha_asignacion, fecha_inicio, fecha_cierre,
        motivo_cierre, numero_sesiones, observaciones,
      } = getBody(req);

      if (estado && !ESTADOS_VALIDOS.includes(estado)) {
        return sendError(res, 400, `Estado inválido. Valores: ${ESTADOS_VALIDOS.join(', ')}`);
      }

      const { rows } = await client.query(
        `UPDATE tutorias
         SET tutor_id         = COALESCE($1,  tutor_id),
             asignatura       = COALESCE($2,  asignatura),
             tema             = COALESCE($3,  tema),
             estado           = COALESCE($4::estado_tutoria, estado),
             fecha_asignacion = COALESCE($5,  fecha_asignacion),
             fecha_inicio     = COALESCE($6,  fecha_inicio),
             fecha_cierre     = COALESCE($7,  fecha_cierre),
             motivo_cierre    = COALESCE($8,  motivo_cierre),
             numero_sesiones  = COALESCE($9,  numero_sesiones),
             observaciones    = COALESCE($10, observaciones),
             actualizado_en   = NOW()
         WHERE id = $11
         RETURNING *`,
        [tId, asignatura, tema, estado, fecha_asignacion, fecha_inicio, fecha_cierre, motivo_cierre, numero_sesiones, observaciones, id]
      );
      if (!rows.length) return sendError(res, 404, 'Tutoría no encontrada');
      return res.status(200).json(rows[0]);
    }

    // ── DELETE ──────────────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      if (!id) return sendError(res, 400, 'Falta el parámetro id');
      const { rowCount } = await client.query('DELETE FROM tutorias WHERE id = $1', [id]);
      if (!rowCount) return sendError(res, 404, 'Tutoría no encontrada');
      return res.status(200).json({ ok: true, message: 'Tutoría eliminada' });
    }

    return sendError(res, 405, 'Método no permitido');
  } catch (err) {
    console.error('[api/tutorias]', err);
    return sendError(res, 500, 'Error interno del servidor', err.message);
  } finally {
    client.release();
  }
}
