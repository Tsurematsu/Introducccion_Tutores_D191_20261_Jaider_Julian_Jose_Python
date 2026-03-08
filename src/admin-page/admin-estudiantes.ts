import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';

type Estudiante = {
  id: number; nombre: string; email: string;
  carrera: string; semestre: number; estado_general: string; fecha_ingreso: string;
};

const ESTADOS = ['Activo', 'Inactivo', 'Suspendido'];
const TOKEN = () => localStorage.getItem('token') ?? '';
const H = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` });

@customElement('admin-estudiantes')
export class AdminEstudiantes extends LitElement {
  @state() private estudiantes: Estudiante[] = [];
  @state() private cargando = true;
  @state() private error = '';
  @state() private busqueda = '';
  @state() private modal: 'crear' | 'editar' | 'eliminar' | null = null;
  @state() private seleccionado: Partial<Estudiante> = {};
  @state() private guardando = false;
  @state() private toast = '';

  createRenderRoot() { return this; }
  connectedCallback() { super.connectedCallback(); this._cargar(); }

  private async _cargar() {
    this.cargando = true; this.error = '';
    try {
      const r = await fetch('/api/estudiantes', { headers: H() });
      this.estudiantes = await r.json();
    } catch { this.error = 'Error al cargar estudiantes'; }
    finally { this.cargando = false; }
  }

  private _toast(msg: string) {
    this.toast = msg;
    setTimeout(() => { this.toast = ''; }, 3000);
  }

  private async _guardar() {
    this.guardando = true;
    try {
      const { id, ...body } = this.seleccionado;
      const url = id ? `/api/estudiantes?id=${id}` : '/api/estudiantes';
      const method = id ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: H(), body: JSON.stringify(body) });
      if (!r.ok) throw new Error(await r.text());
      this._toast(id ? 'Estudiante actualizado ✓' : 'Estudiante creado ✓');
      this.modal = null;
      await this._cargar();
    } catch (e: unknown) {
      this._toast('Error: ' + (e instanceof Error ? e.message : 'Error desconocido'));
    } finally { this.guardando = false; }
  }

  private async _eliminar() {
    this.guardando = true;
    try {
      const r = await fetch(`/api/estudiantes?id=${this.seleccionado.id}`, { method: 'DELETE', headers: H() });
      if (!r.ok) throw new Error(await r.text());
      this._toast('Estudiante eliminado ✓');
      this.modal = null;
      await this._cargar();
    } catch (e: unknown) {
      this._toast('Error: ' + (e instanceof Error ? e.message : 'Error desconocido'));
    } finally { this.guardando = false; }
  }

  private _abrirCrear() { this.seleccionado = { estado_general: 'Activo' }; this.modal = 'crear'; }
  private _abrirEditar(e: Estudiante) { this.seleccionado = { ...e }; this.modal = 'editar'; }
  private _abrirEliminar(e: Estudiante) { this.seleccionado = { ...e }; this.modal = 'eliminar'; }
  private _set(k: string, v: string | number) { this.seleccionado = { ...this.seleccionado, [k]: v }; }

  private get _filtrados() {
    const q = this.busqueda.toLowerCase();
    return q ? this.estudiantes.filter(e =>
      e.nombre.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) ||
      (e.carrera ?? '').toLowerCase().includes(q)) : this.estudiantes;
  }

  private _badge(estado: string) {
    const cls: Record<string, string> = {
      'Activo':     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'Inactivo':   'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      'Suspendido': 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    };
    return html`<span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${cls[estado] ?? ''}">${estado}</span>`;
  }

  /* ── Modal de formulario ─────────────────────────────────── */
  private _renderFormModal(): TemplateResult {
    const s = this.seleccionado;
    const esEditar = this.modal === 'editar';
    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              ${esEditar ? 'Editar Estudiante' : 'Nuevo Estudiante'}
            </h3>
            <button @click=${() => { this.modal = null; }} class="text-slate-400 hover:text-red-500 transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="space-y-4">
            ${[
              { k: 'nombre',   label: 'Nombre completo', type: 'text',   req: true  },
              { k: 'email',    label: 'Email',           type: 'email',  req: true  },
              { k: 'carrera',  label: 'Carrera',         type: 'text',   req: false },
              { k: 'semestre', label: 'Semestre',        type: 'number', req: false },
            ].map(f => html`
              <div class="flex flex-col gap-1">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  ${f.label}${f.req ? html` <span class="text-red-400">*</span>` : ''}
                </label>
                <input
                  type=${f.type}
                  .value=${String((s as Record<string, unknown>)[f.k] ?? '')}
                  @input=${(ev: InputEvent) => this._set(f.k, (ev.target as HTMLInputElement).value)}
                  class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            `)}
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</label>
              <select
                .value=${s.estado_general ?? 'Activo'}
                @change=${(ev: Event) => this._set('estado_general', (ev.target as HTMLSelectElement).value)}
                class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                ${ESTADOS.map(e => html`<option value=${e} .selected=${s.estado_general === e}>${e}</option>`)}
              </select>
            </div>
          </div>
          <div class="flex gap-3 pt-2">
            <button @click=${() => { this.modal = null; }}
              class="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button @click=${this._guardar} ?disabled=${this.guardando}
              class="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-60">
              ${this.guardando ? 'Guardando…' : (esEditar ? 'Guardar cambios' : 'Crear estudiante')}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderDeleteModal(): TemplateResult {
    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-5 text-center">
          <div class="w-14 h-14 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto">
            <span class="material-symbols-outlined text-3xl">delete_forever</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">¿Eliminar estudiante?</h3>
            <p class="text-slate-500 text-sm mt-1">
              Esta acción eliminará a <strong>${this.seleccionado.nombre}</strong> y no se puede deshacer.
            </p>
          </div>
          <div class="flex gap-3">
            <button @click=${() => { this.modal = null; }}
              class="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button @click=${this._eliminar} ?disabled=${this.guardando}
              class="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-60">
              ${this.guardando ? 'Eliminando…' : 'Sí, eliminar'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  render(): TemplateResult {
    return html`
      ${this.toast ? html`
        <div class="fixed top-4 right-4 z-[60] bg-slate-900 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <span class="material-symbols-outlined text-green-400">check_circle</span>${this.toast}
        </div>
      ` : ''}
      ${this.modal === 'crear' || this.modal === 'editar' ? this._renderFormModal() : ''}
      ${this.modal === 'eliminar' ? this._renderDeleteModal() : ''}

      <div class="p-8 max-w-7xl mx-auto space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white">Registro de Estudiantes</h2>
            <p class="text-slate-500 text-sm mt-1">${this.estudiantes.length} estudiantes registrados</p>
          </div>
          <button @click=${this._abrirCrear}
            class="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <span class="material-symbols-outlined text-lg">person_add</span> Nuevo Estudiante
          </button>
        </div>

        <div class="relative max-w-sm">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
          <input
            class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            placeholder="Buscar por nombre, email o carrera..."
            .value=${this.busqueda}
            @input=${(e: InputEvent) => { this.busqueda = (e.target as HTMLInputElement).value; }}
          />
        </div>

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
                      <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">${h}</th>`)}
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
                      <td class="px-6 py-4">${this._badge(e.estado_general)}</td>
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-1">
                          <button @click=${() => this._abrirEditar(e)}
                            class="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-primary/10 transition-colors" title="Editar">
                            <span class="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button @click=${() => this._abrirEliminar(e)}
                            class="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Eliminar">
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
