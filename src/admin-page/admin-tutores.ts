import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';

type Tutor = { id: number; nombre: string; email: string; especialidades: string[]; estado: string };
const TOKEN = () => localStorage.getItem('token') ?? '';
const H = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` });

@customElement('admin-tutores')
export class AdminTutores extends LitElement {
  @state() private tutores: Tutor[] = [];
  @state() private cargando = true;
  @state() private error = '';
  @state() private busqueda = '';
  @state() private filtroEstado = 'Todos';
  @state() private modal: 'crear' | 'editar' | 'eliminar' | null = null;
  @state() private sel: Partial<Tutor> & { esp_str?: string } = {};
  @state() private guardando = false;
  @state() private toast = '';

  createRenderRoot() { return this; }
  connectedCallback() { super.connectedCallback(); this._cargar(); }

  private async _cargar() {
    this.cargando = true; this.error = '';
    try { const r = await fetch('/api/tutores', { headers: H() }); this.tutores = await r.json(); }
    catch { this.error = 'Error al cargar tutores'; }
    finally { this.cargando = false; }
  }

  private _toast(msg: string) { this.toast = msg; setTimeout(() => { this.toast = ''; }, 3000); }

  private async _guardar() {
    this.guardando = true;
    try {
      const { id, esp_str, ...rest } = this.sel;
      const body = { ...rest, especialidades: (esp_str ?? '').split(',').map((s: string) => s.trim()).filter(Boolean) };
      const r = await fetch(id ? `/api/tutores?id=${id}` : '/api/tutores',
        { method: id ? 'PUT' : 'POST', headers: H(), body: JSON.stringify(body) });
      if (!r.ok) throw new Error(await r.text());
      this._toast(id ? 'Tutor actualizado ✓' : 'Tutor creado ✓');
      this.modal = null; await this._cargar();
    } catch (e: unknown) { this._toast('Error: ' + (e instanceof Error ? e.message : 'desconocido')); }
    finally { this.guardando = false; }
  }

  private async _eliminar() {
    this.guardando = true;
    try {
      const r = await fetch(`/api/tutores?id=${this.sel.id}`, { method: 'DELETE', headers: H() });
      if (!r.ok) throw new Error(await r.text());
      this._toast('Tutor eliminado ✓'); this.modal = null; await this._cargar();
    } catch (e: unknown) { this._toast('Error: ' + (e instanceof Error ? e.message : 'desconocido')); }
    finally { this.guardando = false; }
  }

  private _set(k: string, v: string) { this.sel = { ...this.sel, [k]: v }; }
  private _abrirCrear() { this.sel = { estado: 'Activo', esp_str: '' }; this.modal = 'crear'; }
  private _abrirEditar(t: Tutor) { this.sel = { ...t, esp_str: (t.especialidades ?? []).join(', ') }; this.modal = 'editar'; }
  private _abrirEliminar(t: Tutor) { this.sel = { ...t }; this.modal = 'eliminar'; }

  private get _filtrados() {
    return this.tutores
      .filter(t => this.filtroEstado === 'Todos' || t.estado === this.filtroEstado)
      .filter(t => { const q = this.busqueda.toLowerCase();
        return !q || t.nombre.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) ||
          (t.especialidades ?? []).some((e: string) => e.toLowerCase().includes(q)); });
  }

  private _modal(): TemplateResult {
    const s = this.sel; const esE = this.modal === 'editar';
    if (this.modal === 'eliminar') return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-5 text-center">
          <div class="w-14 h-14 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto">
            <span class="material-symbols-outlined text-3xl">delete_forever</span>
          </div>
          <div><h3 class="text-lg font-bold">¿Eliminar tutor?</h3>
            <p class="text-slate-500 text-sm mt-1">Se eliminará a <strong>${s.nombre}</strong>.</p></div>
          <div class="flex gap-3">
            <button @click=${() => { this.modal = null; }} class="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button @click=${this._eliminar} ?disabled=${this.guardando} class="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-bold disabled:opacity-60">
              ${this.guardando ? 'Eliminando…' : 'Sí, eliminar'}</button>
          </div>
        </div>
      </div>`;
    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold">${esE ? 'Editar Tutor' : 'Nuevo Tutor'}</h3>
            <button @click=${() => { this.modal = null; }} class="text-slate-400 hover:text-red-500"><span class="material-symbols-outlined">close</span></button>
          </div>
          <div class="space-y-4">
            ${[{ k: 'nombre', label: 'Nombre completo', type: 'text' }, { k: 'email', label: 'Email', type: 'email' }].map(f => html`
              <div class="flex flex-col gap-1">
                <label class="text-xs font-bold text-slate-500 uppercase">${f.label} <span class="text-red-400">*</span></label>
                <input type=${f.type} .value=${String((s as Record<string, unknown>)[f.k] ?? '')}
                  @input=${(ev: InputEvent) => this._set(f.k, (ev.target as HTMLInputElement).value)}
                  class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"/>
              </div>`)}
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-slate-500 uppercase">Especialidades <span class="font-normal normal-case">(separadas por coma)</span></label>
              <input type="text" .value=${s.esp_str ?? ''} placeholder="Ej: Matemáticas, Física"
                @input=${(ev: InputEvent) => this._set('esp_str', (ev.target as HTMLInputElement).value)}
                class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"/>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-slate-500 uppercase">Estado</label>
              <select @change=${(ev: Event) => this._set('estado', (ev.target as HTMLSelectElement).value)}
                class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                ${['Activo', 'Inactivo'].map(e => html`<option value=${e} .selected=${s.estado === e}>${e}</option>`)}
              </select>
            </div>
          </div>
          <div class="flex gap-3 pt-2">
            <button @click=${() => { this.modal = null; }} class="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button @click=${this._guardar} ?disabled=${this.guardando}
              class="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-60">
              ${this.guardando ? 'Guardando…' : (esE ? 'Guardar cambios' : 'Crear tutor')}</button>
          </div>
        </div>
      </div>`;
  }

  render(): TemplateResult {
    return html`
      ${this.toast ? html`<div class="fixed top-4 right-4 z-[60] bg-slate-900 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
        <span class="material-symbols-outlined text-green-400">check_circle</span>${this.toast}</div>` : ''}
      ${this.modal ? this._modal() : ''}
      <div class="p-8 max-w-7xl mx-auto space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white">Registro de Tutores</h2>
            <p class="text-slate-500 text-sm mt-1">${this.tutores.length} tutores registrados</p>
          </div>
          <button @click=${this._abrirCrear}
            class="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20">
            <span class="material-symbols-outlined text-lg">add</span> Nuevo Tutor
          </button>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1 max-w-sm">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Buscar..." .value=${this.busqueda}
              @input=${(e: InputEvent) => { this.busqueda = (e.target as HTMLInputElement).value; }}/>
          </div>
          <div class="flex items-center gap-2">
            ${['Todos', 'Activo', 'Inactivo'].map(f => html`
              <button @click=${() => { this.filtroEstado = f; }}
                class="px-3 py-2 rounded-full text-sm font-medium border transition-all
                  ${this.filtroEstado === f ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary'}">${f}</button>`)}
          </div>
        </div>
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          ${this.cargando ? html`<div class="flex justify-center py-16 text-slate-400"><span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span></div>`
          : this.error   ? html`<div class="py-12 text-center text-red-500">${this.error}</div>`
          : html`
            <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between">
              <h3 class="font-bold">Directorio de Tutores</h3>
              <span class="text-sm text-slate-400">Mostrando ${this._filtrados.length} de ${this.tutores.length}</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>${['Tutor', 'Especialidades', 'Estado', 'Acciones'].map(h => html`<th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase">${h}</th>`)}</tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  ${this._filtrados.length === 0
                    ? html`<tr><td colspan="4" class="px-6 py-12 text-center text-slate-400 text-sm">No se encontraron tutores</td></tr>`
                    : this._filtrados.map(t => html`
                      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                              ${t.nombre.charAt(0).toUpperCase()}</div>
                            <div><p class="font-semibold text-sm">${t.nombre}</p><p class="text-xs text-slate-400">${t.email}</p></div>
                          </div>
                        </td>
                        <td class="px-6 py-4">
                          <div class="flex flex-wrap gap-1">
                            ${(t.especialidades ?? []).slice(0, 3).map((e: string) => html`<span class="bg-primary/10 text-primary px-2 py-0.5 rounded text-[11px] font-semibold">${e}</span>`)}
                            ${(t.especialidades ?? []).length > 3 ? html`<span class="text-xs text-slate-400">+${t.especialidades.length - 3}</span>` : ''}
                          </div>
                        </td>
                        <td class="px-6 py-4">
                          <span class="px-2 py-0.5 rounded-full text-[11px] font-bold
                            ${t.estado === 'Activo' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}">
                            ${t.estado}</span>
                        </td>
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-1">
                            <button @click=${() => this._abrirEditar(t)} class="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"><span class="material-symbols-outlined text-lg">edit</span></button>
                            <button @click=${() => this._abrirEliminar(t)} class="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><span class="material-symbols-outlined text-lg">delete</span></button>
                          </div>
                        </td>
                      </tr>`)}
                </tbody>
              </table>
            </div>`}
        </div>
      </div>`;
  }
}
declare global { interface HTMLElementTagNameMap { 'admin-tutores': AdminTutores; } }
