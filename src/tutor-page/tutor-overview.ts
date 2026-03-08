import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getUsuario } from '../router';

type Asignacion = {
  id: number; estado: string;
  tutoria_asignatura: string; tutoria_estado: string;
  estudiante_nombre: string; fecha_asignacion: string;
  dentro_de_24h: boolean;
};

type Tutoria = {
  id: number; asignatura: string; tema: string; estado: string;
  estudiante_nombre: string; numero_sesiones: number;
  fecha_inscripcion: string;
};

@customElement('tutor-overview')
export class TutorOverview extends LitElement {
  @state() private asignaciones: Asignacion[] = [];
  @state() private tutorias: Tutoria[] = [];
  @state() private cargando = true;

  createRenderRoot() { return this; }

  connectedCallback() {
    super.connectedCallback();
    this._cargar();
  }

  private async _cargar() {
    try {
      const u = getUsuario();
      if (!u) return;
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      // perfil_id = id en tabla tutores (puede diferir de usuarios.id)
      const tutorId = (u as { perfil_id?: number | null }).perfil_id ?? u.id;
      const [rA, rT] = await Promise.all([
        fetch(`/api/asignaciones?tutor_id=${tutorId}`, { headers }),
        fetch(`/api/tutorias?tutor_id=${tutorId}`, { headers }),
      ]);
      this.asignaciones = await rA.json();
      this.tutorias     = await rT.json();
    } catch {/* silent */}
    finally { this.cargando = false; }
  }

  private _navigate(page: string) {
    this.dispatchEvent(new CustomEvent('navigate', { detail: page, bubbles: true, composed: true }));
  }

  private get _activas() {
    return this.tutorias.filter(t => ['EN_DIAGNOSTICO', 'EN_SEGUIMIENTO_ACTIVO', 'ASIGNADO'].includes(t.estado));
  }

  render(): TemplateResult {
    return html`
      <div class="p-6 lg:p-10 max-w-7xl w-full mx-auto space-y-8">

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${[
            { label: 'Tutorías Activas',    value: this.cargando ? '…' : String(this._activas.length),      badge: 'En curso',    badgeCls: 'bg-green-100 text-green-700' },
            { label: 'Total Asignaciones',  value: this.cargando ? '…' : String(this.asignaciones.length),  badge: 'Acumulado',   badgeCls: 'bg-primary/10 text-primary'  },
            { label: 'Sesiones Realizadas', value: this.cargando ? '…' : String(this.tutorias.reduce((s, t) => s + (t.numero_sesiones ?? 0), 0)), badge: 'Total', badgeCls: 'bg-blue-100 text-blue-700' },
          ].map(s => html`
            <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <p class="text-slate-500 text-sm font-medium">${s.label}</p>
                <span class="text-xs px-2 py-1 rounded-full font-semibold ${s.badgeCls}">${s.badge}</span>
              </div>
              <p class="text-3xl font-bold text-slate-900 dark:text-white">${s.value}</p>
            </div>
          `)}
        </div>

        <!-- Asignaciones recientes + próximas sesiones -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">

          <!-- Asignaciones recientes -->
          <div class="xl:col-span-2 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-slate-900 dark:text-white">Asignaciones Recientes</h3>
              <button @click=${() => this._navigate('schedule')} class="text-primary text-sm font-semibold hover:underline">Ver todo</button>
            </div>
            <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              ${this.cargando ? html`
                <div class="flex justify-center py-12 text-slate-400">
                  <span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
                </div>
              ` : this.asignaciones.length === 0 ? html`
                <div class="py-12 text-center text-slate-400 text-sm">
                  <span class="material-symbols-outlined text-4xl block mb-2">inbox</span>
                  No tienes asignaciones aún
                </div>
              ` : html`
                <div class="overflow-x-auto">
                  <table class="w-full text-left">
                    <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        ${['Estudiante', 'Asignatura', 'Fecha', 'Estado', 'Acciones'].map(h => html`
                          <th class="px-5 py-4 text-xs font-bold text-slate-500 uppercase">${h}</th>`)}
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                      ${this.asignaciones.slice(0, 5).map(a => html`
                        <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                          <td class="px-5 py-4">
                            <div class="flex items-center gap-3">
                              <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                ${(a.estudiante_nombre ?? '?').charAt(0).toUpperCase()}
                              </div>
                              <span class="text-sm font-semibold">${a.estudiante_nombre}</span>
                            </div>
                          </td>
                          <td class="px-5 py-4 text-sm">${a.tutoria_asignatura}</td>
                          <td class="px-5 py-4 text-sm text-slate-500">
                            ${a.fecha_asignacion ? new Date(a.fecha_asignacion).toLocaleDateString('es-CO') : '—'}
                          </td>
                          <td class="px-5 py-4">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                              ${a.estado === 'Aceptada'   ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                a.estado === 'Rechazada'  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-slate-100 text-slate-600'}">
                              ${a.estado}
                            </span>
                          </td>
                          <td class="px-5 py-4">
                            ${a.estado === 'Aceptada' ? html`
                              <button @click=${() => this._navigate('schedule')}
                                class="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-semibold">
                                <span class="material-symbols-outlined text-sm">visibility</span>Ver
                              </button>
                            ` : ''}
                          </td>
                        </tr>
                      `)}
                    </tbody>
                  </table>
                </div>
              `}
            </div>
          </div>

          <!-- Tutorías activas -->
          <div class="space-y-4">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">Tutorías Activas</h3>
            <div class="flex flex-col gap-4">
              ${this.cargando ? html`
                <div class="flex justify-center py-8 text-slate-400">
                  <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                </div>
              ` : this._activas.length === 0 ? html`
                <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-400 text-sm">
                  Sin tutorías activas
                </div>
              ` : this._activas.slice(0, 3).map(t => html`
                <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                  <div class="bg-primary/10 text-primary p-3 rounded-xl flex flex-col items-center justify-center min-w-[52px]">
                    <span class="material-symbols-outlined">school</span>
                  </div>
                  <div class="flex-1 overflow-hidden">
                    <p class="text-sm font-bold text-slate-900 dark:text-white truncate">${t.asignatura}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="material-symbols-outlined text-slate-400 text-sm">person</span>
                      <span class="text-xs text-slate-500 truncate">${t.estudiante_nombre}</span>
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="material-symbols-outlined text-slate-400 text-sm">library_books</span>
                      <span class="text-xs text-primary font-medium">${t.numero_sesiones} sesiones</span>
                    </div>
                  </div>
                </div>
              `)}
              ${this._activas.length > 3 ? html`
                <button @click=${() => this._navigate('sesiones')}
                  class="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl hover:opacity-90 transition-all">
                  Ver todas (${this._activas.length})
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'tutor-overview': TutorOverview; }
}
