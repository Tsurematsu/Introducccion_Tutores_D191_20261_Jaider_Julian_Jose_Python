import tkinter as tk
from tkinter import ttk, messagebox

class GestionSesionView(ttk.LabelFrame):
    def __init__(self, parent, controller):
        super().__init__(parent, text=" Panel del Tutor - Asignaciones ", padding=15)
        self.controller = controller
        self.tutoria_seleccionada = tk.StringVar()
        self._init_ui()

    def _init_ui(self):
        ttk.Label(self, text="Seleccionar Tutoría Pendiente:").pack(anchor="w")
        
        # El Combobox que muestra las tutorías
        self.cb_tutorias = ttk.Combobox(self, textvariable=self.tutoria_seleccionada, state="readonly")
        self.cb_tutorias.pack(fill="x", pady=5)
        
        ttk.Button(self, text="Actualizar Lista", command=self.actualizar_lista).pack(pady=5)
        ttk.Button(self, text="Aceptar Tutoría", command=self.aceptar).pack(pady=10)

    def actualizar_lista(self):
        """Busca tutorías con estado 'INSCRITO' en el controlador"""
        pendientes = [f"ID:{t.id} - {t.asignatura}: {t.tema}" for t in self.controller.tutorias if t.estado == "INSCRITO"]
        self.cb_tutorias['values'] = pendientes
        
        # Si no hay nada, aseguramos que el combo se vea vacío
        if not pendientes:
            self.cb_tutorias.set('')

    def aceptar(self):
        seleccion = self.tutoria_seleccionada.get()
        
        if not seleccion:
            messagebox.showwarning("Atención", "Por favor, seleccione una tutoría de la lista.")
            return
        
        # 1. Extraer el ID para procesar en el controlador
        try:
            t_id = int(seleccion.split(" - ")[0].replace("ID:", ""))
            
            # 2. Cambiar el estado en la lógica de negocio
            tutoria = next(t for t in self.controller.tutorias if t.id == t_id)
            tutoria.estado = "ASIGNADO"
            
            messagebox.showinfo("Éxito", f"Has aceptado la tutoría: {tutoria.asignatura}")
            
            # --- LA SOLUCIÓN A TU PETICIÓN ---
            # 3. Limpiar la caja de texto (Combobox)
            self.cb_tutorias.set('') 
            
            # 4. Refrescar la lista para que la que acabamos de aceptar ya no aparezca
            self.actualizar_lista()
            
        except Exception as e:
            messagebox.showerror("Error", f"No se pudo procesar la asignación: {e}")