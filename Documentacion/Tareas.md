## Base + Lógica de negocio

### 🔴 Alta prioridad

- [ ] Configurar el proyecto (estructura de carpetas, dependencias, `.env`)
- [ ] Conexión a PostgreSQL con SQLAlchemy (`database/connection.py`)
- [ ] Modelos SQLAlchemy basados en el schema (`models/`)
  - [ ] `models/usuario.py`
  - [ ] `models/estudiante.py`
  - [ ] `models/tutor.py`
  - [ ] `models/tutoria.py`
  - [ ] `models/sesion.py`
  - [ ] `models/asignacion.py`
  - [ ] `models/notificacion.py`
- [ ] Controlador de autenticación y manejo de roles (`controllers/auth.py`)
- [ ] Controlador de tutorías con reglas de negocio (`controllers/tutoria.py`)
  - [ ] Validar límite de 3 tutorías activas por estudiante
  - [ ] Lógica de asignación de tutor por disponibilidad y tema
  - [ ] Lógica de rechazo dentro y fuera de las 24h
  - [ ] Lógica de derivación a proceso especial al superar 3 sesiones
- [ ] Controlador de sesiones (`controllers/sesion.py`)
- [ ] Apoyo y revisión del trabajo de los compañeros

---

## Módulo Tutor

### 🔴 Alta prioridad

- [ ] Vista de login (compartida con todos los roles)

### 🟡 Media prioridad

- [ ] Dashboard del tutor (tutorías asignadas y su estado)
- [ ] Vista de detalle de tutoría (perspectiva tutor)
- [ ] Vista de gestión de sesión
  - [ ] Registrar evaluación de bases del estudiante
  - [ ] Registrar evaluación de comprensión al cierre
  - [ ] Agregar observaciones
- [ ] Vista de aceptar / rechazar asignación

---

## Módulo Estudiante + Admin

### 🟡 Media prioridad

- [ ] Dashboard del estudiante (tutorías activas y su estado)
- [ ] Vista de inscripción a tutoría (selección de asignatura, tema y franja horaria)

### 🟢 Baja prioridad

- [ ] Vista de detalle de tutoría (perspectiva estudiante)
- [ ] Vista de historial de tutorías (completadas, canceladas, derivadas)
- [ ] Vista de registro de estudiantes (admin)
- [ ] Vista de registro de tutores (admin)

---

## Resumen general

| Tarea | Responsable | Prioridad |
|---|---|---|
| Setup del proyecto y dependencias | Tú | 🔴 Alta |
| Conexión BD y modelos SQLAlchemy | Tú | 🔴 Alta |
| Controladores (auth, tutoria, sesion) | Tú | 🔴 Alta |
| Login (vista compartida) | Compañero A | 🔴 Alta |
| Dashboard tutor | Compañero A | 🟡 Media |
| Detalle tutoría (tutor) | Compañero A | 🟡 Media |
| Gestión de sesión | Compañero A | 🟡 Media |
| Aceptar / rechazar asignación | Compañero A | 🟡 Media |
| Dashboard estudiante | Compañero B | 🟡 Media |
| Inscripción a tutoría | Compañero B | 🟡 Media |
| Detalle tutoría (estudiante) | Compañero B | 🟢 Baja |
| Historial de tutorías | Compañero B | 🟢 Baja |
| Registro estudiantes y tutores (admin) | Compañero B | 🟢 Baja |