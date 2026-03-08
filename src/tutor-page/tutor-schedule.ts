import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getUsuario } from '../router';

type Asignacion = {
  id: number; estado: string;
  tutoria_asignatura: string; tutoria_estado: string;
  estudiante_nombre: string; fecha_asignacion: string;
  dentro_de_24h: boolean; tutoria_id: number;
};

@customElement('tutor-schedule')
export class TutorSchedule extends LitElement {
  @state() private asignaciones: Asignacion[] = [];
  @state() private cargando = true;
  @state() private filtro: 'todas' | 'pendientes' | 'activas' = 'todas';

  createRenderRoot() { return this; }

  connectedCallback() {
    super.connectedCallback();
    this._cargar();
  }

  private async _cargar() {
    try {
      const u = getUsuario();
      if (!u) return;
      const r = await fetch(`/api/asignaciones?tutor_id=${u.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      this.asignaciones = await r.json();
    } catch {/* silent */}
    finally { this.cargando = false; }
  }

  private get _filtradas() {
    switch (this.filtro) {
      case 'pendientes': return this.asignaciones.filter(a => ['INSCRITO', 'ASIGNADO'].includes(a.tutoria_estado));
      case 'activas':    return this.asignaciones.filter(a => a.estado === 'Aceptada');
      default:           return this.asignaciones;
    }
  }

  render(): TemplateResult {
    return html`
      <div class="p-6 lg:p-10 max-w-5xl mx-auto space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white">Mis Asignaciones</h2>
            <p class="text-slate-500 text-sm mt-1">${this.asignaciones.length} asignaciones en total</p>
          </div>
        </div>

        <!-- Filtros -->
        <div class="flex gap-2 flex-wrap">
          ${(['todas', 'pendientes', 'activas'] as const).map(f => html`
            <button @click=${() => { this.filtro = f; }}
              class="px-4 py-2 rounded-full text-sm font-semibold border transition-all capitalize
                     ${this.filtro === f
                       ? 'bg-primary text-white border-primary'
                       : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary'}">
              ${f}
            </button>
          `)}
        </div>

        <!-- Tabla -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          ${this.cargando ? html`
            <div class="flex justify-center py-16 text-slate-400">
              <span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            </div>
          ` : this._filtradas.length === 0 ? html`
            <div class="py-14 text-center text-slate-400 text-sm">No hay asignaciones en esta categoría</div>
          ` : html`
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    ${['Estudiante', 'Asignatura', 'Estado Tutoría', 'Estado Asig.', 'Fecha', 'Dentro 24h', 'Acciones']
                      .map(h => html`<th class="px-5 py-4 text-xs font-bold text-slate-500 uppercase">${h}</th>`)}
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  ${this._filtradas.map(a => html`
                    <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                      <td class="px-5 py-4">
                        <div class="flex items-center gap-3">
                          <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            ${(a.estudiante_nombre ?? '?').charAt(0)}
                          </div>
                          <span class="text-sm font-semibold">${a.estudiante_nombre}</span>
                        </div>
                      </td>
                      <td class="px-5 py-4 text-sm font-medium">${a.tutoria_asignatura}</td>
                      <td class="px-5 py-4">
                        <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">
                          ${a.tutoria_estado?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td class="px-5 py-4">
                        <span class="text-xs font-semibold px-2 py-0.5 rounded-full
                          ${a.estado === 'Aceptada'   ? 'bg-blue-100 text-blue-700' :
                            a.estado === 'Rechazada'  ? 'bg-red-100 text-red-600'   :
                                                        'bg-slate-100 text-slate-600'}">
                          ${a.estado}
                        </span>
                      </td>
                      <td class="px-5 py-4 text-xs text-slate-500">
                        ${a.fecha_asignacion ? new Date(a.fecha_asignacion).toLocaleDateString('es-CO') : '—'}
                      </td>
                      <td class="px-5 py-4 text-center">
                        ${a.dentro_de_24h
                          ? html`<span class="text-green-600 material-symbols-outlined text-lg" title="Dentro de 24h">check_circle</span>`
                          : html`<span class="text-red-400 material-symbols-outlined text-lg" title="Fuera de 24h">cancel</span>`}
                      </td>
                      <td class="px-5 py-4">
                        <div class="flex items-center gap-1">
                          <button class="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-primary/10 transition-colors" title="Ver">
                            <span class="material-symbols-outlined text-lg">visibility</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `)}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'tutor-schedule': TutorSchedule; }
}
