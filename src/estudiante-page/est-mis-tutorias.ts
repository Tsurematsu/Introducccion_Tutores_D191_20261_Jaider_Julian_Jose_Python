import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getUsuario } from '../router';

type Tutoria = {
  id: number; asignatura: string; tema: string; estado: string;
  tutor_nombre: string | null; fecha_inscripcion: string;
  fecha_inicio: string | null; fecha_cierre: string | null;
  numero_sesiones: number; observaciones: string | null;
};

const ESTADO_BADGE: Record<string, string> = {
  INSCRITO:              'bg-slate-100    text-slate-600   dark:bg-slate-800    dark:text-slate-400',
  ASIGNADO:              'bg-blue-100     text-blue-700    dark:bg-blue-900/30  dark:text-blue-400',
  EN_DIAGNOSTICO:        'bg-yellow-100   text-yellow-700  dark:bg-yellow-900/30 dark:text-yellow-400',
  EN_SEGUIMIENTO_ACTIVO: 'bg-green-100    text-green-700   dark:bg-green-900/30 dark:text-green-400',
  DERIVADO:              'bg-purple-100   text-purple-700',
  PROCESO_ESPECIAL:      'bg-orange-100   text-orange-700',
  CANCELADO:             'bg-red-100      text-red-600     dark:bg-red-900/30   dark:text-red-400',
  APLAZADO:              'bg-amber-100    text-amber-700',
  COMPLETADO:            'bg-emerald-100  text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

@customElement('est-mis-tutorias')
export class EstMisTutorias extends LitElement {
  @state() private tutorias: Tutoria[] = [];
  @state() private cargando = true;
  @state() private filtro: 'todas' | 'activas' | 'completadas' = 'todas';

  createRenderRoot() { return this; }

  connectedCallback() {
    super.connectedCallback();
    this._cargar();
  }

  private async _cargar() {
    try {
      const u = getUsuario();
      if (!u) return;
      const r = await fetch(`/api/tutorias?estudiante_id=${u.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      this.tutorias = await r.json();
    } catch {/* silent */}
    finally { this.cargando = false; }
  }

  private get _filtradas() {
    switch (this.filtro) {
      case 'activas':     return this.tutorias.filter(t => !['CANCELADO', 'COMPLETADO'].includes(t.estado));
      case 'completadas': return this.tutorias.filter(t => ['COMPLETADO', 'CANCELADO'].includes(t.estado));
      default:            return this.tutorias;
    }
  }

  render(): TemplateResult {
    return html`
      <div class="px-6 lg:px-20 py-8">
        <div class="max-w-4xl mx-auto flex flex-col gap-6">

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-black text-slate-900 dark:text-slate-100">Mis Sesiones</h1>
              <p class="text-slate-500 text-sm mt-1">${this.tutorias.length} tutoría${this.tutorias.length !== 1 ? 's' : ''} en total</p>
            </div>
            <button class="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              <span class="material-symbols-outlined">add_circle</span>
              Solicitar tutoría
            </button>
          </div>

          <!-- Filtros -->
          <div class="flex gap-2 flex-wrap">
            ${(['todas', 'activas', 'completadas'] as const).map(f => html`
              <button
                @click=${() => { this.filtro = f; }}
                class="px-4 py-2 rounded-full text-sm font-semibold border transition-all capitalize
                       ${this.filtro === f
                         ? 'bg-primary text-white border-primary shadow-sm'
                         : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary'}">
                ${f}
              </button>
            `)}
          </div>

          <!-- Lista -->
          ${this.cargando ? html`
            <div class="flex justify-center py-16 text-slate-400">
              <span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            </div>
          ` : this._filtradas.length === 0 ? html`
            <div class="flex flex-col items-center gap-3 py-16 text-slate-400">
              <span class="material-symbols-outlined text-5xl">search_off</span>
              <p class="text-sm font-medium">No hay tutorías en esta categoría</p>
            </div>
          ` : html`
            <div class="flex flex-col gap-4">
              ${this._filtradas.map(t => html`
                <div class="group bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:shadow-md transition-all">
                  <div class="flex items-start justify-between flex-wrap gap-3">
                    <div class="flex flex-col gap-1 flex-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold ${ESTADO_BADGE[t.estado] ?? ''}">
                          ${t.estado.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p class="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">${t.asignatura}</p>
                      ${t.tema ? html`<p class="text-sm text-slate-500">${t.tema}</p>` : ''}
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                      <div class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <span class="material-symbols-outlined text-lg">school</span>
                      </div>
                    </div>
                  </div>

                  <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-base text-slate-400">person</span>
                      <span class="truncate">${t.tutor_nombre ?? 'Por asignar'}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-base text-slate-400">library_books</span>
                      <span>${t.numero_sesiones} sesion${t.numero_sesiones !== 1 ? 'es' : ''}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-base text-slate-400">calendar_today</span>
                      <span>${t.fecha_inscripcion ? new Date(t.fecha_inscripcion).toLocaleDateString('es-CO') : '—'}</span>
                    </div>
                  </div>

                  ${t.observaciones ? html`
                    <p class="mt-3 text-xs text-slate-400 italic border-t border-slate-100 dark:border-slate-800 pt-3">${t.observaciones}</p>
                  ` : ''}
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
  interface HTMLElementTagNameMap { 'est-mis-tutorias': EstMisTutorias; }
}
