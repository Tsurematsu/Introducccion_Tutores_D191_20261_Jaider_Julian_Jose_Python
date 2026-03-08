// api/disponibilidad.js — Gestión de disponibilidad horaria y especialidades del tutor
// GET    /api/disponibilidad?tutor_id=X   → obtener disponibilidad y especialidades
// PUT    /api/disponibilidad?tutor_id=X   → actualizar disponibilidad y/o especialidades

import { getPool, getBody, setCors, sendError } from './_db.js';

const DIAS_VALIDOS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/**
 * Estructura de disponibilidad esperada (JSONB en la BD):
 * {
 *   franjas: [
 *     { dia: "Lunes",   hora_inicio: "08:00", hora_fin: "10:00" },
 *     { dia: "Miercoles", hora_inicio: "14:00", hora_fin: "16:00" }
 *   ]
 * }
 */
export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { tutor_id } = req.query;

  const client = await getPool().connect();

  if (!tutor_id) return sendError(res, 400, 'Falta el parámetro tutor_id');

  try {
    // ── GET: Retorna disponibilidad y especialidades ─────────────────────
    if (req.method === 'GET') {
      const { rows } = await client.query(
        'SELECT id, nombre, email, especialidades, disponibilidad, estado FROM tutores WHERE id = $1',
        [tutor_id]
      );
      if (!rows.length) return sendError(res, 404, 'Tutor no encontrado');
      return res.status(200).json(rows[0]);
    }

    // ── PUT: Actualiza disponibilidad y/o especialidades ─────────────────
    if (req.method === 'PUT') {
      const { disponibilidad, especialidades } = getBody(req);

      // Validar estructura de disponibilidad si viene
      if (disponibilidad) {
        if (!disponibilidad.franjas || !Array.isArray(disponibilidad.franjas)) {
          return sendError(res, 400, 'disponibilidad debe tener una propiedad "franjas" como arreglo');
        }
        for (const f of disponibilidad.franjas) {
          if (!f.dia || !f.hora_inicio || !f.hora_fin) {
            return sendError(res, 400, 'Cada franja debe tener dia, hora_inicio y hora_fin');
          }
          if (!DIAS_VALIDOS.includes(f.dia)) {
            return sendError(res, 400, `Día inválido: ${f.dia}. Válidos: ${DIAS_VALIDOS.join(', ')}`);
          }
        }
      }

      // Validar especialidades si vienen
      if (especialidades && !Array.isArray(especialidades)) {
        return sendError(res, 400, 'especialidades debe ser un arreglo de strings');
      }

      const { rows } = await client.query(
        `UPDATE tutores
         SET disponibilidad  = COALESCE($1::jsonb,  disponibilidad),
             especialidades  = COALESCE($2,         especialidades),
             actualizado_en  = NOW()
         WHERE id = $3
         RETURNING id, nombre, email, especialidades, disponibilidad, estado, actualizado_en`,
        [
          disponibilidad ? JSON.stringify(disponibilidad) : null,
          especialidades ?? null,
          tutor_id,
        ]
      );

      if (!rows.length) return sendError(res, 404, 'Tutor no encontrado');
      return res.status(200).json(rows[0]);
    }

    return sendError(res, 405, 'Método no permitido');
  } catch (err) {
    console.error('[api/disponibilidad]', err);
    return sendError(res, 500, 'Error interno del servidor', err.message);
  } finally {
    client.release();
  }
}
