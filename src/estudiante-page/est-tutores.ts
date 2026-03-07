import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';

type Tutor = { id: number; nombre: string; email: string; especialidades: string[]; estado: string };

@customElement('est-tutores')
export class EstTutores extends LitElement {
  @state() private tutores: Tutor[] = [];
  @state() private cargando = true;
  @state() private busqueda = '';

  createRenderRoot() { return this; }

  connectedCallback() {
    super.connectedCallback();
    this._cargar();
  }

  private async _cargar() {
    try {
      const r = await fetch('/api/tutores', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await r.json();
      this.tutores = Array.isArray(data) ? data.filter((t: Tutor) => t.estado === 'Activo') : [];
    } catch {/* silent */}
    finally { this.cargando = false; }
  }

  private get _filtrados() {
    const q = this.busqueda.toLowerCase();
    return q
      ? this.tutores.filter(t =>
          t.nombre.toLowerCase().includes(q) ||
          (t.especialidades ?? []).some((e: string) => e.toLowerCase().includes(q))
        )
      : this.tutores;
  }

  render(): TemplateResult {
    return html`
      <div class="px-6 lg:px-20 py-8">
        <div class="max-w-5xl mx-auto flex flex-col gap-6">

          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-slate-100">Tutores Disponibles</h1>
            <p class="text-slate-500 text-sm mt-1">${this.tutores.length} tutor${this.tutores.length !== 1 ? 'es' : ''} activo${this.tutores.length !== 1 ? 's' : ''}</p>
          </div>

          <!-- Búsqueda -->
          <div class="relative max-w-sm">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input
              class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Buscar por nombre o especialidad..."
              .value=${this.busqueda}
              @input=${(e: InputEvent) => { this.busqueda = (e.target as HTMLInputElement).value; }}
            />
          </div>

          <!-- Cards -->
          ${this.cargando ? html`
            <div class="flex justify-center py-16 text-slate-400">
              <span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            </div>
          ` : this._filtrados.length === 0 ? html`
            <div class="flex flex-col items-center gap-3 py-16 text-slate-400">
              <span class="material-symbols-outlined text-5xl">person_search</span>
              <p class="text-sm font-medium">No se encontraron tutores</p>
            </div>
          ` : html`
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              ${this._filtrados.map(t => html`
                <div class="group bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-primary/30 hover:shadow-md transition-all p-5 flex flex-col gap-4">
                  <!-- Avatar + info -->
                  <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center text-xl font-black flex-shrink-0">
                      ${t.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div class="overflow-hidden">
                      <p class="font-bold text-slate-900 dark:text-slate-100 truncate">${t.nombre}</p>
                      <p class="text-xs text-slate-400 truncate">${t.email}</p>
                    </div>
                  </div>
                  <!-- Especialidades -->
                  <div class="flex flex-wrap gap-1.5">
                    ${(t.especialidades ?? []).length === 0
                      ? html`<span class="text-xs text-slate-400 italic">Sin especialidades registradas</span>`
                      : (t.especialidades ?? []).slice(0, 4).map((esp: string) => html`
                          <span class="bg-primary/10 text-primary px-2 py-0.5 rounded text-[11px] font-semibold">${esp}</span>
                        `)}
                    ${(t.especialidades ?? []).length > 4
                      ? html`<span class="text-xs text-slate-400">+${t.especialidades.length - 4} más</span>`
                      : ''}
                  </div>
                  <!-- CTA -->
                  <button class="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all group-hover:bg-primary group-hover:text-white">
                    <span class="material-symbols-outlined text-lg">mail</span>
                    Contactar tutor
                  </button>
                </div>
              `)}
            </div>
          `}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'est-tutores': EstTutores; }
}
