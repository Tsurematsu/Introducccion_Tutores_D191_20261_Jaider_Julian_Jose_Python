import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getUsuario } from '../router';

/* ── Tipos ─────────────────────────────────────────────────────────────── */
type Asignacion = {
  id: number; estado: string;
  tutoria_asignatura: string; tutoria_estado: string;
  estudiante_nombre: string; fecha_asignacion: string | null;
  dentro_de_24h: boolean; tutoria_id: number;
  creado_en?: string;
};

type NuevaSesion = {
  tutoria_id: number;
  fecha: string;
  tutor_evaluacion_bases: boolean | null;
  tutor_evaluacion_comprension: boolean | null;
  observaciones: string;
  estado_sesion: 'Realizada' | 'Cancelada' | 'Aplazada';
};

/* ── Helpers ────────────────────────────────────────────────────────────── */
const DIAS_ES  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

/** Extrae YYYY-MM-DD de cualquier formato de fecha que devuelva Postgres */
function toLocalISO(fecha: string | null | undefined): string {
  if (!fecha) return '';
  // Si ya es solo fecha sin tiempo: "2026-03-07"
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
  // Si trae T (ISO con tiempo), tomamos solo la parte de fecha local
  // Evitar offsets de zona horaria usando split en T
  return fecha.split('T')[0];
}

/** Obtiene la fecha efectiva de una asignación (fecha_asignacion o creado_en) */
function fechaEfectiva(a: { fecha_asignacion?: string | null; creado_en?: string }): string {
  return toLocalISO(a.fecha_asignacion ?? a.creado_en);
}

function badgeCls(estado: string) {
  if (estado === 'Aceptada')  return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  if (estado === 'Rechazada') return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
  if (estado === 'Reemplazada') return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
}

function estadoBadge(estado: string) {
  if (['INSCRITO','ASIGNADO'].includes(estado)) return 'bg-amber-100 text-amber-700';
  if (['EN_DIAGNOSTICO','EN_SEGUIMIENTO_ACTIVO'].includes(estado)) return 'bg-blue-100 text-blue-700';
  if (estado === 'COMPLETADO') return 'bg-green-100 text-green-700';
  return 'bg-slate-100 text-slate-600';
}

/* ── Componente ─────────────────────────────────────────────────────────── */
@customElement('tutor-schedule')
export class TutorSchedule extends LitElement {
  @state() private asignaciones: Asignacion[] = [];
  @state() private cargando = true;
  @state() private filtro: 'todas' | 'pendientes' | 'activas' = 'todas';

  // Calendario
  @state() private calYear  = new Date().getFullYear();
  @state() private calMonth = new Date().getMonth();
  @state() private diaSeleccionado: string | null = null;
  @state() private vistaCalendario = true;

  // Modal registrar sesión
  @state() private modalSesion: Asignacion | null = null;
  @state() private sesionFecha   = new Date().toISOString().split('T')[0];
  @state() private sesionBases: boolean | null = null;
  @state() private sesionComp: boolean | null = null;
  @state() private sesionObs = '';
  @state() private sesionEstado: NuevaSesion['estado_sesion'] = 'Realizada';
  @state() private guardandoSesion = false;

  // Feedback inline
  @state() private procesando: Record<number, boolean> = {};
  @state() private msg: { tipo: 'ok' | 'error'; texto: string } | null = null;

  createRenderRoot() { return this; }

  connectedCallback() {
    super.connectedCallback();
    this._cargar();
    // Cuando el tutor cambia un estado en Seguimiento, refrescar el calendario
    window.addEventListener('tutoria-estado-cambiado', this._onEstadoCambiado);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('tutoria-estado-cambiado', this._onEstadoCambiado);
  }

  private _onEstadoCambiado = () => { this._cargar(); };

  /* ── API ────────────────────────────────────────────────────────────── */
  private get _token() { return localStorage.getItem('token') ?? ''; }

  private async _cargar() {
    this.cargando = true;
    try {
      const u = getUsuario();
      if (!u) return;
      // perfil_id = id en tabla tutores (puede diferir de usuarios.id)
      const tutorId = (u as { perfil_id?: number | null }).perfil_id ?? u.id;
      const headers = { Authorization: `Bearer ${this._token}` };

      // Cargar asignaciones_tutor Y tutorias en paralelo
      const [rA, rT] = await Promise.all([
        fetch(`/api/asignaciones?tutor_id=${tutorId}`, { headers }),
        fetch(`/api/tutorias?tutor_id=${tutorId}`, { headers }),
      ]);
      const asignacionesBase: Asignacion[] = (await rA.json()) ?? [];
      const tutorias = (await rT.json()) ?? [];

      // Estados que liberan el slot del calendario
      const ESTADOS_TERMINADOS = ['COMPLETADO', 'CANCELADO', 'DERIVADO'];

      // Filtrar asignaciones reales: excluir las de tutorías ya terminadas
      const asignaciones = asignacionesBase.filter(
        (a: Asignacion) => !ESTADOS_TERMINADOS.includes(a.tutoria_estado)
      );

      // Las tutorías que ya tienen asignacion en asignaciones_tutor
      const tutoriasConAsig = new Set<number>(asignaciones.map((a: Asignacion) => a.tutoria_id));

      // Para tutorías sin asignacion registrada, creamos una asignación virtual
      // Excluir las que están en estado terminal (completadas/canceladas)
      const virtuales: Asignacion[] = (tutorias as Array<{
        id: number; asignatura: string; estado: string;
        estudiante_nombre: string; fecha_asignacion: string | null;
        fecha_inscripcion: string; creado_en?: string;
      }>)
        .filter(t => !tutoriasConAsig.has(t.id) && !ESTADOS_TERMINADOS.includes(t.estado))
        .map(t => ({
          id:                  -(t.id),      // ID negativo para indicar que es virtual
          tutoria_id:          t.id,
          tutoria_asignatura:  t.asignatura,
          tutoria_estado:      t.estado,
          estudiante_nombre:   t.estudiante_nombre,
          estado:              'Aceptada',   // asumimos aceptada para mostrarla
          fecha_asignacion:    t.fecha_asignacion ?? t.fecha_inscripcion ?? null,
          dentro_de_24h:       true,
          creado_en:           (t as any).creado_en,
        }));

      this.asignaciones = [...asignaciones, ...virtuales];
    } catch { /* silent */ }
    finally { this.cargando = false; }
  }

  /** Actualiza el estado de una asignación (Aceptada / Rechazada) */
  private async _actualizarEstado(asig: Asignacion, nuevoEstado: 'Aceptada' | 'Rechazada') {
    // Las asignaciones virtuales (id negativo) no existen en asignaciones_tutor
    // Por ahora recargamos simplemente (se crean al agendar normalmente)
    if (asig.id < 0) {
      this._toast('ok', `Estado registrado localmente.`);
      await this._cargar();
      return;
    }
    this.procesando = { ...this.procesando, [asig.id]: true };
    try {
      const r = await fetch(`/api/asignaciones?id=${asig.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this._token}` },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error ?? 'Error');
      }
      await this._cargar();
      this._toast('ok', `Asignación ${nuevoEstado.toLowerCase()} correctamente.`);
    } catch (e: unknown) {
      this._toast('error', `No se pudo actualizar: ${(e as Error).message}`);
    } finally {
      const { [asig.id]: _, ...rest } = this.procesando;
      this.procesando = rest;
    }
  }

  /** Registra una nueva sesión para una asignación aceptada */
  private async _registrarSesion() {
    if (!this.modalSesion || !this.sesionFecha) return;
    this.guardandoSesion = true;
    try {
      const r = await fetch('/api/sesiones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this._token}` },
        body: JSON.stringify({
          tutoria_id: this.modalSesion.tutoria_id,
          fecha: this.sesionFecha,
          tutor_evaluacion_bases: this.sesionBases,
          tutor_evaluacion_comprension: this.sesionComp,
          observaciones: this.sesionObs || null,
          estado_sesion: this.sesionEstado,
        }),
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error ?? 'Error al registrar sesión');
      }
      this.modalSesion = null;
      await this._cargar();
      this._toast('ok', '¡Sesión registrada exitosamente en la base de datos!');
    } catch (e: unknown) {
      this._toast('error', `Error: ${(e as Error).message}`);
    } finally {
      this.guardandoSesion = false;
    }
  }

  /** Abre el modal de sesión para una asignación */
  private _abrirModalSesion(asig: Asignacion) {
    this.modalSesion = asig;
    this.sesionFecha  = new Date().toISOString().split('T')[0];
    this.sesionBases  = null;
    this.sesionComp   = null;
    this.sesionObs    = '';
    this.sesionEstado = 'Realizada';
  }

  private _toast(tipo: 'ok' | 'error', texto: string) {
    this.msg = { tipo, texto };
    setTimeout(() => { this.msg = null; }, 4000);
  }

  /* ── Helpers filtros ────────────────────────────────────────────────── */
  private get _filtradas(): Asignacion[] {
    let base = this.asignaciones;
    if (this.diaSeleccionado) {
      base = base.filter(a => fechaEfectiva(a) === this.diaSeleccionado);
    }
    switch (this.filtro) {
      case 'pendientes': return base.filter(a => ['INSCRITO','ASIGNADO'].includes(a.tutoria_estado));
      case 'activas':    return base.filter(a => a.estado === 'Aceptada');
      default:           return base;
    }
  }

  private get _fechasConAsignacion(): Set<string> {
    return new Set(
      this.asignaciones.map(a => fechaEfectiva(a)).filter(Boolean)
    );
  }

  private _asignacionesDelMes(): Asignacion[] {
    const prefix = `${this.calYear}-${String(this.calMonth + 1).padStart(2, '0')}`;
    return this.asignaciones.filter(a => fechaEfectiva(a).startsWith(prefix));
  }

  /* ── Nav calendario ─────────────────────────────────────────────────── */
  private _prevMes() {
    if (this.calMonth === 0) { this.calMonth = 11; this.calYear--; }
    else this.calMonth--;
    this.diaSeleccionado = null;
  }
  private _nextMes() {
    if (this.calMonth === 11) { this.calMonth = 0; this.calYear++; }
    else this.calMonth++;
    this.diaSeleccionado = null;
  }
  private _irHoy() {
    const hoy = new Date();
    this.calYear = hoy.getFullYear();
    this.calMonth = hoy.getMonth();
    this.diaSeleccionado = null;
  }

  /* ── Render: Calendario ─────────────────────────────────────────────── */
  private _renderCalendario(): TemplateResult {
    const fechas    = this._fechasConAsignacion;
    const hoyISO    = toLocalISO(new Date().toISOString());
    const primerDia = new Date(this.calYear, this.calMonth, 1);
    const totalDias = new Date(this.calYear, this.calMonth + 1, 0).getDate();
    const celdas: (number | null)[] = [
      ...Array(primerDia.getDay()).fill(null),
      ...Array.from({ length: totalDias }, (_, i) => i + 1),
    ];

    return html`
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="bg-primary/10 text-primary p-2 rounded-lg">
              <span class="material-symbols-outlined">calendar_month</span>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 dark:text-white text-lg">${MESES_ES[this.calMonth]} ${this.calYear}</h3>
              <p class="text-xs text-slate-400 mt-0.5">${this._asignacionesDelMes().length} asignaci${this._asignacionesDelMes().length === 1 ? 'ón' : 'ones'} este mes</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button @click=${() => this._irHoy()}
              class="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700
                     text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary transition-all">Hoy</button>
            <button @click=${() => this._prevMes()}
              class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all">
              <span class="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button @click=${() => this._nextMes()}
              class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all">
              <span class="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
        <div class="p-4">
          <div class="grid grid-cols-7 mb-1">
            ${DIAS_ES.map(d => html`<div class="text-center text-xs font-bold text-slate-400 py-2 uppercase tracking-wider">${d}</div>`)}
          </div>
          <div class="grid grid-cols-7 gap-1">
            ${celdas.map(dia => {
              if (dia === null) return html`<div></div>`;
              const iso     = `${this.calYear}-${String(this.calMonth + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
              const tieneAs = fechas.has(iso);
              const esHoy   = iso === hoyISO;
              const esSel   = iso === this.diaSeleccionado;
              const count   = tieneAs ? this.asignaciones.filter(a => fechaEfectiva(a) === iso).length : 0;
              return html`
                <button @click=${() => { this.diaSeleccionado = esSel ? null : iso; }}
                  class="relative flex flex-col items-center justify-center rounded-xl aspect-square text-sm font-semibold
                         transition-all duration-150 select-none
                         ${esSel ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                           : tieneAs ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105'
                           : esHoy ? 'ring-2 ring-primary text-primary hover:bg-primary/5'
                           : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}"
                  title="${tieneAs ? `${count} asignación${count > 1 ? 'es' : ''}` : ''}">
                  <span>${dia}</span>
                  ${tieneAs && !esSel ? html`
                    <span class="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      ${Array.from({ length: Math.min(count, 3) }).map(() => html`<span class="w-1 h-1 rounded-full bg-primary"></span>`)}
                    </span>` : ''}
                  ${esSel && tieneAs ? html`<span class="text-[10px] font-bold opacity-90">${count}</span>` : ''}
                </button>`;
            })}
          </div>
        </div>
        <div class="px-4 pb-4 flex items-center justify-between gap-4 flex-wrap">
          <div class="flex items-center gap-4 text-xs text-slate-400">
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-primary/30 inline-block"></span>Con asignación</div>
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full ring-2 ring-primary inline-block"></span>Hoy</div>
            <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-primary inline-block"></span>Seleccionado</div>
          </div>
          ${this.diaSeleccionado ? html`
            <button @click=${() => { this.diaSeleccionado = null; }}
              class="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-red-500 transition-colors">
              <span class="material-symbols-outlined text-sm">filter_alt_off</span>
              Limpiar filtro (${new Date(this.diaSeleccionado + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })})
            </button>` : ''}
        </div>
      </div>`;
  }

  /* ── Render: Tabla ──────────────────────────────────────────────────── */
  private _renderTabla(): TemplateResult {
    const lista = this._filtradas;
    return html`
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        ${this.cargando ? html`
          <div class="flex justify-center py-16 text-slate-400">
            <span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
          </div>
        ` : lista.length === 0 ? html`
          <div class="py-14 text-center text-slate-400 space-y-2">
            <span class="material-symbols-outlined text-4xl block">event_busy</span>
            <p class="text-sm font-medium">
              ${this.diaSeleccionado
                ? `Sin asignaciones el ${new Date(this.diaSeleccionado + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : 'No hay asignaciones en esta categoría'}
            </p>
            ${this.diaSeleccionado ? html`
              <button @click=${() => { this.diaSeleccionado = null; }}
                class="text-xs text-primary font-semibold hover:underline">Ver todas</button>` : ''}
          </div>
        ` : html`
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  ${['Estudiante','Asignatura','Estado Tutoría','Estado Asig.','Fecha Asig.','≤24h','Acciones']
                    .map(h => html`<th class="px-5 py-4 text-xs font-bold text-slate-500 uppercase whitespace-nowrap">${h}</th>`)}
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                ${lista.map(a => {
                  const enProceso = this.procesando[a.id];
                  return html`
                    <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                      <!-- Estudiante -->
                      <td class="px-5 py-4">
                        <div class="flex items-center gap-3">
                          <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            ${(a.estudiante_nombre ?? '?').charAt(0).toUpperCase()}
                          </div>
                          <span class="text-sm font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">${a.estudiante_nombre}</span>
                        </div>
                      </td>
                      <!-- Asignatura -->
                      <td class="px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">${a.tutoria_asignatura}</td>
                      <!-- Estado tutoría -->
                      <td class="px-5 py-4">
                        <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${estadoBadge(a.tutoria_estado)}">
                          ${a.tutoria_estado?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <!-- Estado asignación -->
                      <td class="px-5 py-4">
                        <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${badgeCls(a.estado)}">
                          ${a.estado}
                        </span>
                      </td>
                      <!-- Fecha -->
                      <td class="px-5 py-4">
                        ${fechaEfectiva(a) ? html`
                          <button @click=${() => {
                            const iso = fechaEfectiva(a);
                            const d = new Date(iso + 'T12:00:00');
                            this.calYear  = d.getFullYear();
                            this.calMonth = d.getMonth();
                            this.diaSeleccionado = iso;
                            this.vistaCalendario = true;
                            this.renderRoot.querySelector('.calendario-anchor')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          class="text-xs font-semibold text-primary hover:underline flex items-center gap-1 whitespace-nowrap">
                            <span class="material-symbols-outlined text-sm">event</span>
                            ${new Date(fechaEfectiva(a) + 'T12:00:00').toLocaleDateString('es-CO', { day:'numeric', month:'short', year:'numeric' })}
                          </button>` : html`<span class="text-slate-400 text-xs">—</span>`}
                      </td>
                      <!-- ≤24h -->
                      <td class="px-5 py-4 text-center">
                        ${a.dentro_de_24h
                          ? html`<span class="text-green-500 material-symbols-outlined text-lg" title="Dentro de 24h">check_circle</span>`
                          : html`<span class="text-red-400 material-symbols-outlined text-lg" title="Fuera de 24h">cancel</span>`}
                      </td>
                      <!-- Acciones -->
                      <td class="px-5 py-4">
                        <div class="flex items-center gap-1 flex-nowrap">
                          ${a.estado !== 'Aceptada' ? html`
                            <!-- Aceptar -->
                            <button
                              id="btn-aceptar-${a.id}"
                              ?disabled=${enProceso}
                              @click=${() => this._actualizarEstado(a, 'Aceptada')}
                              class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold
                                     bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700
                                     hover:bg-emerald-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
                              ${enProceso
                                ? html`<span class="material-symbols-outlined animate-spin text-sm">progress_activity</span>`
                                : html`<span class="material-symbols-outlined text-sm">check</span>`}
                              Aceptar
                            </button>` : ''}
                          ${a.estado !== 'Rechazada' && a.estado !== 'Aceptada' ? html`
                            <!-- Rechazar -->
                            <button
                              id="btn-rechazar-${a.id}"
                              ?disabled=${enProceso}
                              @click=${() => this._actualizarEstado(a, 'Rechazada')}
                              class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold
                                     bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700
                                     hover:bg-red-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
                              ${enProceso
                                ? html`<span class="material-symbols-outlined animate-spin text-sm">progress_activity</span>`
                                : html`<span class="material-symbols-outlined text-sm">close</span>`}
                              Rechazar
                            </button>` : ''}
                          ${a.estado === 'Aceptada' ? html`
                            <!-- Registrar sesión -->
                            <button
                              id="btn-sesion-${a.id}"
                              @click=${() => this._abrirModalSesion(a)}
                              class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold
                                     bg-primary/10 text-primary border border-primary/20
                                     hover:bg-primary/20 transition-all whitespace-nowrap">
                              <span class="material-symbols-outlined text-sm">add_circle</span>
                              Sesión
                            </button>` : ''}
                        </div>
                      </td>
                    </tr>`;
                })}
              </tbody>
            </table>
          </div>`}
      </div>`;
  }

  /* ── Render: Modal registrar sesión ──────────────────────────────────── */
  private _renderModal(): TemplateResult {
    if (!this.modalSesion) return html``;
    const a = this.modalSesion;
    return html`
      <!-- Overlay -->
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
           @click=${(e: Event) => { if (e.target === e.currentTarget) this.modalSesion = null; }}>
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div class="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800
                    shadow-2xl w-full max-w-lg overflow-hidden animate-in">
          <!-- Header modal -->
          <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
            <div>
              <h3 class="font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">add_circle</span>
                Registrar Sesión
              </h3>
              <p class="text-xs text-slate-400 mt-1">
                ${a.tutoria_asignatura} · <span class="font-semibold text-slate-500">${a.estudiante_nombre}</span>
              </p>
            </div>
            <button @click=${() => { this.modalSesion = null; }}
              class="text-slate-400 hover:text-slate-600 transition-colors p-1">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Body modal -->
          <div class="px-6 py-5 space-y-5">

            <!-- Fecha -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha de la sesión *</label>
              <input
                type="date"
                .value=${this.sesionFecha}
                @input=${(e: Event) => { this.sesionFecha = (e.target as HTMLInputElement).value; }}
                class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg
                       px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>

            <!-- Estado sesión -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado de la sesión</label>
              <div class="flex gap-2">
                ${(['Realizada','Aplazada','Cancelada'] as const).map(e => html`
                  <button @click=${() => { this.sesionEstado = e; }}
                    class="flex-1 py-2 rounded-lg text-xs font-bold border transition-all
                           ${this.sesionEstado === e
                             ? e === 'Realizada' ? 'bg-green-500 text-white border-green-500'
                               : e === 'Aplazada' ? 'bg-amber-500 text-white border-amber-500'
                               : 'bg-red-500 text-white border-red-500'
                             : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary'}">
                    ${e}
                  </button>`)}
              </div>
            </div>

            <!-- Evaluaciones -->
            <div class="grid grid-cols-2 gap-4">
              ${[
                { label: '¿Domina bases?', key: 'bases' as const },
                { label: '¿Buena comprensión?', key: 'comp' as const },
              ].map(ev => html`
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">${ev.label}</label>
                  <div class="flex gap-2">
                    ${[{ v: true, l: 'Sí', cls: 'text-green-600' }, { v: false, l: 'No', cls: 'text-red-500' }, { v: null, l: 'N/A', cls: 'text-slate-400' }].map(opt => {
                      const cur = ev.key === 'bases' ? this.sesionBases : this.sesionComp;
                      const set = (val: boolean | null) => {
                        if (ev.key === 'bases') this.sesionBases = val;
                        else this.sesionComp = val;
                      };
                      return html`
                        <button @click=${() => set(opt.v)}
                          class="flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all
                                 ${cur === opt.v
                                   ? 'bg-primary text-white border-primary'
                                   : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary'}">
                          ${opt.l}
                        </button>`;
                    })}
                  </div>
                </div>`)}
            </div>

            <!-- Observaciones -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Observaciones</label>
              <textarea
                .value=${this.sesionObs}
                @input=${(e: Event) => { this.sesionObs = (e.target as HTMLTextAreaElement).value; }}
                rows="3"
                placeholder="Notas sobre la sesión…"
                class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg
                       px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"></textarea>
            </div>
          </div>

          <!-- Footer modal -->
          <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button @click=${() => { this.modalSesion = null; }}
              class="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700
                     hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              Cancelar
            </button>
            <button
              id="btn-confirmar-sesion"
              @click=${() => this._registrarSesion()}
              ?disabled=${this.guardandoSesion || !this.sesionFecha}
              class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-primary text-white
                     hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
              ${this.guardandoSesion
                ? html`<span class="material-symbols-outlined animate-spin text-lg">progress_activity</span> Guardando...`
                : html`<span class="material-symbols-outlined text-lg">save</span> Registrar en BD`}
            </button>
          </div>
        </div>
      </div>`;
  }

  /* ── Render principal ───────────────────────────────────────────────── */
  render(): TemplateResult {
    const mesAsig = this._asignacionesDelMes();

    return html`
      ${this._renderModal()}

      <div class="p-6 lg:p-10 max-w-5xl mx-auto space-y-6">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">calendar_month</span>
              Mis Asignaciones
            </h2>
            <p class="text-slate-500 text-sm mt-1">
              ${this.asignaciones.length} asignaciones en total
              ${this.diaSeleccionado ? html`
                · <span class="text-primary font-semibold">filtrando por
                  ${new Date(this.diaSeleccionado + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}
                </span>` : ''}
            </p>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button @click=${() => { this.vistaCalendario = true; }}
              class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-all
                     ${this.vistaCalendario
                       ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20'
                       : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary'}">
              <span class="material-symbols-outlined text-lg">grid_view</span>Calendario
            </button>
            <button @click=${() => { this.vistaCalendario = false; }}
              class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-all
                     ${!this.vistaCalendario
                       ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20'
                       : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary'}">
              <span class="material-symbols-outlined text-lg">view_list</span>Lista
            </button>
          </div>
        </div>

        <!-- Toast -->
        ${this.msg ? html`
          <div class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                      ${this.msg.tipo === 'ok'
                        ? 'bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400'
                        : 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400'}">
            <span class="material-symbols-outlined text-lg">${this.msg.tipo === 'ok' ? 'check_circle' : 'error'}</span>
            ${this.msg.texto}
          </div>` : ''}

        <!-- Tarjetas resumen -->
        ${!this.cargando ? html`
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            ${[
              { label: 'Este mes',   value: mesAsig.length,                                                                       icon: 'event',        cls: 'text-primary bg-primary/10'      },
              { label: 'Aceptadas',  value: this.asignaciones.filter(a => a.estado === 'Aceptada').length,                         icon: 'check_circle', cls: 'text-blue-600 bg-blue-100'       },
              { label: 'Pendientes', value: this.asignaciones.filter(a => ['INSCRITO','ASIGNADO'].includes(a.tutoria_estado)).length, icon: 'pending',   cls: 'text-amber-600 bg-amber-100'     },
              { label: 'Total',      value: this.asignaciones.length,                                                              icon: 'bar_chart',    cls: 'text-emerald-600 bg-emerald-100'  },
            ].map(s => html`
              <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3 shadow-sm">
                <span class="material-symbols-outlined text-xl p-2 rounded-lg ${s.cls}">${s.icon}</span>
                <div>
                  <p class="text-xl font-black text-slate-900 dark:text-white">${s.value}</p>
                  <p class="text-xs text-slate-400">${s.label}</p>
                </div>
              </div>`)}
          </div>` : ''}

        <!-- Anchor scroll -->
        <div class="calendario-anchor"></div>

        <!-- Calendario -->
        ${this.vistaCalendario ? this._renderCalendario() : ''}

        <!-- Filtros -->
        <div class="flex gap-2 flex-wrap items-center">
          ${(['todas','pendientes','activas'] as const).map(f => html`
            <button @click=${() => { this.filtro = f; }}
              class="px-4 py-2 rounded-full text-sm font-semibold border transition-all capitalize
                     ${this.filtro === f
                       ? 'bg-primary text-white border-primary'
                       : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary'}">
              ${f}
            </button>`)}
          <!-- Ayuda sobre acciones -->
          <div class="ml-auto flex items-center gap-1.5 text-xs text-slate-400">
            <span class="material-symbols-outlined text-sm">info</span>
            <span>Haz clic en <strong class="text-emerald-600">Aceptar</strong> o <strong class="text-red-500">Rechazar</strong> para gestionar · <strong class="text-primary">Sesión</strong> para registrar</span>
          </div>
        </div>

        <!-- Tabla -->
        ${this._renderTabla()}

      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'tutor-schedule': TutorSchedule; }
}
