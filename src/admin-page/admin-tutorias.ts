import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';

type Tutoria = {
  id: number; asignatura: string; tema: string; estado: string;
  estudiante_nombre: string; tutor_nombre: string | null;
  fecha_inscripcion: string; numero_sesiones: number;
};

const ESTADO_COLORS: Record<string, string> = {
  INSCRITO:              'bg-slate-100    text-slate-600   dark:bg-slate-800    dark:text-slate-400',
  ASIGNADO:              'bg-blue-100     text-blue-700    dark:bg-blue-900/30  dark:text-blue-400',
  EN_DIAGNOSTICO:        'bg-yellow-100   text-yellow-700  dark:bg-yellow-900/30 dark:text-yellow-400',
  EN_SEGUIMIENTO_ACTIVO: 'bg-green-100    text-green-700   dark:bg-green-900/30 dark:text-green-400',
  DERIVADO:              'bg-purple-100   text-purple-700  dark:bg-purple-900/30 dark:text-purple-400',
  PROCESO_ESPECIAL:      'bg-orange-100   text-orange-700  dark:bg-orange-900/30 dark:text-orange-400',
  CANCELADO:             'bg-red-100      text-red-600     dark:bg-red-900/30   dark:text-red-400',
  APLAZADO:              'bg-amber-100    text-amber-700   dark:bg-amber-900/30 dark:text-amber-400',
  COMPLETADO:            'bg-emerald-100  text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

@customElement('admin-tutorias')
export class AdminTutorias extends LitElement {
  @state() private tutorias: Tutoria[] = [];
  @state() private cargando = true;
  @state() private error = '';
  @state() private busqueda = '';
  @state() private filtroEstado = 'TODOS';

  createRenderRoot() { return this; }

  connectedCallback() {
    super.connectedCallback();
    this._cargar();
  }

  private async _cargar() {
    this.cargando = true;
    try {
      const r = await fetch('/api/tutorias', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      this.tutorias = await r.json();
    } catch { this.error = 'Error al cargar tutorías'; }
    finally { this.cargando = false; }
  }

  private get _filtrados() {
    return this.tutorias
      .filter(t => this.filtroEstado === 'TODOS' || t.estado === this.filtroEstado)
      .filter(t => {
        const q = this.busqueda.toLowerCase();
        return !q || t.asignatura.toLowerCase().includes(q) ||
          t.estudiante_nombre?.toLowerCase().includes(q) ||
          (t.tutor_nombre ?? '').toLowerCase().includes(q);
      });
  }

  render(): TemplateResult {
    const estados = ['TODOS', 'INSCRITO', 'ASIGNADO', 'EN_DIAGNOSTICO', 'EN_SEGUIMIENTO_ACTIVO', 'COMPLETADO', 'CANCELADO'];

    return html`
      <div class="p-8 max-w-7xl mx-auto space-y-6">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white">Tutorías</h2>
            <p class="text-slate-500 text-sm mt-1">${this.tutorias.length} tutorías en total</p>
          </div>
          <button class="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <span class="material-symbols-outlined text-lg">add</span> Nueva Tutoría
          </button>
        </div>

        <!-- Filters -->
        <div class="flex flex-col gap-3">
          <div class="relative max-w-sm">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input
              class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Buscar por asignatura o estudiante..."
              .value=${this.busqueda}
              @input=${(e: InputEvent) => { this.busqueda = (e.target as HTMLInputElement).value; }}
            />
          </div>
          <div class="flex flex-wrap gap-2">
            ${estados.map(est => html`
              <button
                @click=${() => { this.filtroEstado = est; }}
                class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                       ${this.filtroEstado === est
                         ? 'bg-primary text-white border-primary shadow-sm'
                         : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary'}">
                ${est.replace(/_/g, ' ')}
              </button>
            `)}
          </div>
        </div>

        <!-- Table -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          ${this.cargando ? html`
            <div class="flex justify-center py-16 text-slate-400">
              <span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            </div>
          ` : this.error ? html`
            <div class="py-12 text-center text-red-500">${this.error}</div>
          ` : html`
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    ${['Asignatura', 'Estudiante', 'Tutor', 'Estado', 'Sesiones', 'Fecha', 'Acciones'].map(h => html`
                      <th class="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">${h}</th>
                    `)}
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  ${this._filtrados.length === 0 ? html`
                    <tr><td colspan="7" class="px-6 py-12 text-center text-slate-400 text-sm">No se encontraron tutorías</td></tr>
                  ` : this._filtrados.map(t => html`
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td class="px-5 py-4">
                        <p class="font-semibold text-sm text-slate-900 dark:text-white">${t.asignatura}</p>
                        ${t.tema ? html`<p class="text-xs text-slate-400">${t.tema}</p>` : ''}
                      </td>
                      <td class="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">${t.estudiante_nombre ?? '—'}</td>
                      <td class="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                        ${t.tutor_nombre ?? html`<span class="text-amber-500 text-xs font-medium">Sin asignar</span>`}
                      </td>
                      <td class="px-5 py-4">
                        <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${ESTADO_COLORS[t.estado] ?? ''}">
                          ${t.estado.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td class="px-5 py-4 text-sm font-bold text-center">${t.numero_sesiones ?? 0}</td>
                      <td class="px-5 py-4 text-xs text-slate-400">
                        ${t.fecha_inscripcion ? new Date(t.fecha_inscripcion).toLocaleDateString('es-CO') : '—'}
                      </td>
                      <td class="px-5 py-4">
                        <div class="flex items-center gap-1">
                          <button class="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-primary/10 transition-colors" title="Ver detalle">
                            <span class="material-symbols-outlined text-lg">visibility</span>
                          </button>
                          <button class="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-primary/10 transition-colors" title="Editar">
                            <span class="material-symbols-outlined text-lg">edit</span>
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
  interface HTMLElementTagNameMap { 'admin-tutorias': AdminTutorias; }
}
