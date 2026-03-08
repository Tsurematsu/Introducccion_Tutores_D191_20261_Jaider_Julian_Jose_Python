import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getUsuario } from '../router';

/* ── Tipos ─────────────────────────────────────────────────────────────── */
type Franja = { dia: string; hora_inicio: string; hora_fin: string };
type Tutor = {
  id: number; nombre: string; email: string;
  especialidades: string[];
  disponibilidad: { franjas: Franja[] } | null;
  estado: string;
};

const DIAS_ORDEN = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

// Banco de asignaturas comunes para sugerencias
const ASIGNATURAS_BASE = [
  'Cálculo I','Cálculo II','Cálculo III','Álgebra Lineal','Álgebra',
  'Estadística','Probabilidad',
  'Programación','Estructuras de Datos','Algoritmos','Bases de Datos',
  'Física I','Física II','Química','Biología',
  'Inglés','Redacción','Comunicación',
  'Economía','Contabilidad','Administración',
  'Derecho','Filosofía','Historia',
  'Circuitos Eléctricos','Sistemas Operativos','Redes',
];

/* ── Helper colores ─────────────────────────────────────────────────────── */
function colorEsp(idx: number) {
  const p = [
    'bg-primary/10 text-primary',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
    'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    'bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  ];
  return p[idx % p.length];
}

/* ── Componente ─────────────────────────────────────────────────────────── */
@customElement('est-tutores')
export class EstTutores extends LitElement {
  @state() private tutores: Tutor[]  = [];
  @state() private cargando          = true;
  @state() private busqueda          = '';
  @state() private filtroEsp         = '';

  // Modal de agendamiento
  @state() private modalTutor: Tutor | null   = null;
  @state() private agAsignatura               = '';
  @state() private agTema                     = '';
  @state() private agObs                      = '';
  @state() private agFranjaIdx                = -1;
  @state() private agGuardando                = false;

  // Sugerencias de asignatura en el modal
  @state() private sugerencias: string[]      = [];
  @state() private mostrarSugerencias         = false;

  // Feedback
  @state() private msg: { tipo: 'ok' | 'error'; texto: string } | null = null;

  // Detalle expandido
  @state() private tutorDetalle: number | null = null;

  createRenderRoot() { return this; }
  connectedCallback() { super.connectedCallback(); this._cargar(); }

  /* ── API ────────────────────────────────────────────────────────────── */
  private get _token() { return localStorage.getItem('token') ?? ''; }

  private async _cargar() {
    try {
      const r = await fetch('/api/tutores', {
        headers: { Authorization: `Bearer ${this._token}` },
      });
      const data = await r.json();
      const activos: Tutor[] = (Array.isArray(data) ? data : []).filter((t: Tutor) => t.estado === 'Activo');
      // Agregar disponibilidad individual
      const conDisp = await Promise.all(activos.map(async t => {
        try {
          const rd = await fetch(`/api/disponibilidad?tutor_id=${t.id}`, {
            headers: { Authorization: `Bearer ${this._token}` },
          });
          if (rd.ok) {
            const d = await rd.json();
            return { ...t, especialidades: d.especialidades ?? t.especialidades, disponibilidad: d.disponibilidad ?? null };
          }
        } catch { /* silent */ }
        return t;
      }));
      this.tutores = conDisp;
    } catch { /* silent */ }
    finally { this.cargando = false; }
  }

  /** Crea la tutoría en la BD usando perfil_id del JWT */
  private async _agendar() {
    const u = getUsuario();
    // perfil_id es el id en la tabla "estudiantes", id es el de "usuarios"
    const estudianteId = u?.perfil_id ?? u?.id;
    if (!u || !this.modalTutor || !this.agAsignatura.trim()) return;
    if (!estudianteId) {
      this._toast('error', 'No se encontró tu perfil de estudiante. Asegúrate de que tu cuenta esté inicializada en /api/init-db');
      return;
    }
    this.agGuardando = true;
    const nomTutor   = this.modalTutor.nombre;
    const tutorId    = this.modalTutor.id;
    try {
      // 1. Crear tutoría
      const r = await fetch('/api/tutorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this._token}` },
        body: JSON.stringify({
          estudiante_id: estudianteId,
          asignatura:    this.agAsignatura.trim(),
          tema:          this.agTema.trim() || null,
          observaciones: this.agObs.trim()  || null,
        }),
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error ?? 'Error al crear la tutoría');
      }
      const tutoria = await r.json();

      // 2. Crear asignacion_tutor → esto actualiza el estado de la tutoría a ASIGNADO
      //    Y crea el registro en asignaciones_tutor que aparece en "Mis Asignaciones" del tutor
      const ra = await fetch('/api/asignaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this._token}` },
        body: JSON.stringify({
          tutoria_id:    tutoria.id,
          tutor_id:      tutorId,
          dentro_de_24h: true,
        }),
      });
      if (!ra.ok) {
        // No bloquear si falla la asignacion; la tutoría ya fue creada
        console.warn('[est-tutores] No se pudo crear asignacion_tutor:', await ra.text());
      }

      this.modalTutor = null;
      this._toast('ok', `¡Cita agendada con ${nomTutor}! Ya está registrada con estado ASIGNADO.`);
    } catch (e: unknown) {
      this._toast('error', `No se pudo agendar: ${(e as Error).message}`);
    } finally {
      this.agGuardando = false;
    }
  }

  private _abrirModal(tutor: Tutor) {
    this.modalTutor       = tutor;
    this.agAsignatura     = (tutor.especialidades ?? [])[0] ?? '';
    this.agTema           = '';
    this.agObs            = '';
    this.agFranjaIdx      = -1;
    this.sugerencias      = [];
    this.mostrarSugerencias = false;
    this._calcularSugerencias(this.agAsignatura);
  }

  /** Actualiza las sugerencias de asignatura al escribir */
  private _onAsignaturaInput(val: string) {
    this.agAsignatura = val;
    this._calcularSugerencias(val);
  }

  private _calcularSugerencias(val: string) {
    if (!val.trim() || val.length < 2) {
      this.sugerencias = [];
      this.mostrarSugerencias = false;
      return;
    }
    const q = val.toLowerCase();
    // Mezcla: especialidades del tutor + banco general
    const pool = [
      ...(this.modalTutor?.especialidades ?? []),
      ...ASIGNATURAS_BASE,
    ];
    // Deduplicar y filtrar
    const unicas = [...new Set(pool)];
    this.sugerencias = unicas
      .filter(a => a.toLowerCase().includes(q) && a.toLowerCase() !== q)
      .slice(0, 6);
    this.mostrarSugerencias = this.sugerencias.length > 0;
  }

  private _seleccionarSugerencia(s: string) {
    this.agAsignatura       = s;
    this.sugerencias        = [];
    this.mostrarSugerencias = false;
  }

  private _toast(tipo: 'ok' | 'error', texto: string) {
    this.msg = { tipo, texto };
    setTimeout(() => { this.msg = null; }, 6000);
  }

  /* ── Helpers ────────────────────────────────────────────────────────── */
  private get _todasEspecialidades(): string[] {
    const set = new Set<string>();
    this.tutores.forEach(t => (t.especialidades ?? []).forEach(e => set.add(e)));
    return [...set].sort();
  }

  private get _filtrados(): Tutor[] {
    const q = this.busqueda.toLowerCase().trim();
    return this.tutores.filter(t => {
      const matchQ  = !q || t.nombre.toLowerCase().includes(q) || (t.especialidades ?? []).some(e => e.toLowerCase().includes(q));
      const matchE  = !this.filtroEsp || (t.especialidades ?? []).includes(this.filtroEsp);
      return matchQ && matchE;
    });
  }

  private _franjasTutor(t: Tutor): Franja[] {
    return (t.disponibilidad?.franjas ?? [])
      .slice()
      .sort((a, b) => DIAS_ORDEN.indexOf(a.dia) - DIAS_ORDEN.indexOf(b.dia));
  }

  /* ── Render: Modal Agendar ──────────────────────────────────────────── */
  private _renderModal(): TemplateResult {
    const t = this.modalTutor;
    if (!t) return html``;
    const franjas = this._franjasTutor(t);

    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
           @click=${(e: Event) => { if (e.target === e.currentTarget) this.modalTutor = null; }}>
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div class="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800
                    shadow-2xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col">

          <!-- Header -->
          <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white
                          flex items-center justify-center text-xl font-black flex-shrink-0">
                ${t.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 class="font-black text-slate-900 dark:text-white">Agendar cita</h3>
                <p class="text-xs text-slate-400 mt-0.5">con <span class="font-semibold text-slate-600 dark:text-slate-300">${t.nombre}</span></p>
              </div>
            </div>
            <button @click=${() => { this.modalTutor = null; }}
              class="text-slate-400 hover:text-slate-600 transition-colors p-1 flex-shrink-0 mt-1">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 space-y-5 overflow-y-auto flex-1">

            <!-- Disponibilidad del tutor -->
            ${franjas.length > 0 ? html`
              <div>
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Selecciona un horario disponible
                </label>
                <div class="grid grid-cols-1 gap-2">
                  ${franjas.map((f, i) => html`
                    <button @click=${() => { this.agFranjaIdx = this.agFranjaIdx === i ? -1 : i; }}
                      class="flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-left
                             ${this.agFranjaIdx === i
                               ? 'border-primary bg-primary/10 text-primary'
                               : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-primary/50'}">
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm ${this.agFranjaIdx === i ? 'text-primary' : 'text-slate-400'}">schedule</span>
                        <span class="text-sm font-bold">${f.dia}</span>
                        <span class="text-sm text-slate-500 dark:text-slate-400">${f.hora_inicio} – ${f.hora_fin}</span>
                      </div>
                      ${this.agFranjaIdx === i ? html`<span class="material-symbols-outlined text-primary text-sm">check_circle</span>` : ''}
                    </button>`)}
                </div>
              </div>
            ` : html`
              <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl px-4 py-3">
                <p class="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <span class="material-symbols-outlined text-base">schedule</span>
                  Este tutor aún no ha configurado sus horarios, pero igualmente puedes solicitar la cita.
                </p>
              </div>
            `}

            <!-- Asignatura con sugerencias -->
            <div class="flex flex-col gap-1.5 relative">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Asignatura *</label>
              <div class="relative">
                <input id="input-asignatura-modal"
                  type="text"
                  autocomplete="off"
                  placeholder="Escribe para buscar o elige una…"
                  .value=${this.agAsignatura}
                  @input=${(e: Event) => this._onAsignaturaInput((e.target as HTMLInputElement).value)}
                  @focus=${() => { if (this.agAsignatura.length >= 2) this.mostrarSugerencias = this.sugerencias.length > 0; }}
                  @blur=${() => { setTimeout(() => { this.mostrarSugerencias = false; }, 150); }}
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                         rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100
                         focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                ${this.agAsignatura ? html`
                  <button @click=${() => { this.agAsignatura = ''; this.sugerencias = []; }}
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    <span class="material-symbols-outlined text-lg">close</span>
                  </button>` : ''}
              </div>

              <!-- Dropdown sugerencias -->
              ${this.mostrarSugerencias && this.sugerencias.length > 0 ? html`
                <div class="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-slate-900
                            border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
                  ${this.sugerencias.map(s => html`
                    <button @mousedown=${() => this._seleccionarSugerencia(s)}
                      class="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm
                             hover:bg-primary/5 hover:text-primary transition-colors text-slate-700 dark:text-slate-300
                             border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <span class="material-symbols-outlined text-sm text-slate-400">school</span>
                      ${s}
                    </button>`)}
                </div>` : ''}

              <!-- Chips de especialidades del tutor -->
              ${(t.especialidades ?? []).length > 0 ? html`
                <div class="flex flex-wrap gap-1.5 mt-1">
                  <span class="text-[10px] text-slate-400 font-semibold self-center">Especialidades del tutor:</span>
                  ${(t.especialidades ?? []).map(esp => html`
                    <button @click=${() => { this.agAsignatura = esp; this.mostrarSugerencias = false; }}
                      class="text-[11px] font-semibold px-2 py-0.5 rounded-full cursor-pointer transition-all
                             bg-primary/10 text-primary hover:bg-primary hover:text-white">
                      ${esp}
                    </button>`)}
                </div>` : ''}
            </div>

            <!-- Tema específico -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tema <span class="font-normal normal-case">(opcional)</span>
              </label>
              <input type="text" placeholder="Ej: Integrales por sustitución…"
                .value=${this.agTema}
                @input=${(e: Event) => { this.agTema = (e.target as HTMLInputElement).value; }}
                class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                       rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100
                       focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>

            <!-- Observaciones -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Observaciones <span class="font-normal normal-case">(opcional)</span>
              </label>
              <textarea rows="3" placeholder="Describe tu dificultad o qué necesitas reforzar…"
                .value=${this.agObs}
                @input=${(e: Event) => { this.agObs = (e.target as HTMLTextAreaElement).value; }}
                class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                       rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100
                       focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"></textarea>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-shrink-0">
            <button @click=${() => { this.modalTutor = null; }}
              class="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400
                     border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              Cancelar
            </button>
            <button id="btn-confirmar-cita"
              @click=${() => this._agendar()}
              ?disabled=${this.agGuardando || !this.agAsignatura.trim()}
              class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-primary text-white
                     hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
              ${this.agGuardando
                ? html`<span class="material-symbols-outlined animate-spin text-lg">progress_activity</span> Agendando...`
                : html`<span class="material-symbols-outlined text-lg">event_available</span> Confirmar cita`}
            </button>
          </div>
        </div>
      </div>`;
  }

  /* ── Render: Card tutor ─────────────────────────────────────────────── */
  private _renderCard(t: Tutor): TemplateResult {
    const expanded = this.tutorDetalle === t.id;
    const franjas  = this._franjasTutor(t);
    const tieneD   = franjas.length > 0;

    return html`
      <div class="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800
                  shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex flex-col overflow-hidden">
        <div class="p-5 flex flex-col gap-4 flex-1">
          <!-- Avatar + nombre -->
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white
                        flex items-center justify-center text-2xl font-black flex-shrink-0 shadow-md">
              ${t.nombre.charAt(0).toUpperCase()}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-black text-slate-900 dark:text-slate-100 truncate">${t.nombre}</p>
              <p class="text-xs text-slate-400 truncate mt-0.5">${t.email}</p>
              <div class="mt-1.5">
                ${tieneD ? html`
                  <span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"></span>
                    ${franjas.length} franja${franjas.length !== 1 ? 's' : ''} disponible${franjas.length !== 1 ? 's' : ''}
                  </span>
                ` : html`
                  <span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800">
                    Sin horario configurado
                  </span>
                `}
              </div>
            </div>
          </div>

          <!-- Especialidades -->
          <div class="flex flex-wrap gap-1.5">
            ${(t.especialidades ?? []).length === 0
              ? html`<span class="text-xs text-slate-400 italic">Sin especialidades</span>`
              : (t.especialidades ?? []).slice(0, 5).map((esp, i) => html`
                  <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${colorEsp(i)}">${esp}</span>`)}
            ${(t.especialidades ?? []).length > 5 ? html`
              <span class="text-[11px] text-slate-400">+${t.especialidades.length - 5} más</span>` : ''}
          </div>

          <!-- Horarios expandibles -->
          ${tieneD ? html`
            <div>
              <button @click=${() => { this.tutorDetalle = expanded ? null : t.id; }}
                class="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors">
                <span class="material-symbols-outlined text-sm">schedule</span>
                ${expanded ? 'Ocultar horarios' : 'Ver horarios disponibles'}
                <span class="material-symbols-outlined text-sm transition-transform duration-200 ${expanded ? 'rotate-180' : ''}">expand_more</span>
              </button>
              ${expanded ? html`
                <div class="mt-3 space-y-1.5">
                  ${franjas.map(f => html`
                    <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
                      <span class="material-symbols-outlined text-primary text-sm">schedule</span>
                      <span class="text-xs font-bold text-slate-700 dark:text-slate-300">${f.dia}</span>
                      <span class="text-xs text-slate-500">${f.hora_inicio} – ${f.hora_fin}</span>
                    </div>`)}
                </div>` : ''}
            </div>
          ` : ''}
        </div>

        <!-- CTA -->
        <div class="px-5 pb-5">
          <button id="btn-agendar-${t.id}"
            @click=${() => this._abrirModal(t)}
            class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all
                   ${tieneD
                     ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                     : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-primary hover:text-white hover:border-primary'}">
            <span class="material-symbols-outlined text-lg">event_available</span>
            ${tieneD ? 'Agendar cita disponible' : 'Solicitar cita'}
          </button>
        </div>
      </div>`;
  }

  /* ── Render principal ───────────────────────────────────────────────── */
  render(): TemplateResult {
    const filtrados = this._filtrados;
    const todasEsp  = this._todasEspecialidades;

    return html`
      ${this._renderModal()}

      <div class="px-6 lg:px-20 py-8">
        <div class="max-w-6xl mx-auto flex flex-col gap-6">

          <!-- Header -->
          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">person_search</span>
              Tutores Disponibles
            </h1>
            <p class="text-slate-500 text-sm mt-1">
              ${this.tutores.length} tutor${this.tutores.length !== 1 ? 'es' : ''} activo${this.tutores.length !== 1 ? 's' : ''}
              · Mostrando <strong class="text-primary">${filtrados.length}</strong>
            </p>
          </div>

          <!-- Toast -->
          ${this.msg ? html`
            <div class="flex items-start gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                        ${this.msg.tipo === 'ok'
                          ? 'bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400'
                          : 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400'}">
              <span class="material-symbols-outlined text-lg flex-shrink-0">${this.msg.tipo === 'ok' ? 'check_circle' : 'error'}</span>
              <span>${this.msg.texto}</span>
            </div>` : ''}

          <!-- Filtros -->
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
              <input placeholder="Buscar por nombre o asignatura…"
                .value=${this.busqueda}
                @input=${(e: Event) => { this.busqueda = (e.target as HTMLInputElement).value; }}
                class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                       rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <select .value=${this.filtroEsp}
              @change=${(e: Event) => { this.filtroEsp = (e.target as HTMLSelectElement).value; }}
              class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm
                     text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-w-[180px]">
              <option value="">Todas las asignaturas</option>
              ${todasEsp.map(e => html`<option .value=${e}>${e}</option>`)}
            </select>
            ${this.filtroEsp || this.busqueda ? html`
              <button @click=${() => { this.busqueda = ''; this.filtroEsp = ''; }}
                class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500
                       border border-slate-200 dark:border-slate-700 hover:border-red-300 hover:text-red-500 transition-all whitespace-nowrap">
                <span class="material-symbols-outlined text-sm">filter_alt_off</span>Limpiar
              </button>` : ''}
          </div>

          <!-- Grid -->
          ${this.cargando ? html`
            <div class="flex justify-center py-20 text-slate-400">
              <span class="material-symbols-outlined animate-spin text-5xl">progress_activity</span>
            </div>
          ` : filtrados.length === 0 ? html`
            <div class="flex flex-col items-center gap-3 py-20 text-slate-400">
              <span class="material-symbols-outlined text-6xl">person_search</span>
              <p class="text-base font-semibold">No se encontraron tutores</p>
              <p class="text-sm">Prueba otro nombre o asignatura</p>
            </div>
          ` : html`
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              ${filtrados.map(t => this._renderCard(t))}
            </div>
          `}

        </div>
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'est-tutores': EstTutores; }
}
