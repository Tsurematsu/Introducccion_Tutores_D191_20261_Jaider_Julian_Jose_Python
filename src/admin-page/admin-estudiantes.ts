import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';

type Estudiante = { id: number; nombre: string; email: string; carrera: string; semestre: number; estado_general: string };

@customElement('admin-estudiantes')
export class AdminEstudiantes extends LitElement {
  @state() private estudiantes: Estudiante[] = [];
  @state() private cargando = true;
  @state() private error = '';
  @state() private busqueda = '';

  createRenderRoot() { return this; }

  connectedCallback() {
    super.connectedCallback();
    this._cargar();
  }

  private async _cargar() {
    this.cargando = true;
    try {
      const r = await fetch('/api/estudiantes', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      this.estudiantes = await r.json();
    } catch { this.error = 'Error al cargar estudiantes'; }
    finally { this.cargando = false; }
  }

  private get _filtrados() {
    const q = this.busqueda.toLowerCase();
    return q ? this.estudiantes.filter(e =>
      e.nombre.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || (e.carrera ?? '').toLowerCase().includes(q)
    ) : this.estudiantes;
  }

  private _badgeEstado(estado: string): TemplateResult {
    const map: Record<string, string> = {
      'Activo':     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'Inactivo':   'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      'Suspendido': 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    };
    return html`<span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${map[estado] ?? ''}">${estado}</span>`;
  }

  render(): TemplateResult {
    return html`
      <div class="p-8 max-w-7xl mx-auto space-y-6">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white">Registro de Estudiantes</h2>
            <p class="text-slate-500 text-sm mt-1">${this.estudiantes.length} estudiantes registrados</p>
          </div>
          <button class="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <span class="material-symbols-outlined text-lg">person_add</span> Nuevo Estudiante
          </button>
        </div>

        <!-- Search -->
        <div class="relative max-w-sm">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
          <input
            class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            placeholder="Buscar por nombre, email o carrera..."
            .value=${this.busqueda}
            @input=${(e: InputEvent) => { this.busqueda = (e.target as HTMLInputElement).value; }}
          />
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
                    ${['Estudiante', 'Carrera', 'Semestre', 'Estado', 'Acciones'].map(h => html`
                      <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">${h}</th>
                    `)}
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  ${this._filtrados.length === 0 ? html`
                    <tr><td colspan="5" class="px-6 py-12 text-center text-slate-400 text-sm">No se encontraron estudiantes</td></tr>
                  ` : this._filtrados.map(e => html`
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <div class="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            ${e.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p class="font-semibold text-sm text-slate-900 dark:text-white">${e.nombre}</p>
                            <p class="text-xs text-slate-400">${e.email}</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">${e.carrera ?? '—'}</td>
                      <td class="px-6 py-4 text-sm font-medium">${e.semestre ?? '—'}</td>
                      <td class="px-6 py-4">${this._badgeEstado(e.estado_general)}</td>
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-1">
                          <button class="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-primary/10 transition-colors" title="Editar">
                            <span class="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button class="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Eliminar">
                            <span class="material-symbols-outlined text-lg">delete</span>
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
  interface HTMLElementTagNameMap { 'admin-estudiantes': AdminEstudiantes; }
}
