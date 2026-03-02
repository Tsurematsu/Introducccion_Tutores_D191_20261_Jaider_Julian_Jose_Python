from datetime import datetime, timedelta

class TutoriaController:
    def __init__(self):
        # En una fase real, aquí se conectaría con la base de datos (template.sql)
        self.tutorias_activas = [] 

    def validar_inscripcion(self, estudiante_id):
        """Regla: Máximo 3 tutorías activas simultáneas"""
        activas = [t for t in self.tutorias_activas 
                   if t.estudiante_id == estudiante_id and t.estado not in ["COMPLETADO", "CANCELADO"]]
        return len(activas) < 3

    def registrar_inscripcion(self, estudiante_id, asignatura, tema):
        if not self.validar_inscripcion(estudiante_id):
            return False, "Ya tienes el máximo de 3 tutorías activas."
        
        # Lógica para crear la tutoría
        nueva_tutoria = {
            "estudiante": estudiante_id,
            "asignatura": asignatura,
            "tema": tema,
            "estado": "INSCRITO"
        }
        self.tutorias_activas.append(nueva_tutoria)
        return True, "Inscripción exitosa. Buscando tutor disponible..."

    def verificar_rechazo_tutor(self, fecha_asignacion):
        """Regla: Rechazo sin consecuencias dentro de las primeras 24h"""
        ahora = datetime.now()
        limite = fecha_asignacion + timedelta(hours=24)
        return ahora <= limite