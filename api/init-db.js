// api/init-db.js — GET /api/init-db
// Crea todas las tablas si no existen y siembra usuarios por defecto.

import bcrypt from 'bcryptjs';
import { getPool, setCors, sendError } from './_db.js';

const SQL_INIT = `
  -- Enum de estado de tutoría
  DO $$ BEGIN
    CREATE TYPE estado_tutoria AS ENUM (
      'INSCRITO', 'ASIGNADO', 'EN_DIAGNOSTICO', 'EN_SEGUIMIENTO_ACTIVO',
      'DERIVADO', 'PROCESO_ESPECIAL', 'CANCELADO', 'APLAZADO', 'COMPLETADO'
    );
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE estado_general AS ENUM ('Activo', 'Inactivo', 'Suspendido');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE estado_sesion AS ENUM ('Realizada', 'Cancelada', 'Aplazada');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    CREATE TYPE estado_asignacion AS ENUM ('Aceptada', 'Rechazada', 'Reemplazada');
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE TABLE IF NOT EXISTS usuarios (
    id         SERIAL PRIMARY KEY,
    email      VARCHAR(255) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,
    rol        VARCHAR(20)  NOT NULL CHECK (rol IN ('estudiante', 'tutor', 'admin')),
    nombre     VARCHAR(255) NOT NULL,
    creado_en  TIMESTAMPTZ  DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS estudiantes (
    id             SERIAL PRIMARY KEY,
    nombre         VARCHAR(255)  NOT NULL,
    email          VARCHAR(255)  UNIQUE NOT NULL,
    carrera        VARCHAR(255),
    semestre       SMALLINT,
    fecha_ingreso  DATE,
    estado_general estado_general DEFAULT 'Activo',
    creado_en      TIMESTAMPTZ   DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ   DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS tutores (
    id             SERIAL PRIMARY KEY,
    nombre         VARCHAR(255)  NOT NULL,
    email          VARCHAR(255)  UNIQUE NOT NULL,
    especialidades TEXT[],
    disponibilidad JSONB,
    estado         VARCHAR(20)   DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo')),
    creado_en      TIMESTAMPTZ   DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ   DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS tutorias (
    id                SERIAL PRIMARY KEY,
    estudiante_id     INTEGER       NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    tutor_id          INTEGER       REFERENCES tutores(id) ON DELETE SET NULL,
    asignatura        VARCHAR(255)  NOT NULL,
    tema              TEXT,
    estado            estado_tutoria DEFAULT 'INSCRITO',
    fecha_inscripcion DATE          DEFAULT CURRENT_DATE,
    fecha_asignacion  DATE,
    fecha_inicio      DATE,
    fecha_cierre      DATE,
    motivo_cierre     VARCHAR(50)   CHECK (motivo_cierre IN ('Completado', 'Derivado', 'Cancelado', 'Proceso especial')),
    numero_sesiones   INTEGER       DEFAULT 0,
    observaciones     TEXT,
    creado_en         TIMESTAMPTZ   DEFAULT NOW(),
    actualizado_en    TIMESTAMPTZ   DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS sesiones (
    id                           SERIAL PRIMARY KEY,
    tutoria_id                   INTEGER       NOT NULL REFERENCES tutorias(id) ON DELETE CASCADE,
    fecha                        DATE          NOT NULL,
    tutor_evaluacion_bases       BOOLEAN,
    tutor_evaluacion_comprension BOOLEAN,
    observaciones                TEXT,
    estado_sesion                estado_sesion DEFAULT 'Realizada',
    creado_en                    TIMESTAMPTZ   DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS asignaciones_tutor (
    id                   SERIAL PRIMARY KEY,
    tutoria_id           INTEGER          NOT NULL REFERENCES tutorias(id) ON DELETE CASCADE,
    tutor_id             INTEGER          NOT NULL REFERENCES tutores(id) ON DELETE CASCADE,
    fecha_asignacion     DATE             DEFAULT CURRENT_DATE,
    estado               estado_asignacion DEFAULT 'Aceptada',
    fecha_rechazo        DATE,
    dentro_de_24h        BOOLEAN          DEFAULT TRUE,
    reemplazo_conseguido BOOLEAN          DEFAULT FALSE,
    creado_en            TIMESTAMPTZ      DEFAULT NOW()
  );
`;

// ── Usuarios semilla ────────────────────────────────────────────────────
const SEED_USERS = [
  { nombre: 'Administrador',   email: 'admin@edututor.com',      password: 'Admin123!',   rol: 'admin'      },
  { nombre: 'Tutor Demo',      email: 'tutor@edututor.com',      password: 'Tutor123!',   rol: 'tutor'      },
  { nombre: 'Estudiante Demo', email: 'estudiante@edututor.com', password: 'Student123!', rol: 'estudiante' },
];

export default async function handler(req, res) {
  setCors(res, 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return sendError(res, 405, 'Método no permitido');

  try {
    const db = getPool();

    // 1. Crear tablas y enums
    await db.query(SQL_INIT);

    // 2. Sembrar usuarios y sus perfiles de dominio
    const seeded = [];
    for (const u of SEED_USERS) {
      const hash = bcrypt.hashSync(u.password, 10);
      const { rowCount } = await db.query(
        `INSERT INTO usuarios (nombre, email, password, rol)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING`,
        [u.nombre, u.email, hash, u.rol]
      );
      if (rowCount > 0) seeded.push(u.email);

      // Siempre asegurar que exista el perfil en la tabla de dominio
      if (u.rol === 'estudiante') {
        await db.query(
          `INSERT INTO estudiantes (nombre, email) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING`,
          [u.nombre, u.email]
        );
      } else if (u.rol === 'tutor') {
        await db.query(
          `INSERT INTO tutores (nombre, email) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING`,
          [u.nombre, u.email]
        );
      }
    }

    const msg = seeded.length
      ? `Tablas OK. Usuarios creados: ${seeded.join(', ')}`
      : 'Tablas OK. Usuarios semilla ya existían.';

    console.log('[init-db]', msg);
    return res.status(200).json({ ok: true, message: msg });
  } catch (err) {
    console.error('[init-db]', err);
    return sendError(res, 500, 'Error al inicializar la base de datos', err.message);
  }
}
