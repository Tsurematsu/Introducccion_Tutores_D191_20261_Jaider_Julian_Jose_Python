from datetime import datetime, timedelta
# --- IMPORTACIÓN NECESARIA ---
from models.entidades import Tutoria 

class SistemaController:
    def __init__(self):
        self.tutorias = []
        self.estudiantes = {} 
        self.tutores = {}     

    def inscribir_tutoria(self, estudiante_id, asignatura, tema):
        # Regla: Máximo 3 tutorías activas
        activas = [t for t in self.tutorias if t.estudiante_id == estudiante_id 
                   and t.estado not in ["COMPLETADO", "CANCELADO"]]
        
        if len(activas) >= 3:
            return False, "Error: Ya posees 3 tutorías activas."
        
        # Ahora Python ya sabrá qué es 'Tutoria'
        nueva = Tutoria(len(self.tutorias)+1, estudiante_id, asignatura, tema)
        self.tutorias.append(nueva)
        return True, "Inscripción exitosa. Estado: INSCRITO."

    def verificar_rechazo_tutor(self, fecha_asignacion):
        # Regla: Rechazo sin consecuencia dentro de 24h
        ahora = datetime.now()
        return ahora <= (fecha_asignacion + timedelta(hours=24))

    def registrar_sesion(self, tutoria_id, es_diagnostico, tiene_bases, comprendio):
        tutoria = next((t for t in self.tutorias if t.id == tutoria_id), None)
        if not tutoria: return False
        
        tutoria.numero_sesiones += 1
        
        if es_diagnostico:
            if not tiene_bases:
                tutoria.estado = "EN_DIAGNOSTICO" 
            else:
                tutoria.estado = "EN_SEGUIMIENTO_ACTIVO"
        
        if comprendio:
            tutoria.estado = "COMPLETADO" 
        
        return True