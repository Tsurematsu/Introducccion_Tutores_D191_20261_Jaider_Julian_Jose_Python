import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getUsuario } from '../router';

/* ── Tipos ─────────────────────────────────────────────────────────────── */
type EstadoTutoria =
  | 'INSCRITO' | 'ASIGNADO' | 'EN_DIAGNOSTICO'
  | 'EN_SEGUIMIENTO_ACTIVO' | 'DERIVADO' | 'PROCESO_ESPECIAL'
  | 'CANCELADO' | 'APLAZADO' | 'COMPLETADO';

type Tutoria = {
  id: number; asignatura: string; tema: string | null; observaciones: string | null;
  estado: EstadoTutoria; numero_sesiones: number;
  fecha_inscripcion: string; fecha_asignacion: string | null;
  fecha_inicio: string | null; fecha_cierre: string | null;
  motivo_cierre: string | null;
  estudiante_nombre: string; estudiante_email: string; estudiante_carrera: string | null;
};

type Sesion = {
  id: number; fecha: string; estado_sesion: string;
  tutor_evaluacion_bases: boolean | null;
  tutor_evaluacion_comprension: boolean | null;
  observaciones: string | null;
};

/* ── Flujo de estados ───────────────────────────────────────────────────── */
const FLUJO: { estado: EstadoTutoria; label: string; icon: string; color: string; desc: string }[] = [
  { estado: 'INSCRITO',              label: 'Inscrito',          icon: 'person_add',       color: 'slate',   desc: 'El estudiante ha solicitado la tutoría' },
  { estado: 'ASIGNADO',             label: 'Asignado',           icon: 'assignment_ind',   color: 'blue',    desc: 'Tutor asignado, pendiente de inicio' },
  { estado: 'EN_DIAGNOSTICO',       label: 'En Diagnóstico',     icon: 'search',           color: 'amber',   desc: 'Evaluando las necesidades del estudiante' },
  { estado: 'EN_SEGUIMIENTO_ACTIVO',label: 'Seguimiento Activo', icon: 'track_changes',    color: 'indigo',  desc: 'Sesiones activas de tutoría en curso' },
  { estado: 'COMPLETADO',           label: 'Completado',         icon: 'task_alt',         color: 'green',   desc: 'Tutoría finalizada exitosamente' },
];

const ESTADOS_CIERRE: EstadoTutoria[] = ['COMPLETADO','CANCELADO','APLAZADO','DERIVADO','PROCESO_ESPECIAL'];
const MOTIVOS_CIERRE = ['Completado','Derivado','Cancelado','Proceso especial'];

/* ── Helpers ────────────────────────────────────────────────────────────── */
function idxEstado(e: EstadoTutoria): number {
  return FLUJO.findIndex(f => f.estado === e);
}

function colorBadge(e: EstadoTutoria): string {
  const m: Partial<Record<EstadoTutoria, string>> = {
    INSCRITO:              'bg-slate-100 text-slate-600',
    ASIGNADO:              'bg-blue-100 text-blue-700',
    EN_DIAGNOSTICO:        'bg-amber-100 text-amber-700',
    EN_SEGUIMIENTO_ACTIVO: 'bg-indigo-100 text-indigo-700',
    COMPLETADO:            'bg-green-100 text-green-700',
    CANCELADO:             'bg-red-100 text-red-600',
    APLAZADO:              'bg-orange-100 text-orange-600',
    DERIVADO:              'bg-violet-100 text-violet-600',
    PROCESO_ESPECIAL:      'bg-pink-100 text-pink-600',
  };
  return m[e] ?? 'bg-slate-100 text-slate-600';
}

function fmt(fecha: string | null): string {
  if (!fecha) return '—';
  const d = fecha.includes('T') ? new Date(fecha) : new Date(fecha + 'T12:00:00');
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* ── Componente ─────────────────────────────────────────────────────────── */
@customElement('tutor-seguimiento')
export class TutorSeguimiento extends LitElement {
  @state() private tutorias: Tutoria[]        = [];
  @state() private sesiones: Record<number, Sesion[]> = {};
  @state() private cargando                   = true;
  @state() private expandido: number | null   = null;
  @state() private filtroEstado               = '';
  @state() private busqueda                   = '';

  // Modal cambio de estado
  @state() private modalTutoria: Tutoria | null  = null;
  @state() private modalNuevoEstado: EstadoTutoria | null = null;
  @state() private modalObs                   = '';
  @state() private modalFechaInicio           = '';
  @state() private modalFechaCierre           = '';
  @state() private modalMotivo                = '';
  @state() private modalGuardando             = false;

  // Modal nueva sesión
  @state() private modalSesion: Tutoria | null = null;
  @state() private sesionFecha                 = new Date().toISOString().split('T')[0];
  @state() private sesionBases: boolean | null = null;
  @state() private sesionComp: boolean | null  = null;
  @state() private sesionObs                   = '';
  @state() private sesionEstado: 'Realizada' | 'Cancelada' | 'Aplazada' = 'Realizada';
  @state() private sesionGuardando             = false;

  @state() private msg: { tipo: 'ok' | 'error'; texto: string } | null = null;

  createRenderRoot() { return this; }
  connectedCallback() { super.connectedCallback(); this._cargar(); }

  /* ── API ────────────────────────────────────────────────────────────── */
  private get _token() { return localStorage.getItem('token') ?? ''; }
  private get _headers() {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${this._token}` };
  }

  private async _cargar() {
    this.cargando = true;
    try {
      const u = getUsuario();
      if (!u) return;
      const tutorId = (u as { perfil_id?: number | null }).perfil_id ?? u.id;
      const r = await fetch(`/api/tutorias?tutor_id=${tutorId}`, {
        headers: { Authorization: `Bearer ${this._token}` },
      });
      const data = await r.json();
      this.tutorias = Array.isArray(data) ? data : [];
      // Cargar sesiones de cada tutoría en paralelo
      await Promise.all(this.tutorias.map(t => this._cargarSesiones(t.id)));
    } catch { /* silent */ }
    finally { this.cargando = false; }
  }

  private async _cargarSesiones(tutoriaId: number) {
    try {
      const r = await fetch(`/api/sesiones?tutoria_id=${tutoriaId}`, {
        headers: { Authorization: `Bearer ${this._token}` },
      });
      if (r.ok) {
        const data = await r.json();
        this.sesiones = { ...this.sesiones, [tutoriaId]: Array.isArray(data) ? data : [] };
      }
    } catch { /* silent */ }
  }

  /** Avanza/cambia el estado de la tutoría */
  private async _cambiarEstado() {
    const t = this.modalTutoria;
    const nuevoEstado = this.modalNuevoEstado;
    if (!t || !nuevoEstado) return;
    this.modalGuardando = true;
    try {
      const body: Record<string, unknown> = { estado: nuevoEstado };
      if (this.modalObs.trim())          body.observaciones  = this.modalObs.trim();
      if (this.modalFechaInicio.trim())  body.fecha_inicio   = this.modalFechaInicio;
      if (this.modalFechaCierre.trim())  body.fecha_cierre   = this.modalFechaCierre;
      if (this.modalMotivo)              body.motivo_cierre  = this.modalMotivo;
      // Si iniciamos diagnóstico o seguimiento, marcar fecha_inicio si no tiene
      if (nuevoEstado === 'EN_DIAGNOSTICO' && !t.fecha_inicio) {
        body.fecha_inicio = new Date().toISOString().split('T')[0];
      }
      if (nuevoEstado === 'COMPLETADO' && !t.fecha_cierre) {
        body.fecha_cierre = new Date().toISOString().split('T')[0];
        if (!body.motivo_cierre) body.motivo_cierre = 'Completado';
      }
      const r = await fetch(`/api/tutorias?id=${t.id}`, {
        method: 'PUT', headers: this._headers, body: JSON.stringify(body),
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error ?? 'Error al actualizar');
      }
      this.modalTutoria = null;
      this._toast('ok', `Estado cambiado a "${nuevoEstado.replace(/_/g,' ')}" exitosamente.`);
      // Notificar al calendario (tutor-schedule) para que se refresque
      window.dispatchEvent(new CustomEvent('tutoria-estado-cambiado', { detail: { tutoriaId: t.id, nuevoEstado } }));
      await this._cargar();
    } catch (e: unknown) {
      this._toast('error', `Error: ${(e as Error).message}`);
    } finally {
      this.modalGuardando = false;
    }
  }

  /** Registra una sesión directamente */
  private async _registrarSesion() {
    const t = this.modalSesion;
    if (!t || !this.sesionFecha) return;
    this.sesionGuardando = true;
    try {
      const r = await fetch('/api/sesiones', {
        method: 'POST', headers: this._headers,
        body: JSON.stringify({
          tutoria_id:                  t.id,
          fecha:                       this.sesionFecha,
          tutor_evaluacion_bases:      this.sesionBases,
          tutor_evaluacion_comprension: this.sesionComp,
          observaciones:               this.sesionObs.trim() || null,
          estado_sesion:               this.sesionEstado,
        }),
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error ?? 'Error al registrar sesión');
      }
      this.modalSesion = null;
      this._toast('ok', '¡Sesión registrada correctamente!');
      await this._cargar();
    } catch (e: unknown) {
      this._toast('error', `Error: ${(e as Error).message}`);
    } finally {
      this.sesionGuardando = false;
    }
  }

  private _abrirModalEstado(t: Tutoria, estado: EstadoTutoria) {
    this.modalTutoria      = t;
    this.modalNuevoEstado  = estado;
    this.modalObs          = t.observaciones ?? '';
    this.modalFechaInicio  = t.fecha_inicio ?? '';
    this.modalFechaCierre  = '';
    this.modalMotivo       = '';
  }

  private _abrirModalSesion(t: Tutoria) {
    this.modalSesion   = t;
    this.sesionFecha   = new Date().toISOString().split('T')[0];
    this.sesionBases   = null;
    this.sesionComp    = null;
    this.sesionObs     = '';
    this.sesionEstado  = 'Realizada';
  }

  private _toast(tipo: 'ok' | 'error', texto: string) {
    this.msg = { tipo, texto };
    setTimeout(() => { this.msg = null; }, 5000);
  }

  /* ── Helpers filtros ────────────────────────────────────────────────── */
  private get _filtradas(): Tutoria[] {
    let base = this.tutorias;
    if (this.filtroEstado) base = base.filter(t => t.estado === this.filtroEstado);
    if (this.busqueda.trim()) {
      const q = this.busqueda.toLowerCase();
      base = base.filter(t =>
        t.estudiante_nombre.toLowerCase().includes(q) ||
        t.asignatura.toLowerCase().includes(q)
      );
    }
    return base;
  }

  /* ── Acciones disponibles según estado ─────────────────────────────── */
  private _accionesDisponibles(t: Tutoria): { label: string; estado: EstadoTutoria; icon: string; cls: string }[] {
    const acc: { label: string; estado: EstadoTutoria; icon: string; cls: string }[] = [];
    switch (t.estado) {
      case 'ASIGNADO':
        acc.push(
          { label: 'Iniciar Diagnóstico', estado: 'EN_DIAGNOSTICO', icon: 'search', cls: 'bg-amber-500 hover:bg-amber-600 text-white' },
          { label: 'Cancelar', estado: 'CANCELADO', icon: 'cancel', cls: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200' },
        );
        break;
      case 'EN_DIAGNOSTICO':
        acc.push(
          { label: 'Activar Seguimiento', estado: 'EN_SEGUIMIENTO_ACTIVO', icon: 'track_changes', cls: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
          { label: 'Derivar', estado: 'DERIVADO', icon: 'fork_right', cls: 'bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-200' },
          { label: 'Aplazar', estado: 'APLAZADO', icon: 'pause_circle', cls: 'bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200' },
        );
        break;
      case 'EN_SEGUIMIENTO_ACTIVO':
        acc.push(
          { label: 'Completar Tutoría', estado: 'COMPLETADO', icon: 'task_alt', cls: 'bg-green-600 hover:bg-green-700 text-white' },
          { label: 'Proceso Especial', estado: 'PROCESO_ESPECIAL', icon: 'star', cls: 'bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200' },
          { label: 'Aplazar', estado: 'APLAZADO', icon: 'pause_circle', cls: 'bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200' },
        );
        break;
      case 'APLAZADO':
        acc.push(
          { label: 'Reactivar', estado: 'EN_SEGUIMIENTO_ACTIVO', icon: 'play_circle', cls: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
          { label: 'Cancelar', estado: 'CANCELADO', icon: 'cancel', cls: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200' },
        );
        break;
    }
    return acc;
  }

  /* ── Render: Modal cambio de estado ─────────────────────────────────── */
  private _renderModalEstado(): TemplateResult {
    const t = this.modalTutoria;
    if (!t || !this.modalNuevoEstado) return html``;
    const esCierre = ESTADOS_CIERRE.includes(this.modalNuevoEstado);
    const estadoInfo = FLUJO.find(f => f.estado === this.modalNuevoEstado);

    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
           @click=${(e: Event) => { if (e.target === e.currentTarget) { this.modalTutoria = null; } }}>
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div class="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">

          <!-- Header -->
          <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <span class="material-symbols-outlined text-primary">${estadoInfo?.icon ?? 'sync'}</span>
              </div>
              <div>
                <h3 class="font-black text-slate-900 dark:text-white text-lg">Cambiar Estado</h3>
                <p class="text-slate-500 text-sm">
                  <span class="${colorBadge(t.estado)} text-[11px] font-bold px-2 py-0.5 rounded-full">${t.estado.replace(/_/g,' ')}</span>
                  <span class="mx-1 text-slate-400">→</span>
                  <span class="${colorBadge(this.modalNuevoEstado)} text-[11px] font-bold px-2 py-0.5 rounded-full">${this.modalNuevoEstado.replace(/_/g,' ')}</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 space-y-4">
            <p class="text-sm text-slate-500 dark:text-slate-400">
              <span class="font-semibold text-slate-700 dark:text-slate-300">${t.asignatura}</span>
              para <span class="font-semibold text-slate-700 dark:text-slate-300">${t.estudiante_nombre}</span>
            </p>

            ${this.modalNuevoEstado === 'EN_DIAGNOSTICO' || this.modalNuevoEstado === 'EN_SEGUIMIENTO_ACTIVO' ? html`
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha de inicio</label>
                <input type="date"
                  .value=${this.modalFechaInicio}
                  @input=${(e: Event) => { this.modalFechaInicio = (e.target as HTMLInputElement).value; }}
                  class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
            ` : ''}

            ${esCierre && this.modalNuevoEstado !== 'APLAZADO' && this.modalNuevoEstado !== 'DERIVADO' ? html`
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha de cierre</label>
                <input type="date"
                  .value=${this.modalFechaCierre}
                  @input=${(e: Event) => { this.modalFechaCierre = (e.target as HTMLInputElement).value; }}
                  class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Motivo de cierre</label>
                <select .value=${this.modalMotivo}
                  @change=${(e: Event) => { this.modalMotivo = (e.target as HTMLSelectElement).value; }}
                  class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  <option value="">Selecciona un motivo...</option>
                  ${MOTIVOS_CIERRE.map(m => html`<option .value=${m}>${m}</option>`)}
                </select>
              </div>
            ` : ''}

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Observaciones <span class="font-normal normal-case">(opcional)</span>
              </label>
              <textarea rows="3" placeholder="Descripción del estado actual, hallazgos, notas relevantes…"
                .value=${this.modalObs}
                @input=${(e: Event) => { this.modalObs = (e.target as HTMLTextAreaElement).value; }}
                class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"></textarea>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button @click=${() => { this.modalTutoria = null; }}
              class="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all">
              Cancelar
            </button>
            <button @click=${() => this._cambiarEstado()}
              ?disabled=${this.modalGuardando}
              class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
              ${this.modalGuardando
                ? html`<span class="material-symbols-outlined animate-spin text-lg">progress_activity</span> Guardando...`
                : html`<span class="material-symbols-outlined text-lg">check_circle</span> Confirmar cambio`}
            </button>
          </div>
        </div>
      </div>`;
  }

  /* ── Render: Modal nueva sesión ─────────────────────────────────────── */
  private _renderModalSesion(): TemplateResult {
    const t = this.modalSesion;
    if (!t) return html``;

    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
           @click=${(e: Event) => { if (e.target === e.currentTarget) { this.modalSesion = null; } }}>
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div class="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col">

          <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                <span class="material-symbols-outlined text-green-600">add_circle</span>
              </div>
              <div>
                <h3 class="font-black text-slate-900 dark:text-white">Registrar Sesión</h3>
                <p class="text-xs text-slate-400 mt-0.5">${t.asignatura} · ${t.estudiante_nombre}</p>
              </div>
            </div>
            <button @click=${() => { this.modalSesion = null; }} class="text-slate-400 hover:text-slate-600 transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="px-6 py-5 space-y-5 overflow-y-auto flex-1">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha de sesión *</label>
              <input type="date"
                .value=${this.sesionFecha}
                @input=${(e: Event) => { this.sesionFecha = (e.target as HTMLInputElement).value; }}
                class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado de la sesión</label>
              <div class="flex gap-2">
                ${(['Realizada','Cancelada','Aplazada'] as const).map(s => html`
                  <button @click=${() => { this.sesionEstado = s; }}
                    class="flex-1 py-2.5 rounded-lg text-xs font-bold border transition-all
                           ${this.sesionEstado === s
                             ? s === 'Realizada' ? 'bg-green-500 text-white border-green-500'
                               : s === 'Cancelada' ? 'bg-red-500 text-white border-red-500'
                               : 'bg-orange-400 text-white border-orange-400'
                             : 'bg-slate-50 dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700'}">
                    ${s}
                  </button>`)}
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Bases conceptuales</label>
                <div class="flex gap-2">
                  ${([true, false, null] as const).map(v => html`
                    <button @click=${() => { this.sesionBases = v; }}
                      class="flex-1 py-2 rounded-lg text-xs font-bold border transition-all
                             ${this.sesionBases === v
                               ? v === true ? 'bg-green-500 text-white border-green-500'
                                 : v === false ? 'bg-red-500 text-white border-red-500'
                                 : 'bg-slate-400 text-white border-slate-400'
                               : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}">
                      ${v === true ? '✓ Sí' : v === false ? '✗ No' : '?'}
                    </button>`)}
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Comprensión</label>
                <div class="flex gap-2">
                  ${([true, false, null] as const).map(v => html`
                    <button @click=${() => { this.sesionComp = v; }}
                      class="flex-1 py-2 rounded-lg text-xs font-bold border transition-all
                             ${this.sesionComp === v
                               ? v === true ? 'bg-green-500 text-white border-green-500'
                                 : v === false ? 'bg-red-500 text-white border-red-500'
                                 : 'bg-slate-400 text-white border-slate-400'
                               : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}">
                      ${v === true ? '✓ Sí' : v === false ? '✗ No' : '?'}
                    </button>`)}
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Observaciones de la sesión <span class="font-normal normal-case">(opcional)</span>
              </label>
              <textarea rows="3" placeholder="Temas tratados, avances, dificultades encontradas…"
                .value=${this.sesionObs}
                @input=${(e: Event) => { this.sesionObs = (e.target as HTMLTextAreaElement).value; }}
                class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"></textarea>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-shrink-0">
            <button @click=${() => { this.modalSesion = null; }}
              class="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all">
              Cancelar
            </button>
            <button @click=${() => this._registrarSesion()}
              ?disabled=${this.sesionGuardando || !this.sesionFecha}
              class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50">
              ${this.sesionGuardando
                ? html`<span class="material-symbols-outlined animate-spin text-lg">progress_activity</span> Guardando...`
                : html`<span class="material-symbols-outlined text-lg">add_circle</span> Registrar sesión`}
            </button>
          </div>
        </div>
      </div>`;
  }

  /* ── Render: Stepper visual ─────────────────────────────────────────── */
  private _renderStepper(t: Tutoria): TemplateResult {
    const currentIdx = idxEstado(t.estado);
    const esFinalNoPositivo = ['CANCELADO','APLAZADO','DERIVADO','PROCESO_ESPECIAL'].includes(t.estado);

    return html`
      <div class="flex items-center justify-between gap-1 relative">
        <!-- Línea de fondo -->
        <div class="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 dark:bg-slate-700 z-0"></div>

        ${FLUJO.map((paso, idx) => {
          const activo  = idx === currentIdx && !esFinalNoPositivo;
          const pasado  = idx < currentIdx && !esFinalNoPositivo || (t.estado === 'COMPLETADO' && idx <= currentIdx);

          return html`
            <div class="relative z-10 flex flex-col items-center gap-1.5 flex-1">
              <div class="w-10 h-10 rounded-full flex items-center justify-center transition-all
                          ${activo  ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/20'
                            : pasado ? 'bg-green-500 text-white'
                            : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-400'}">
                ${pasado ? html`<span class="material-symbols-outlined text-lg">check</span>`
                  : html`<span class="material-symbols-outlined text-lg">${paso.icon}</span>`}
              </div>
              <span class="text-[10px] font-bold text-center leading-tight
                           ${activo ? 'text-primary' : pasado ? 'text-green-600' : 'text-slate-400'}"
                    style="max-width:60px">
                ${paso.label}
              </span>
            </div>`;
        })}

        ${esFinalNoPositivo ? html`
          <div class="relative z-10 flex flex-col items-center gap-1.5">
            <div class="w-10 h-10 rounded-full flex items-center justify-center
                        ${t.estado === 'CANCELADO' ? 'bg-red-500 text-white'
                          : t.estado === 'APLAZADO' ? 'bg-orange-400 text-white'
                          : t.estado === 'DERIVADO' ? 'bg-violet-500 text-white'
                          : 'bg-pink-500 text-white'}">
              <span class="material-symbols-outlined text-lg">
                ${t.estado === 'CANCELADO' ? 'cancel'
                  : t.estado === 'APLAZADO' ? 'pause_circle'
                  : t.estado === 'DERIVADO' ? 'fork_right'
                  : 'star'}
              </span>
            </div>
            <span class="text-[10px] font-bold text-center ${t.estado === 'CANCELADO' ? 'text-red-500' : t.estado === 'APLAZADO' ? 'text-orange-500' : 'text-violet-500'}"
                  style="max-width:60px">
              ${t.estado.replace(/_/g,' ')}
            </span>
          </div>` : ''}
      </div>`;
  }

  /* ── Render: Card tutoría ───────────────────────────────────────────── */
  private _renderCard(t: Tutoria): TemplateResult {
    const expandida  = this.expandido === t.id;
    const sesiones   = this.sesiones[t.id] ?? [];
    const acciones   = this._accionesDisponibles(t);
    const esActiva   = !['COMPLETADO','CANCELADO'].includes(t.estado);

    return html`
      <div class="bg-white dark:bg-slate-900 rounded-2xl border
                  ${esActiva ? 'border-slate-100 dark:border-slate-800 hover:border-primary/30' : 'border-slate-100 dark:border-slate-800 opacity-80'}
                  shadow-sm hover:shadow-md transition-all overflow-hidden">

        <!-- Header de la card -->
        <div class="px-6 py-5">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full ${colorBadge(t.estado)}">
                  ${t.estado.replace(/_/g,' ')}
                </span>
                <span class="text-[11px] text-slate-400 font-medium">
                  ${sesiones.length} sesión${sesiones.length !== 1 ? 'es' : ''}
                </span>
              </div>
              <h3 class="text-lg font-black text-slate-900 dark:text-white truncate">${t.asignatura}</h3>
              ${t.tema ? html`<p class="text-sm text-slate-500 mt-0.5">${t.tema}</p>` : ''}
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <!-- Botón + Sesión (solo para estados activos) -->
              ${['EN_DIAGNOSTICO','EN_SEGUIMIENTO_ACTIVO','ASIGNADO'].includes(t.estado) ? html`
                <button @click=${() => this._abrirModalSesion(t)}
                  class="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all">
                  <span class="material-symbols-outlined text-sm">add_circle</span>
                  Sesión
                </button>` : ''}
              <!-- Toggle expandir -->
              <button @click=${() => { this.expandido = expandida ? null : t.id; }}
                class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:border-primary hover:text-primary transition-all">
                <span class="material-symbols-outlined text-xl transition-transform duration-200 ${expandida ? 'rotate-180' : ''}">expand_more</span>
              </button>
            </div>
          </div>

          <!-- Info del estudiante -->
          <div class="flex items-center gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
            <div class="flex items-center gap-1.5">
              <div class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black flex-shrink-0">
                ${t.estudiante_nombre.charAt(0).toUpperCase()}
              </div>
              <span class="font-semibold text-slate-700 dark:text-slate-300">${t.estudiante_nombre}</span>
            </div>
            ${t.estudiante_carrera ? html`
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">school</span>${t.estudiante_carrera}</span>` : ''}
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">calendar_today</span>Inscrito ${fmt(t.fecha_inscripcion)}</span>
            ${t.fecha_inicio ? html`
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">play_circle</span>Inicio ${fmt(t.fecha_inicio)}</span>` : ''}
          </div>
        </div>

        <!-- Stepper -->
        <div class="px-6 pb-4">
          ${this._renderStepper(t)}
        </div>

        <!-- Acciones de estado -->
        ${acciones.length > 0 ? html`
          <div class="px-6 pb-4 flex flex-wrap gap-2">
            ${acciones.map(a => html`
              <button @click=${() => this._abrirModalEstado(t, a.estado)}
                class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${a.cls}">
                <span class="material-symbols-outlined text-sm">${a.icon}</span>
                ${a.label}
              </button>`)}
          </div>` : ''}

        <!-- Panel expandible: sesiones registradas -->
        ${expandida ? html`
          <div class="border-t border-slate-100 dark:border-slate-800 px-6 py-5 space-y-4">

            ${t.observaciones ? html`
              <div class="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4">
                <p class="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">sticky_note_2</span> Observaciones generales
                </p>
                <p class="text-sm text-slate-700 dark:text-slate-300">${t.observaciones}</p>
              </div>` : ''}

            <div>
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm">history</span>
                Sesiones registradas (${sesiones.length})
              </p>

              ${sesiones.length === 0 ? html`
                <div class="flex flex-col items-center gap-2 py-8 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <span class="material-symbols-outlined text-4xl">event_busy</span>
                  <p class="text-sm font-medium">Sin sesiones registradas aún</p>
                  <button @click=${() => this._abrirModalSesion(t)}
                    class="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all mt-1">
                    <span class="material-symbols-outlined text-sm">add</span> Registrar primera sesión
                  </button>
                </div>
              ` : html`
                <div class="space-y-2">
                  ${sesiones.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).map(s => html`
                    <div class="flex items-start gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">

                      <!-- Fecha + estado -->
                      <div class="flex-shrink-0 text-center" style="min-width:52px">
                        <p class="text-xs font-bold text-slate-900 dark:text-slate-100">
                          ${new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                        </p>
                        <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 inline-block
                                     ${s.estado_sesion === 'Realizada' ? 'bg-green-100 text-green-700'
                                       : s.estado_sesion === 'Cancelada' ? 'bg-red-100 text-red-600'
                                       : 'bg-orange-100 text-orange-600'}">
                          ${s.estado_sesion}
                        </span>
                      </div>

                      <!-- Evaluaciones -->
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-3 mb-1 flex-wrap">
                          <span class="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                            <span class="material-symbols-outlined text-sm ${s.tutor_evaluacion_bases === true ? 'text-green-500' : s.tutor_evaluacion_bases === false ? 'text-red-500' : 'text-slate-400'}">
                              ${s.tutor_evaluacion_bases === true ? 'check_circle' : s.tutor_evaluacion_bases === false ? 'cancel' : 'help_outline'}
                            </span>
                            Bases
                          </span>
                          <span class="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                            <span class="material-symbols-outlined text-sm ${s.tutor_evaluacion_comprension === true ? 'text-green-500' : s.tutor_evaluacion_comprension === false ? 'text-red-500' : 'text-slate-400'}">
                              ${s.tutor_evaluacion_comprension === true ? 'check_circle' : s.tutor_evaluacion_comprension === false ? 'cancel' : 'help_outline'}
                            </span>
                            Comprensión
                          </span>
                        </div>
                        ${s.observaciones ? html`
                          <p class="text-xs text-slate-500 italic truncate">${s.observaciones}</p>` : ''}
                      </div>
                    </div>`)}
                </div>
                <button @click=${() => this._abrirModalSesion(t)}
                  class="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border-2 border-dashed border-primary/30 text-primary hover:bg-primary/5 transition-all">
                  <span class="material-symbols-outlined text-sm">add_circle</span>
                  Registrar nueva sesión
                </button>
              `}
            </div>

            <!-- Info de cierre si está completado/cancelado -->
            ${t.fecha_cierre ? html`
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex items-start gap-3">
                <span class="material-symbols-outlined text-slate-400">info</span>
                <div class="text-sm">
                  <p class="font-semibold text-slate-700 dark:text-slate-300">Cerrado el ${fmt(t.fecha_cierre)}</p>
                  ${t.motivo_cierre ? html`<p class="text-slate-500">Motivo: ${t.motivo_cierre}</p>` : ''}
                </div>
              </div>` : ''}
          </div>
        ` : ''}
      </div>`;
  }

  /* ── Render principal ───────────────────────────────────────────────── */
  render(): TemplateResult {
    const filtradas  = this._filtradas;
    const activas    = this.tutorias.filter(t => !['COMPLETADO','CANCELADO'].includes(t.estado)).length;
    const completadas = this.tutorias.filter(t => t.estado === 'COMPLETADO').length;

    const todosEstados: EstadoTutoria[] = [
      'ASIGNADO','EN_DIAGNOSTICO','EN_SEGUIMIENTO_ACTIVO','COMPLETADO','CANCELADO','APLAZADO','DERIVADO','PROCESO_ESPECIAL'
    ];

    return html`
      ${this._renderModalEstado()}
      ${this._renderModalSesion()}

      <div class="px-6 lg:px-10 py-8 max-w-5xl mx-auto space-y-6">

        <!-- Header -->
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">manage_search</span>
              Seguimiento de Tutorías
            </h2>
            <p class="text-slate-500 text-sm mt-1">
              <span class="font-semibold text-slate-700 dark:text-slate-300">${activas}</span> activa${activas !== 1 ? 's' : ''}
              · <span class="font-semibold text-green-600">${completadas}</span> completada${completadas !== 1 ? 's' : ''}
              · <span class="font-semibold text-slate-500">${this.tutorias.length}</span> total
            </p>
          </div>
          <button @click=${() => this._cargar()}
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700
                   text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary transition-all">
            <span class="material-symbols-outlined text-sm">refresh</span>
            Actualizar
          </button>
        </div>

        <!-- Toast -->
        ${this.msg ? html`
          <div class="flex items-start gap-3 px-4 py-3 rounded-xl text-sm font-semibold shadow-sm
                      ${this.msg.tipo === 'ok'
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'}">
            <span class="material-symbols-outlined text-lg flex-shrink-0">${this.msg.tipo === 'ok' ? 'check_circle' : 'error'}</span>
            <span>${this.msg.texto}</span>
          </div>` : ''}

        <!-- Filtros -->
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input placeholder="Buscar por estudiante o asignatura…"
              .value=${this.busqueda}
              @input=${(e: Event) => { this.busqueda = (e.target as HTMLInputElement).value; }}
              class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                     rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <select .value=${this.filtroEstado}
            @change=${(e: Event) => { this.filtroEstado = (e.target as HTMLSelectElement).value; }}
            class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm
                   text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
            <option value="">Todos los estados</option>
            ${todosEstados.map(e => html`<option .value=${e}>${e.replace(/_/g,' ')}</option>`)}
          </select>
          ${this.filtroEstado || this.busqueda ? html`
            <button @click=${() => { this.filtroEstado = ''; this.busqueda = ''; }}
              class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700
                     text-slate-500 hover:border-red-300 hover:text-red-500 transition-all whitespace-nowrap">
              <span class="material-symbols-outlined text-sm">filter_alt_off</span>Limpiar
            </button>` : ''}
        </div>

        <!-- Content -->
        ${this.cargando ? html`
          <div class="flex justify-center py-20 text-slate-400">
            <span class="material-symbols-outlined animate-spin text-5xl">progress_activity</span>
          </div>
        ` : filtradas.length === 0 ? html`
          <div class="flex flex-col items-center gap-3 py-20 text-slate-400">
            <span class="material-symbols-outlined text-6xl">manage_search</span>
            <p class="text-base font-semibold">No hay tutorías para mostrar</p>
            <p class="text-sm">Las tutorías asignadas a ti aparecerán aquí</p>
          </div>
        ` : html`
          <div class="space-y-4">
            ${filtradas.map(t => this._renderCard(t))}
          </div>
        `}

      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'tutor-seguimiento': TutorSeguimiento; }
}
