import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';

type Tutoria = {
  id: number; asignatura: string; tema: string; estado: string;
  estudiante_nombre: string; tutor_nombre: string | null; tutor_id: number | null;
  estudiante_id: number; fecha_inscripcion: string; numero_sesiones: number; observaciones: string | null;
};
type Tutor = { id: number; nombre: string };

const ESTADOS = ['INSCRITO','ASIGNADO','EN_DIAGNOSTICO','EN_SEGUIMIENTO_ACTIVO','DERIVADO','PROCESO_ESPECIAL','CANCELADO','APLAZADO','COMPLETADO'];
const ESTADO_COLORS: Record<string, string> = {
  INSCRITO:              'bg-slate-100    text-slate-600',
  ASIGNADO:              'bg-blue-100     text-blue-700',
  EN_DIAGNOSTICO:        'bg-yellow-100   text-yellow-700',
  EN_SEGUIMIENTO_ACTIVO: 'bg-green-100    text-green-700',
  DERIVADO:              'bg-purple-100   text-purple-700',
  PROCESO_ESPECIAL:      'bg-orange-100   text-orange-700',
  CANCELADO:             'bg-red-100      text-red-600',
  APLAZADO:              'bg-amber-100    text-amber-700',
  COMPLETADO:            'bg-emerald-100  text-emerald-700',
};
const TOKEN = () => localStorage.getItem('token') ?? '';
const H = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` });

@customElement('admin-tutorias')
export class AdminTutorias extends LitElement {
  @state() private tutorias: Tutoria[] = [];
  @state() private tutores: Tutor[] = [];
  @state() private cargando = true;
  @state() private busqueda = '';
  @state() private filtroEstado = 'TODOS';
  @state() private modal: 'crear' | 'editar' | 'eliminar' | null = null;
  @state() private sel: Partial<Tutoria> = {};
  @state() private guardando = false;
  @state() private toast = '';

  createRenderRoot() { return this; }

  connectedCallback() {
    super.connectedCallback();
    void Promise.all([this._cargar(), this._cargarTutores()]);
  }

  private async _cargar() {
    this.cargando = true;
    try { const r = await fetch('/api/tutorias', { headers: H() }); this.tutorias = await r.json(); }
    catch {/* silent */} finally { this.cargando = false; }
  }

  private async _cargarTutores() {
    try { const r = await fetch('/api/tutores', { headers: H() }); this.tutores = (await r.json() as Tutor[]).filter((t: Tutor & { estado?: string }) => t.estado !== 'Inactivo'); }
    catch {/* silent */}
  }

  private _toast(msg: string) { this.toast = msg; setTimeout(() => { this.toast = ''; }, 3000); }

  private async _guardar() {
    this.guardando = true;
    try {
      const { id, estudiante_nombre: _en, tutor_nombre: _tn, estudiante_carrera: _ec, estudiante_email: _ee, tutor_email: _te, ...body } = this.sel as Tutoria & Record<string, unknown>;
      const r = await fetch(id ? `/api/tutorias?id=${id}` : '/api/tutorias',
        { method: id ? 'PUT' : 'POST', headers: H(), body: JSON.stringify(body) });
      if (!r.ok) throw new Error(await r.text());
      this._toast(id ? 'Tutoría actualizada ✓' : 'Tutoría creada ✓');
      this.modal = null; await this._cargar();
    } catch (e: unknown) { this._toast('Error: ' + (e instanceof Error ? e.message : 'desconocido')); }
    finally { this.guardando = false; }
  }

  private async _eliminar() {
    this.guardando = true;
    try {
      const r = await fetch(`/api/tutorias?id=${this.sel.id}`, { method: 'DELETE', headers: H() });
      if (!r.ok) throw new Error(await r.text());
      this._toast('Tutoría eliminada ✓'); this.modal = null; await this._cargar();
    } catch (e: unknown) { this._toast('Error: ' + (e instanceof Error ? e.message : 'desconocido')); }
    finally { this.guardando = false; }
  }

  private _set(k: string, v: string | number | null) { this.sel = { ...this.sel, [k]: v } as Partial<Tutoria>; }
  private _abrirCrear() { this.sel = { estado: 'INSCRITO' }; this.modal = 'crear'; }
  private _abrirEditar(t: Tutoria) { this.sel = { ...t }; this.modal = 'editar'; }
  private _abrirEliminar(t: Tutoria) { this.sel = { ...t }; this.modal = 'eliminar'; }

  private get _filtrados() {
    return this.tutorias
      .filter(t => this.filtroEstado === 'TODOS' || t.estado === this.filtroEstado)
      .filter(t => { const q = this.busqueda.toLowerCase();
        return !q || t.asignatura.toLowerCase().includes(q) ||
          (t.estudiante_nombre ?? '').toLowerCase().includes(q) ||
          (t.tutor_nombre ?? '').toLowerCase().includes(q); });
  }

  private _modal(): TemplateResult {
    const s = this.sel; const esE = this.modal === 'editar';
    if (this.modal === 'eliminar') return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-5 text-center">
          <div class="w-14 h-14 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto">
            <span class="material-symbols-outlined text-3xl">delete_forever</span>
          </div>
          <div><h3 class="text-lg font-bold">¿Eliminar tutoría?</h3>
            <p class="text-slate-500 text-sm mt-1">Se eliminará <strong>${s.asignatura}</strong> y todas sus sesiones.</p></div>
          <div class="flex gap-3">
            <button @click=${() => { this.modal = null; }} class="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button @click=${this._eliminar} ?disabled=${this.guardando} class="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-bold disabled:opacity-60">
              ${this.guardando ? 'Eliminando…' : 'Sí, eliminar'}</button>
          </div>
        </div>
      </div>`;

    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8">
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold">${esE ? 'Editar Tutoría' : 'Nueva Tutoría'}</h3>
            <button @click=${() => { this.modal = null; }} class="text-slate-400 hover:text-red-500"><span class="material-symbols-outlined">close</span></button>
          </div>
          <div class="space-y-4">
            ${!esE ? html`
              <div class="flex flex-col gap-1">
                <label class="text-xs font-bold text-slate-500 uppercase">ID Estudiante <span class="text-red-400">*</span></label>
                <input type="number" .value=${String(s.estudiante_id ?? '')}
                  @input=${(ev: InputEvent) => this._set('estudiante_id', Number((ev.target as HTMLInputElement).value))}
                  class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"/>
              </div>` : ''}
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-slate-500 uppercase">Asignatura <span class="text-red-400">*</span></label>
              <input type="text" .value=${s.asignatura ?? ''}
                @input=${(ev: InputEvent) => this._set('asignatura', (ev.target as HTMLInputElement).value)}
                class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"/>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-slate-500 uppercase">Tema</label>
              <input type="text" .value=${s.tema ?? ''}
                @input=${(ev: InputEvent) => this._set('tema', (ev.target as HTMLInputElement).value)}
                class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"/>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-slate-500 uppercase">Asignar Tutor</label>
              <select @change=${(ev: Event) => this._set('tutor_id', Number((ev.target as HTMLSelectElement).value) || null)}
                class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">— Sin asignar —</option>
                ${this.tutores.map(t => html`<option value=${t.id} .selected=${s.tutor_id === t.id}>${t.nombre}</option>`)}
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-slate-500 uppercase">Estado</label>
              <select @change=${(ev: Event) => this._set('estado', (ev.target as HTMLSelectElement).value)}
                class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                ${ESTADOS.map(e => html`<option value=${e} .selected=${s.estado === e}>${e.replace(/_/g, ' ')}</option>`)}
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs font-bold text-slate-500 uppercase">Observaciones</label>
              <textarea rows="3" .value=${s.observaciones ?? ''}
                @input=${(ev: InputEvent) => this._set('observaciones', (ev.target as HTMLTextAreaElement).value)}
                class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"></textarea>
            </div>
          </div>
          <div class="flex gap-3 pt-2">
            <button @click=${() => { this.modal = null; }} class="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancelar</button>
            <button @click=${this._guardar} ?disabled=${this.guardando}
              class="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-60">
              ${this.guardando ? 'Guardando…' : (esE ? 'Guardar cambios' : 'Crear tutoría')}</button>
          </div>
        </div>
      </div>`;
  }

  render(): TemplateResult {
    const estadosFiltro = ['TODOS', 'INSCRITO', 'ASIGNADO', 'EN_DIAGNOSTICO', 'EN_SEGUIMIENTO_ACTIVO', 'COMPLETADO', 'CANCELADO'];
    return html`
      ${this.toast ? html`<div class="fixed top-4 right-4 z-[60] bg-slate-900 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
        <span class="material-symbols-outlined text-green-400">check_circle</span>${this.toast}</div>` : ''}
      ${this.modal ? this._modal() : ''}
      <div class="p-8 max-w-7xl mx-auto space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white">Tutorías</h2>
            <p class="text-slate-500 text-sm mt-1">${this.tutorias.length} tutorías en total</p>
          </div>
          <button @click=${this._abrirCrear}
            class="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20">
            <span class="material-symbols-outlined text-lg">add</span> Nueva Tutoría
          </button>
        </div>
        <div class="flex flex-col gap-3">
          <div class="relative max-w-sm">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Buscar por asignatura, estudiante o tutor..."
              .value=${this.busqueda} @input=${(e: InputEvent) => { this.busqueda = (e.target as HTMLInputElement).value; }}/>
          </div>
          <div class="flex flex-wrap gap-2">
            ${estadosFiltro.map(est => html`
              <button @click=${() => { this.filtroEstado = est; }}
                class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                  ${this.filtroEstado === est ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary'}">
                ${est.replace(/_/g, ' ')}</button>`)}
          </div>
        </div>
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          ${this.cargando ? html`<div class="flex justify-center py-16 text-slate-400"><span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span></div>` : html`
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>${['Asignatura', 'Estudiante', 'Tutor', 'Estado', 'Sesiones', 'Fecha', 'Acciones'].map(h => html`
                  <th class="px-5 py-4 text-xs font-bold text-slate-500 uppercase">${h}</th>`)}</tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                ${this._filtrados.length === 0 ? html`<tr><td colspan="7" class="px-6 py-12 text-center text-slate-400 text-sm">No se encontraron tutorías</td></tr>`
                : this._filtrados.map(t => html`
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td class="px-5 py-4">
                      <p class="font-semibold text-sm">${t.asignatura}</p>
                      ${t.tema ? html`<p class="text-xs text-slate-400">${t.tema}</p>` : ''}
                    </td>
                    <td class="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">${t.estudiante_nombre ?? '—'}</td>
                    <td class="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                      ${t.tutor_nombre ?? html`<span class="text-amber-500 text-xs font-medium">Sin asignar</span>`}
                    </td>
                    <td class="px-5 py-4">
                      <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${ESTADO_COLORS[t.estado] ?? ''}">
                        ${t.estado.replace(/_/g, ' ')}</span>
                    </td>
                    <td class="px-5 py-4 text-sm font-bold text-center">${t.numero_sesiones ?? 0}</td>
                    <td class="px-5 py-4 text-xs text-slate-400">
                      ${t.fecha_inscripcion ? new Date(t.fecha_inscripcion).toLocaleDateString('es-CO') : '—'}
                    </td>
                    <td class="px-5 py-4">
                      <div class="flex items-center gap-1">
                        <button @click=${() => this._abrirEditar(t)} class="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-primary/10 transition-colors">
                          <span class="material-symbols-outlined text-lg">edit</span></button>
                        <button @click=${() => this._abrirEliminar(t)} class="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <span class="material-symbols-outlined text-lg">delete</span></button>
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
declare global { interface HTMLElementTagNameMap { 'admin-tutorias': AdminTutorias; } }
