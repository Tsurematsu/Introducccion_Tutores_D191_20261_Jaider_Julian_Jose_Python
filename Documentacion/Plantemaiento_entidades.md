Estudiante
- id
- nombre
- email
- carrera
- semestre
- fecha_ingreso
- estado_general (Activo, Inactivo, Suspendido)


Tutor
- id
- nombre
- email
- especialidades (materias/temas que domina)
- disponibilidad (franjas horarias)
- estado (Activo, Inactivo)


Tutoría
- id
- estudiante_id (FK)
- tutor_id (FK)
- asignatura
- tema
- estado (enumerado, ver abajo)
- fecha_inscripcion
- fecha_asignacion
- fecha_inicio (primera sesión)
- fecha_cierre
- motivo_cierre (Completado, Derivado, Cancelado, Proceso especial)
- numero_sesiones (contador)
- observaciones


Sesión
- id
- tutoria_id (FK)
- fecha
- tutor_evaluacion_bases (Sí/No) — solo aplica en diagnóstico
- tutor_evaluacion_comprension (Sí/No)
- observaciones
- estado_sesion (Realizada, Cancelada, Aplazada)


AsignacionTutor
- id
- tutoria_id (FK)
- tutor_id (FK)
- fecha_asignacion
- estado (Aceptada, Rechazada, Reemplazada)
- fecha_rechazo
- dentro_de_24h (booleano)
- reemplazo_conseguido (booleano)


enum EstadoTutoria {
  INSCRITO
  ASIGNADO
  EN_DIAGNOSTICO
  EN_SEGUIMIENTO_ACTIVO
  DERIVADO
  PROCESO_ESPECIAL
  CANCELADO
  APLAZADO
  COMPLETADO
}