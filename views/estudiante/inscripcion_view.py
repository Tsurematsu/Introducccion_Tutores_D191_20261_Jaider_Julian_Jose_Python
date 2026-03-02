import tkinter as tk
from tkinter import ttk, messagebox

class InscripcionView(ttk.LabelFrame):
    def __init__(self, parent, controller):
        super().__init__(parent, text=" Nueva Solicitud de Tutoría ", padding=15)
        self.controller = controller
        
        # Variables de control
        self.asig_var = tk.StringVar(value="Seleccione una...")
        self.tema_var = tk.StringVar(value="Seleccione un tema...")
        self.horario_var = tk.StringVar(value="Mañana (8:00 - 12:00)")
        
        self._init_ui()

    def _init_ui(self):
        # 1. Selección de Asignatura
        ttk.Label(self, text="Asignatura:").grid(row=0, column=0, sticky="w", pady=5)
        asignaturas = ["Programación", "Cálculo Diferencial", "Álgebra Lineal", "Física Mecánica"]
        self.cb_asig = ttk.Combobox(self, textvariable=self.asig_var, values=asignaturas, state="readonly", width=30)
        self.cb_asig.grid(row=0, column=1, sticky="ew", pady=5, padx=10)
        
        # Evento para cambiar los temas según la materia elegida
        self.cb_asig.bind("<<ComboboxSelected>>", self._actualizar_temas)

        # 2. Selección de Tema (Convertido a Combobox)
        ttk.Label(self, text="Tema Específico:").grid(row=1, column=0, sticky="w", pady=5)
        self.cb_tema = ttk.Combobox(self, textvariable=self.tema_var, state="readonly", width=30)
        self.cb_tema.grid(row=1, column=1, sticky="ew", pady=5, padx=10)

        # 3. Franja Horaria
        ttk.Label(self, text="Franja Horaria:").grid(row=2, column=0, sticky="w", pady=5)
        franjas = ["Mañana (8:00 - 12:00)", "Tarde (14:00 - 18:00)", "Noche (18:00 - 21:00)"]
        ttk.Combobox(self, textvariable=self.horario_var, values=franjas, state="readonly", width=30).grid(row=2, column=1, sticky="ew", pady=5, padx=10)

        # Botón de envío
        ttk.Button(self, text="Inscribir Tutoría", command=self.enviar).grid(row=3, column=0, columnspan=2, pady=15)
        
        self.columnconfigure(1, weight=1)

    def _actualizar_temas(self, event):
        """Cambia dinámicamente los temas disponibles según la asignatura"""
        temas_dict = {
            "Programación": ["Herencia", "Polimorfismo", "Interfaces Gráficas", "Diccionarios"],
            "Cálculo Diferencial": ["Límites", "Derivadas", "Optimización"],
            "Álgebra Lineal": ["Matrices", "Vectores", "Sistemas de Ecuaciones"],
            "Física Mecánica": ["Cinemática", "Leyes de Newton", "Energía"]
        }
        materia = self.asig_var.get()
        self.cb_tema['values'] = temas_dict.get(materia, [])
        self.cb_tema.set("Seleccione un tema...")

    def enviar(self):
        """Registra la tutoría en el controlador y limpia los campos"""
        materia = self.asig_var.get()
        tema = self.tema_var.get()
        
        if materia == "Seleccione una..." or tema == "Seleccione un tema...":
            messagebox.showwarning("Atención", "Por favor seleccione una materia y un tema.")
            return
            
        # Registrar en el controlador (usando ID ficticio de estudiante)
        exito, mensaje = self.controller.inscribir_tutoria("EST_01", materia, tema)
        
        if exito:
            messagebox.showinfo("Éxito", f"{mensaje}\nTema: {tema}")
            # Limpiar campos después de registrar
            self.asig_var.set("Seleccione una...")
            self.tema_var.set("Seleccione un tema...")
            self.cb_tema['values'] = []
        else:
            messagebox.showerror("Error", mensaje)