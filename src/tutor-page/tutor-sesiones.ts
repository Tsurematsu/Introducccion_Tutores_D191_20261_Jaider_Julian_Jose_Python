import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getUsuario } from '../router';

/* ── Tipos ─────────────────────────────────────────────────────────────── */
type Sesion = {
  id: number; fecha: string; estado_sesion: string;
  tutor_evaluacion_bases: boolean | null;
  tutor_evaluacion_comprension: boolean | null;
  observaciones: string | null; tutoria_id: number;
};

type Tutoria = {
  id: number; asignatura: string; tema: string | null;
  estudiante_nombre: string; estado: string;
  fecha_asignacion: string | null; numero_sesiones: number;
};

const BADGE_SESION: Record<string, string> = {
  Realizada: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  Cancelada:  'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  Aplazada:   'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
};

const BADGE_TUTORIA: Record<string, string> = {
  INSCRITO:              'bg-slate-100 text-slate-600',
  ASIGNADO:              'bg-blue-100 text-blue-700',
  EN_DIAGNOSTICO:        'bg-yellow-100 text-yellow-700',
  EN_SEGUIMIENTO_ACTIVO: 'bg-emerald-100 text-emerald-700',
  COMPLETADO:            'bg-green-100 text-green-700',
  CANCELADO:             'bg-red-100 text-red-600',
};

/* ── Componente ─────────────────────────────────────────────────────────── */
@customElement('tutor-sesiones')
export class TutorSesiones extends LitElement {
  @state() private sesiones: Sesion[]   = [];
  @state() private tutorias: Tutoria[]  = [];
  @state() private cargando             = true;
  @state() private vistaActiva: 'sesiones' | 'agendamientos' = 'agendamientos';
  @state() private filtroEstado         = '';

  createRenderRoot() { return this; }
  connectedCallback() { super.connectedCallback(); this._cargar(); }

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

      // 1. Cargar tutorías del tutor
      const rT = await fetch(`/api/tutorias?tutor_id=${tutorId}`, { headers });
      const tutorias = await rT.json();
      this.tutorias = Array.isArray(tutorias) ? tutorias : [];

      // 2. Cargar sesiones de todas las tutorías
      const allSesiones: Sesion[] = [];
      for (const t of this.tutorias) {
        const rS = await fetch(`/api/sesiones?tutoria_id=${t.id}`, { headers });
        if (rS.ok) {
          const ses = await rS.json();
          if (Array.isArray(ses)) allSesiones.push(...ses);
        }
      }
      this.sesiones = allSesiones.sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
    } catch { /* silent */ }
    finally { this.cargando = false; }
  }

  /* ── Helpers ────────────────────────────────────────────────────────── */
  private _tutoria(id: number) {
    return this.tutorias.find(t => t.id === id);
  }

  private get _tutoriasPendientes(): Tutoria[] {
    // Tutorías que tienen el tutor asignado pero aún no tienen sesiones registradas
    const conSesion = new Set(this.sesiones.map(s => s.tutoria_id));
    let lista = this.tutorias.filter(
      t => !['CANCELADO', 'COMPLETADO'].includes(t.estado)
    );
    if (this.filtroEstado) {
      lista = lista.filter(t => t.estado === this.filtroEstado);
    }
    return lista.map(t => ({ ...t, _tieneSesion: conSesion.has(t.id) })) as unknown as Tutoria[];
  }

  private get _sesionesOrdenadas(): Sesion[] {
    return this.sesiones;
  }

  /* ── Render: Tab Agendamientos ──────────────────────────────────────── */
  private _renderAgendamientos(): TemplateResult {
    const lista = this._tutoriasPendientes;
    if (this.cargando) return html`
      <div class="flex justify-center py-16 text-slate-400">
        <span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
      </div>`;

    if (lista.length === 0) return html`
      <div class="flex flex-col items-center gap-3 py-16 text-slate-400">
        <span class="material-symbols-outlined text-6xl">event_busy</span>
        <p class="text-base font-semibold">No tienes agendamientos activos</p>
        <p class="text-sm">Los agendamientos de estudiantes aparecerán aquí</p>
      </div>`;

    return html`
      <div class="space-y-3">
        ${lista.map(t => {
          // @ts-ignore
          const tieneSesion = (t as any)._tieneSesion;
          return html`
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800
                        hover:border-primary/30 hover:shadow-md transition-all p-5">
              <div class="flex items-start justify-between gap-3 flex-wrap">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap mb-1">
                    <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full ${BADGE_TUTORIA[t.estado] ?? 'bg-slate-100 text-slate-600'}">
                      ${t.estado.replace(/_/g,' ')}
                    </span>
                    ${tieneSesion ? html`
                      <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        Con sesiones
                      </span>` : html`
                      <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        Sin sesiones aún
                      </span>`}
                  </div>
                  <p class="text-base font-black text-slate-900 dark:text-white">${t.asignatura}</p>
                  ${t.tema ? html`<p class="text-sm text-slate-500 mt-0.5">${t.tema}</p>` : ''}
                </div>
                <div class="text-right flex-shrink-0">
                  <div class="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <span class="material-symbols-outlined">school</span>
                  </div>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-slate-500 dark:text-slate-400">
                <div class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm text-slate-400">person</span>
                  <span class="font-medium truncate">${t.estudiante_nombre}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm text-slate-400">library_books</span>
                  <span>${t.numero_sesiones} sesión${t.numero_sesiones !== 1 ? 'es' : ''}</span>
                </div>
                ${t.fecha_asignacion ? html`
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm text-slate-400">calendar_today</span>
                    <span>${new Date(t.fecha_asignacion + 'T12:00:00').toLocaleDateString('es-CO')}</span>
                  </div>` : ''}
              </div>
            </div>`;
        })}
      </div>`;
  }

  /* ── Render: Tab Sesiones ───────────────────────────────────────────── */
  private _renderSesiones(): TemplateResult {
    const lista = this._sesionesOrdenadas;
    if (this.cargando) return html`
      <div class="flex justify-center py-16 text-slate-400">
        <span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
      </div>`;

    if (lista.length === 0) return html`
      <div class="flex flex-col items-center gap-3 py-16 text-slate-400">
        <span class="material-symbols-outlined text-6xl">history</span>
        <p class="text-base font-semibold">Aún no hay sesiones registradas</p>
        <p class="text-sm">Registra sesiones desde <strong class="text-slate-500">Mis Asignaciones</strong></p>
      </div>`;

    return html`
      <div class="space-y-3">
        ${lista.map(s => {
          const tutoria = this._tutoria(s.tutoria_id);
          return html`
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800
                        hover:border-primary/30 hover:shadow-md transition-all p-5">
              <div class="flex items-start justify-between gap-3 flex-wrap">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap mb-1.5">
                    <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full ${BADGE_SESION[s.estado_sesion] ?? ''}">
                      ${s.estado_sesion}
                    </span>
                  </div>
                  <p class="text-base font-black text-slate-900 dark:text-white">
                    ${tutoria?.asignatura ?? `Tutoría #${s.tutoria_id}`}
                  </p>
                  <p class="text-sm text-slate-500 mt-0.5">
                    <span class="material-symbols-outlined text-sm align-middle">person</span>
                    ${tutoria?.estudiante_nombre ?? '—'}
                  </p>
                </div>
                <div class="text-right flex-shrink-0">
                  <p class="text-xs text-slate-400">Fecha</p>
                  <p class="text-sm font-bold text-slate-700 dark:text-slate-300">
                    ${s.fecha ? new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-CO') : '—'}
                  </p>
                </div>
              </div>

              <!-- Evaluaciones -->
              <div class="mt-4 grid grid-cols-2 gap-3">
                <div class="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span class="material-symbols-outlined text-sm ${s.tutor_evaluacion_bases === true ? 'text-green-500' : s.tutor_evaluacion_bases === false ? 'text-red-500' : 'text-slate-400'}">
                    ${s.tutor_evaluacion_bases === true ? 'check_circle' : s.tutor_evaluacion_bases === false ? 'cancel' : 'help_outline'}
                  </span>
                  <span class="text-xs font-semibold text-slate-600 dark:text-slate-400">Bases conceptuales</span>
                </div>
                <div class="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span class="material-symbols-outlined text-sm ${s.tutor_evaluacion_comprension === true ? 'text-green-500' : s.tutor_evaluacion_comprension === false ? 'text-red-500' : 'text-slate-400'}">
                    ${s.tutor_evaluacion_comprension === true ? 'check_circle' : s.tutor_evaluacion_comprension === false ? 'cancel' : 'help_outline'}
                  </span>
                  <span class="text-xs font-semibold text-slate-600 dark:text-slate-400">Comprensión</span>
                </div>
              </div>

              ${s.observaciones ? html`
                <p class="mt-3 text-xs text-slate-500 italic border-t border-slate-100 dark:border-slate-800 pt-3">
                  ${s.observaciones}
                </p>` : ''}
            </div>`;
        })}
      </div>`;
  }

  /* ── Render principal ───────────────────────────────────────────────── */
  render(): TemplateResult {
    const totalPendientes = this.tutorias.filter(t => !['CANCELADO','COMPLETADO'].includes(t.estado)).length;
    const totalSesiones   = this.sesiones.length;

    return html`
      <div class="p-6 lg:p-10 max-w-5xl mx-auto space-y-6">

        <!-- Header -->
        <div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">history</span>
            Historial de Sesiones
          </h2>
          <p class="text-slate-500 text-sm mt-1">
            ${totalPendientes} agendamiento${totalPendientes !== 1 ? 's' : ''} activo${totalPendientes !== 1 ? 's' : ''}
            · ${totalSesiones} sesión${totalSesiones !== 1 ? 'es' : ''} registrada${totalSesiones !== 1 ? 's' : ''}
          </p>
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
          <button @click=${() => { this.vistaActiva = 'agendamientos'; }}
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
                   ${this.vistaActiva === 'agendamientos'
                     ? 'bg-white dark:bg-slate-900 text-primary shadow-sm'
                     : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}">
            <span class="material-symbols-outlined text-sm">event_note</span>
            Agendamientos
            ${totalPendientes > 0 ? html`
              <span class="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                ${totalPendientes}
              </span>` : ''}
          </button>
          <button @click=${() => { this.vistaActiva = 'sesiones'; }}
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
                   ${this.vistaActiva === 'sesiones'
                     ? 'bg-white dark:bg-slate-900 text-primary shadow-sm'
                     : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}">
            <span class="material-symbols-outlined text-sm">history</span>
            Sesiones Realizadas
            ${totalSesiones > 0 ? html`
              <span class="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                ${totalSesiones}
              </span>` : ''}
          </button>
        </div>

        <!-- Filtro estado (solo en agendamientos) -->
        ${this.vistaActiva === 'agendamientos' && this.tutorias.length > 0 ? html`
          <div class="flex gap-2 flex-wrap -mt-2">
            ${['', 'ASIGNADO', 'EN_DIAGNOSTICO', 'EN_SEGUIMIENTO_ACTIVO'].map(s => html`
              <button @click=${() => { this.filtroEstado = s; }}
                class="px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                       ${this.filtroEstado === s
                         ? 'bg-primary text-white border-primary'
                         : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary'}">
                ${s === '' ? 'Todos' : s.replace(/_/g,' ')}
              </button>`)}
          </div>` : ''}

        <!-- Contenido del tab activo -->
        ${this.vistaActiva === 'agendamientos'
          ? this._renderAgendamientos()
          : this._renderSesiones()}

      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'tutor-sesiones': TutorSesiones; }
}
