import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';

type Tutor = { id: number; nombre: string; email: string; especialidades: string[]; estado: string };

@customElement('admin-tutores')
export class AdminTutores extends LitElement {
  @state() private tutores: Tutor[] = [];
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
      const r = await fetch('/api/tutores', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      this.tutores = await r.json();
    } catch { this.error = 'Error al cargar tutores'; }
    finally { this.cargando = false; }
  }

  private get _filtrados() {
    const q = this.busqueda.toLowerCase();
    return q ? this.tutores.filter(t =>
      t.nombre.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) ||
      (t.especialidades ?? []).some((e: string) => e.toLowerCase().includes(q))
    ) : this.tutores;
  }

  render(): TemplateResult {
    return html`
      <div class="p-8 max-w-7xl mx-auto space-y-6">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white">Registro de Tutores</h2>
            <p class="text-slate-500 text-sm mt-1">${this.tutores.length} tutores registrados</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="flex items-center gap-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              <span class="material-symbols-outlined text-lg">download</span> Exportar
            </button>
            <button class="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              <span class="material-symbols-outlined text-lg">add</span> Nuevo Tutor
            </button>
          </div>
        </div>

        <!-- Filtros + búsqueda -->
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1 max-w-sm">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input
              class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Buscar por nombre, email o especialidad..."
              .value=${this.busqueda}
              @input=${(e: InputEvent) => { this.busqueda = (e.target as HTMLInputElement).value; }}
            />
          </div>
          <div class="flex items-center gap-2">
            ${['Todos', 'Activo', 'Inactivo'].map(f => html`
              <button class="px-3 py-2 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary transition-colors
                             ${f === 'Todos' ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'}">
                ${f}
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
            <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 class="font-bold text-slate-900 dark:text-white">Directorio de Tutores</h3>
              <span class="text-sm text-slate-400">Mostrando ${this._filtrados.length} de ${this.tutores.length}</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    ${['Tutor', 'Especialidades', 'Disponibilidad', 'Estado', 'Acciones'].map(h => html`
                      <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">${h}</th>
                    `)}
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  ${this._filtrados.length === 0 ? html`
                    <tr><td colspan="5" class="px-6 py-12 text-center text-slate-400 text-sm">No se encontraron tutores</td></tr>
                  ` : this._filtrados.map(t => html`
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <div class="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            ${t.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p class="font-semibold text-sm text-slate-900 dark:text-white">${t.nombre}</p>
                            <p class="text-xs text-slate-400">${t.email}</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex flex-wrap gap-1">
                          ${(t.especialidades ?? []).slice(0, 3).map((esp: string) => html`
                            <span class="bg-primary/10 text-primary px-2 py-0.5 rounded text-[11px] font-semibold">${esp}</span>
                          `)}
                          ${(t.especialidades ?? []).length > 3 ? html`
                            <span class="text-xs text-slate-400">+${t.especialidades.length - 3}</span>
                          ` : ''}
                        </div>
                      </td>
                      <td class="px-6 py-4 text-sm text-slate-500">
                        <span class="flex items-center gap-1">
                          <span class="material-symbols-outlined text-sm text-slate-400">schedule</span>
                          Por confirmar
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="px-2 py-0.5 rounded-full text-[11px] font-bold
                          ${t.estado === 'Activo'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}">
                          ${t.estado}
                        </span>
                      </td>
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
  interface HTMLElementTagNameMap { 'admin-tutores': AdminTutores; }
}
