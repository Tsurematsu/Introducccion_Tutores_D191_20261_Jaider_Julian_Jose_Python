-- ============================================================
-- SCHEMA: Sistema de Tutorías Universitarias
-- Base de datos: PostgreSQL
-- ============================================================

-- Extensión para soporte de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE rol_usuario AS ENUM (
    'ADMINISTRADOR',
    'TUTOR',
    'ESTUDIANTE'
);

CREATE TYPE estado_tutoria AS ENUM (
    'INSCRITO',
    'ASIGNADO',
    'EN_DIAGNOSTICO',
    'EN_SEGUIMIENTO_ACTIVO',
    'DERIVADO',
    'PROCESO_ESPECIAL',
    'CANCELADO',
    'APLAZADO',
    'COMPLETADO'
);

CREATE TYPE estado_asignacion AS ENUM (
    'PENDIENTE',
    'ACEPTADA',
    'RECHAZADA',
    'REEMPLAZADA'
);

CREATE TYPE estado_sesion AS ENUM (
    'PROGRAMADA',
    'REALIZADA',
    'CANCELADA',
    'APLAZADA'
);

CREATE TYPE motivo_cierre AS ENUM (
    'COMPLETADO',
    'DERIVADO',
    'CANCELADO',
    'PROCESO_ESPECIAL'
);

-- ============================================================
-- TABLA: usuarios
-- Base común para estudiantes, tutores y administradores
-- ============================================================

CREATE TABLE usuarios (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre          VARCHAR(100) NOT NULL,
    apellido        VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    rol             rol_usuario NOT NULL,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizado_en  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: estudiantes
-- Extiende usuarios con datos académicos
-- ============================================================

CREATE TABLE estudiantes (
    id          UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    carrera     VARCHAR(150) NOT NULL,
    semestre    SMALLINT NOT NULL CHECK (semestre BETWEEN 1 AND 12),
    codigo      VARCHAR(20) NOT NULL UNIQUE
);

-- ============================================================
-- TABLA: tutores
-- Extiende usuarios con datos del tutor
-- ============================================================

CREATE TABLE tutores (
    id          UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo      VARCHAR(150),
    departamento VARCHAR(150)
);

-- ============================================================
-- TABLA: especialidades_tutor
-- Un tutor puede dominar múltiples asignaturas y temas
-- ============================================================

CREATE TABLE especialidades_tutor (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id    UUID NOT NULL REFERENCES tutores(id) ON DELETE CASCADE,
    asignatura  VARCHAR(150) NOT NULL,
    tema        VARCHAR(255) NOT NULL
);

-- ============================================================
-- TABLA: disponibilidad_tutor
-- Franjas horarias disponibles del tutor
-- ============================================================

CREATE TABLE disponibilidad_tutor (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id    UUID NOT NULL REFERENCES tutores(id) ON DELETE CASCADE,
    dia_semana  SMALLINT NOT NULL CHECK (dia_semana BETWEEN 1 AND 7), -- 1=Lunes, 7=Domingo
    hora_inicio TIME NOT NULL,
    hora_fin    TIME NOT NULL,
    disponible  BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- TABLA: tutorias
-- Núcleo del sistema. Representa cada proceso de tutoría
-- ============================================================

CREATE TABLE tutorias (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id       UUID NOT NULL REFERENCES estudiantes(id) ON DELETE RESTRICT,
    tutor_id            UUID REFERENCES tutores(id) ON DELETE SET NULL,
    asignatura          VARCHAR(150) NOT NULL,
    tema                VARCHAR(255) NOT NULL,
    estado              estado_tutoria NOT NULL DEFAULT 'INSCRITO',
    motivo_cierre       motivo_cierre,
    numero_sesiones     SMALLINT NOT NULL DEFAULT 0,
    observaciones       TEXT,
    fecha_inscripcion   TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_asignacion    TIMESTAMP,
    fecha_inicio        TIMESTAMP,
    fecha_cierre        TIMESTAMP,
    creado_en           TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizado_en      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Regla: máximo 3 tutorías activas por estudiante (se refuerza en la app)
-- Índice para consultar rápido las tutorías activas de un estudiante
CREATE INDEX idx_tutorias_estudiante ON tutorias(estudiante_id, estado);

-- ============================================================
-- TABLA: asignaciones_tutor
-- Historial de asignaciones, rechazos y reemplazos por tutoría
-- ============================================================

CREATE TABLE asignaciones_tutor (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutoria_id              UUID NOT NULL REFERENCES tutorias(id) ON DELETE CASCADE,
    tutor_id                UUID NOT NULL REFERENCES tutores(id) ON DELETE RESTRICT,
    estado                  estado_asignacion NOT NULL DEFAULT 'PENDIENTE',
    fecha_asignacion        TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_respuesta         TIMESTAMP,
    dentro_de_24h           BOOLEAN,                  -- TRUE si respondió dentro del plazo
    reemplazo_conseguido    BOOLEAN,                  -- Solo aplica si rechazó fuera de 24h
    observacion             TEXT
);

-- ============================================================
-- TABLA: sesiones
-- Cada encuentro entre tutor y estudiante dentro de una tutoría
-- ============================================================

CREATE TABLE sesiones (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutoria_id                  UUID NOT NULL REFERENCES tutorias(id) ON DELETE CASCADE,
    fecha_programada            TIMESTAMP NOT NULL,
    fecha_realizada             TIMESTAMP,
    estado                      estado_sesion NOT NULL DEFAULT 'PROGRAMADA',
    evaluacion_bases            BOOLEAN,     -- ¿El estudiante tiene bases? (solo en diagnóstico)
    evaluacion_comprension      BOOLEAN,     -- ¿El estudiante comprendió el tema?
    observaciones               TEXT,
    creado_en                   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: notificaciones
-- Alertas generadas por el sistema hacia el estudiante o tutor
-- ============================================================

CREATE TABLE notificaciones (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id      UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tutoria_id      UUID REFERENCES tutorias(id) ON DELETE SET NULL,
    mensaje         TEXT NOT NULL,
    leida           BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en       TIMESTAMP NOT NULL DEFAULT NOW()
);