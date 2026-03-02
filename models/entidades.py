from datetime import datetime

class Estudiante:
    def __init__(self, id, nombre, email, carrera, semestre, fecha_ingreso, estado_general="Activo"):
        self.id = id
        self.nombre = nombre
        self.email = email
        self.carrera = carrera
        self.semestre = semestre
        self.fecha_ingreso = fecha_ingreso
        self.estado_general = estado_general

class Tutor:
    def __init__(self, id, nombre, email, especialidades, disponibilidad, estado="Activo"):
        self.id = id
        self.nombre = nombre
        self.email = email
        self.especialidades = especialidades # Lista de materias
        self.disponibilidad = disponibilidad # Franjas horarias
        self.estado = estado

class Tutoria:
    def __init__(self, id, estudiante_id, asignatura, tema, tutor_id=None):
        self.id = id
        self.estudiante_id = estudiante_id
        self.tutor_id = tutor_id
        self.asignatura = asignatura
        self.tema = tema
        self.estado = "INSCRITO"
        self.fecha_inscripcion = datetime.now()
        self.fecha_asignacion = None
        self.numero_sesiones = 0
        self.observaciones = ""

class Sesion:
    def __init__(self, id, tutoria_id, fecha, es_diagnostico=False):
        self.id = id
        self.tutoria_id = tutoria_id
        self.fecha = fecha
        self.tutor_evaluacion_bases = None      # Solo para diagnóstico
        self.tutor_evaluacion_comprension = None # Cierre de sesión
        self.estado_sesion = "Programada"
        self.observaciones = ""