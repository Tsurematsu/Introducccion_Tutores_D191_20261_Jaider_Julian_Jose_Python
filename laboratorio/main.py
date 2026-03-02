# ============================================================
# LABORATORIO TKINTER - VERSIÓN PROFESIONAL
# ============================================================

import sys
import os

# --- BLOQUE DE COMPATIBILIDAD DE RUTAS ---
# Permite encontrar las carpetas 'models', 'controllers' y 'views' desde 'laboratorio/'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import tkinter as tk
from tkinter import ttk, messagebox

# --- IMPORTACIONES DE LA LÓGICA MVC ---
from controllers.sistema_controller import SistemaController
from views.estudiante.inscripcion_view import InscripcionView 
from views.tutor.gestion_sesion_view import GestionSesionView

# ============================================================
# VENTANA PRINCIPAL
# ============================================================

root = tk.Tk()
root.title("Gestión Universitaria - Panel de Control")
root.geometry("550x850")  
root.configure(bg="#f0f0f0") # Color de fondo suave

# --- INICIALIZACIÓN DEL CONTROLADOR ---
# Este objeto centralizará toda la lógica de negocio y datos
controlador = SistemaController()

# Configuración de estilos profesionales con ttk
style = ttk.Style()
style.configure("TFrame", background="#f0f0f0")
style.configure("Header.TLabel", font=("Segoe UI", 14, "bold"), foreground="#2c3e50")
style.configure("Sub.TLabel", font=("Segoe UI", 10))

# ============================================================
# VARIABLES DE TKINTER
# ============================================================

nombre_var   = tk.StringVar()
edad_var     = tk.StringVar()
opcion_var   = tk.StringVar(value="Estudiante")
check_var    = tk.BooleanVar(value=False)

# ============================================================
# FUNCIONES / CALLBACKS
# ============================================================

def on_submit():
    """Se ejecuta al presionar el botón Registrar"""
    nombre = nombre_var.get().strip()
    edad   = edad_var.get().strip()
    opcion = opcion_var.get()
    acepta = check_var.get()

    if not nombre or not edad.isdigit():
        messagebox.showwarning("Error de Validación", "Por favor, ingrese un nombre válido y una edad numérica.")
        return

    resultado = (
        f"✅ Registro Procesado:\n"
        f"• Usuario: {nombre} ({edad} años)\n"
        f"• Rol Asignado: {opcion}\n"
    )
    label_resultado.config(text=resultado, foreground="#1e8449")

    # --- LÓGICA DE FLUJO DINÁMICO ---
    # Si es Estudiante, mostramos el formulario de inscripción
    if opcion == "Estudiante":
        frame_tutor.pack_forget() # Ocultamos panel de tutor si estaba abierto
        frame_tramites.pack(fill="x", pady=(0, 20), before=btn_salir)
    # Si es Tutor, mostramos el panel para seleccionar tutorías existentes
    elif opcion == "Tutor":
        frame_tramites.pack_forget() # Ocultamos inscripción
        frame_tutor.pack(fill="x", pady=(0, 20), before=btn_salir)
        vista_tutor.actualizar_lista() # Refrescamos las tutorías disponibles

def on_limpiar():
    """Limpia todos los campos"""
    nombre_var.set("")
    edad_var.set("")
    opcion_var.set("Estudiante")
    check_var.set(False)
    label_resultado.config(text="")
    frame_tramites.pack_forget()
    frame_tutor.pack_forget()

def on_salir():
    """Cierra la ventana con confirmación"""
    if messagebox.askyesno("Confirmar Salida", "¿Desea cerrar la aplicación?"):
        root.destroy()

# ============================================================
# LAYOUT — ORGANIZACIÓN VISUAL
# ============================================================

main_container = ttk.Frame(root, padding="20 20 20 20")
main_container.pack(fill="both", expand=True)

# ---- SECCIÓN 1: PERFIL DE USUARIO ----
frame_perfil = ttk.LabelFrame(main_container, text=" Información de Registro ", padding=15)
frame_perfil.pack(fill="x", pady=(0, 20))

ttk.Label(frame_perfil, text="Nombre Completo:", style="Sub.TLabel").grid(row=0, column=0, sticky="w", pady=5)
ttk.Entry(frame_perfil, textvariable=nombre_var, width=35).grid(row=0, column=1, sticky="ew", pady=5, padx=(10, 0))

ttk.Label(frame_perfil, text="Edad:", style="Sub.TLabel").grid(row=1, column=0, sticky="w", pady=5)
ttk.Entry(frame_perfil, textvariable=edad_var, width=35).grid(row=1, column=1, sticky="ew", pady=5, padx=(10, 0))

ttk.Label(frame_perfil, text="Rol del Sistema:", style="Sub.TLabel").grid(row=2, column=0, sticky="w", pady=5)
ttk.Combobox(frame_perfil, textvariable=opcion_var, values=["Estudiante", "Tutor"], state="readonly").grid(row=2, column=1, sticky="ew", pady=5, padx=(10, 0))

ttk.Checkbutton(frame_perfil, text="Acepto términos", variable=check_var).grid(row=3, column=0, columnspan=2, sticky="w", pady=10)

frame_btns_perfil = ttk.Frame(frame_perfil)
frame_btns_perfil.grid(row=4, column=0, columnspan=2, pady=10)
ttk.Button(frame_btns_perfil, text="Registrar", command=on_submit).pack(side="left", padx=5)
ttk.Button(frame_btns_perfil, text="Limpiar", command=on_limpiar).pack(side="left", padx=5)

label_resultado = ttk.Label(frame_perfil, text="", justify="left", font=("Segoe UI", 9, "italic"))
label_resultado.grid(row=5, column=0, columnspan=2, pady=5)
frame_perfil.columnconfigure(1, weight=1)

# ---- SECCIÓN 2: TRÁMITES (ESTUDIANTE) - Inicia oculto ----
frame_tramites = ttk.LabelFrame(main_container, text=" Solicitud de Tutoría ", padding=15)
# No usamos .pack() aquí para que no aparezca hasta el registro

nueva_vista = InscripcionView(frame_tramites, controlador)
nueva_vista.pack(fill="both", expand=True)

# ---- SECCIÓN 3: GESTIÓN (TUTOR) - Inicia oculto ----
frame_tutor = ttk.LabelFrame(main_container, text=" Panel de Tutoría ", padding=15)

vista_tutor = GestionSesionView(frame_tutor, controlador)
vista_tutor.pack(fill="both", expand=True)

# ---- PIE DE PÁGINA ----
btn_salir = ttk.Button(main_container, text="Cerrar Aplicación", command=on_salir)
btn_salir.pack(side="bottom", pady=(20, 0), anchor="e")

# ============================================================
# LOOP PRINCIPAL
# ============================================================
root.mainloop()