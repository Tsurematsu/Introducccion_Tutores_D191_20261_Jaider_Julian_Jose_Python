import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getUsuario } from '../router';

type Estudiante = { nombre: string; email: string; asignatura: string; estado: string; sesiones: number };

@customElement('tutor-estudiantes')
export class TutorEstudiantes extends LitElement {
  @state() private estudiantes: Estudiante[] = [];
  @state() private cargando = true;
  @state() private busqueda = '';

  createRenderRoot() { return this; }

  connectedCallback() {
    super.connectedCallback();
    this._cargar();
  }

  private async _cargar() {
    try {
      const u = getUsuario();
      if (!u) return;
      // perfil_id = id en tabla tutores (puede diferir de usuarios.id)
      const tutorId = (u as { perfil_id?: number | null }).perfil_id ?? u.id;
      const r = await fetch(`/api/tutorias?tutor_id=${tutorId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const tutorias = await r.json();
      // Mapear tutorías a lista de estudiantes única
      const map = new Map<string, Estudiante>();
      for (const t of tutorias) {
        const key = t.estudiante_email ?? t.estudiante_nombre;
        if (!map.has(key)) {
          map.set(key, {
            nombre: t.estudiante_nombre,
            email: t.estudiante_email ?? '—',
            asignatura: t.asignatura,
            estado: t.estado,
            sesiones: t.numero_sesiones ?? 0,
          });
        }
      }
      this.estudiantes = Array.from(map.values());
    } catch {/* silent */}
    finally { this.cargando = false; }
  }

  private get _filtrados() {
    const q = this.busqueda.toLowerCase();
    return q
      ? this.estudiantes.filter(e =>
          e.nombre.toLowerCase().includes(q) || e.asignatura.toLowerCase().includes(q))
      : this.estudiantes;
  }

  render(): TemplateResult {
    return html`
      <div class="p-6 lg:p-10 max-w-4xl mx-auto space-y-6">
        <div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white">Mis Estudiantes</h2>
          <p class="text-slate-500 text-sm mt-1">${this.estudiantes.length} estudiante${this.estudiantes.length !== 1 ? 's' : ''} asignado${this.estudiantes.length !== 1 ? 's' : ''}</p>
        </div>

        <div class="relative max-w-sm">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
          <input
            class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            placeholder="Buscar estudiante o asignatura..."
            .value=${this.busqueda}
            @input=${(e: InputEvent) => { this.busqueda = (e.target as HTMLInputElement).value; }}
          />
        </div>

        ${this.cargando ? html`
          <div class="flex justify-center py-16 text-slate-400">
            <span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
          </div>
        ` : this._filtrados.length === 0 ? html`
          <div class="flex flex-col items-center gap-3 py-16 text-slate-400">
            <span class="material-symbols-outlined text-5xl">group</span>
            <p class="text-sm font-medium">Sin estudiantes asignados aún</p>
          </div>
        ` : html`
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${this._filtrados.map(e => html`
              <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 hover:border-primary/30 hover:shadow-md transition-all">
                <div class="flex items-center gap-4 mb-4">
                  <div class="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center text-lg font-black flex-shrink-0">
                    ${e.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div class="overflow-hidden">
                    <p class="font-bold text-slate-900 dark:text-slate-100 truncate">${e.nombre}</p>
                    <p class="text-xs text-slate-400 truncate">${e.email}</p>
                  </div>
                </div>
                <div class="flex flex-col gap-1.5 text-sm">
                  <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span class="material-symbols-outlined text-base text-slate-400">menu_book</span>
                    <span class="font-medium">${e.asignatura}</span>
                  </div>
                  <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span class="material-symbols-outlined text-base text-slate-400">library_books</span>
                    <span>${e.sesiones} sesiones realizadas</span>
                  </div>
                </div>
                <div class="mt-4 flex items-center justify-between">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    ${e.estado.replace(/_/g, ' ')}
                  </span>
                  <button class="flex items-center gap-1 text-primary text-xs font-semibold hover:underline">
                    <span class="material-symbols-outlined text-sm">mail</span> Contactar
                  </button>
                </div>
              </div>
            `)}
          </div>
        `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'tutor-estudiantes': TutorEstudiantes; }
}
