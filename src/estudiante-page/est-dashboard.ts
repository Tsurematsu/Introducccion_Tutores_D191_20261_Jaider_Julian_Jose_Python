import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getUsuario } from '../router';

type Tutoria = {
  id: number; asignatura: string; tema: string; estado: string;
  tutor_nombre: string | null; fecha_inscripcion: string; numero_sesiones: number;
};

@customElement('est-dashboard')
export class EstDashboard extends LitElement {
  @state() private tutorias: Tutoria[] = [];
  @state() private cargando = true;

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

  private _navigate(page: string) {
    this.dispatchEvent(new CustomEvent('navigate', { detail: page, bubbles: true, composed: true }));
  }

  private get _activas() {
    return this.tutorias.filter(t => !['CANCELADO', 'COMPLETADO', 'APLAZADO'].includes(t.estado));
  }

  render(): TemplateResult {
    const usuario = getUsuario();
    const nombre = usuario?.nombre?.split(' ')[0] ?? 'Estudiante';

    return html`
      <div class="px-6 lg:px-20 py-8">
        <div class="max-w-6xl mx-auto flex flex-col gap-8">

          <!-- Welcome header -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div class="flex flex-col gap-1">
              <h1 class="text-slate-900 dark:text-slate-100 text-3xl font-black tracking-tight">
                ¡Hola de nuevo, ${nombre}!
              </h1>
              <p class="text-slate-500 dark:text-slate-400 text-base">
                ${this.cargando ? 'Cargando tus tutorías...' :
                  this._activas.length
                    ? `Tienes ${this._activas.length} tutoría${this._activas.length > 1 ? 's' : ''} activa${this._activas.length > 1 ? 's' : ''}.`
                    : 'No tienes tutorías activas. ¡Inscríbete a una!'}
              </p>
            </div>
            <button
              @click=${() => this._navigate('tutorias')}
              class="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-bold">
              <span class="material-symbols-outlined">add_circle</span>
              <span>Inscribirse a Tutoría</span>
            </button>
          </div>

          <!-- Grid Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <!-- Main: tutorías activas -->
            <div class="lg:col-span-2 flex flex-col gap-6">
              <h2 class="text-slate-900 dark:text-slate-100 text-xl font-bold">Tutorías Activas</h2>

              ${this.cargando ? html`
                <div class="flex justify-center py-16 text-slate-400">
                  <span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
                </div>
              ` : this._activas.length === 0 ? html`
                <div class="flex flex-col items-center gap-4 py-16 text-center text-slate-400">
                  <span class="material-symbols-outlined text-5xl">menu_book</span>
                  <p class="text-sm font-medium">Aún no tienes tutorías activas</p>
                  <button @click=${() => this._navigate('tutorias')}
                    class="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                    Solicitar primera tutoría
                    <span class="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              ` : this._activas.map(t => html`
                <div class="group flex flex-col md:flex-row items-stretch justify-between gap-6 rounded-xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all">
                  <div class="flex flex-col justify-between gap-4 flex-1">
                    <div class="flex flex-col gap-2">
                      <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold w-fit uppercase tracking-wider
                                  ${t.estado === 'EN_SEGUIMIENTO_ACTIVO'
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}">
                        <span class="material-symbols-outlined text-sm">
                          ${t.estado === 'EN_SEGUIMIENTO_ACTIVO' ? 'schedule' : 'hourglass_empty'}
                        </span>
                        ${t.estado.replace(/_/g, ' ')}
                      </div>
                      <p class="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight">${t.asignatura}</p>
                      ${t.tema ? html`<p class="text-sm text-slate-500">${t.tema}</p>` : ''}
                      <div class="flex flex-col text-slate-500 dark:text-slate-400 text-sm gap-1">
                        <span class="flex items-center gap-1">
                          <span class="material-symbols-outlined text-base">person</span>
                          ${t.tutor_nombre ?? 'Sin tutor asignado'}
                        </span>
                        <span class="flex items-center gap-1">
                          <span class="material-symbols-outlined text-base">library_books</span>
                          ${t.numero_sesiones} sesione${t.numero_sesiones !== 1 ? 's' : ''} realizadas
                        </span>
                      </div>
                    </div>
                    <button
                      @click=${() => this._navigate('tutorias')}
                      class="flex items-center justify-center gap-2 rounded-lg h-10 px-5
                             ${t.estado === 'EN_SEGUIMIENTO_ACTIVO'
                               ? 'bg-primary text-white'
                               : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}
                             font-semibold w-fit text-sm">
                      <span class="material-symbols-outlined text-xl">
                        ${t.estado === 'EN_SEGUIMIENTO_ACTIVO' ? 'videocam' : 'info'}
                      </span>
                      ${t.estado === 'EN_SEGUIMIENTO_ACTIVO' ? 'Unirse a Sesión' : 'Ver Detalles'}
                    </button>
                  </div>
                  <div class="w-full md:w-48 bg-primary/5 dark:bg-primary/10 rounded-lg flex items-center justify-center">
                    <span class="material-symbols-outlined text-5xl text-primary/30">school</span>
                  </div>
                </div>
              `)}
            </div>

            <!-- Sidebar -->
            <div class="flex flex-col gap-8">
              <!-- Progreso -->
              <div class="bg-primary/5 dark:bg-primary/10 rounded-xl p-6 border border-primary/20">
                <h3 class="text-slate-900 dark:text-slate-100 font-bold mb-4">Progreso del Mes</h3>
                <div class="flex flex-col gap-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-slate-600 dark:text-slate-400 font-medium">Sesiones completadas</span>
                    <span class="text-sm font-bold text-primary">
                      ${this.tutorias.reduce((s, t) => s + (t.numero_sesiones ?? 0), 0)} sesiones
                    </span>
                  </div>
                  <div class="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                    <div class="bg-primary h-2 rounded-full transition-all" style="width: ${Math.min(100, (this.tutorias.reduce((s, t) => s + (t.numero_sesiones ?? 0), 0)) * 10)}%"></div>
                  </div>
                  <p class="text-xs text-slate-500">
                    ${this.tutorias.length} tutoría${this.tutorias.length !== 1 ? 's' : ''} registrada${this.tutorias.length !== 1 ? 's' : ''} en total.
                  </p>
                </div>
              </div>

              <!-- Quick actions -->
              <div class="flex flex-col gap-4">
                <h2 class="text-slate-900 dark:text-slate-100 text-lg font-bold">Accesos rápidos</h2>
                ${[
                  { icon: 'person_search', label: 'Buscar Tutores',  page: 'tutores'  },
                  { icon: 'menu_book',     label: 'Ver Recursos',    page: 'recursos'  },
                  { icon: 'calendar_month', label: 'Mis Sesiones',   page: 'tutorias' },
                ].map(a => html`
                  <button
                    @click=${() => this._navigate(a.page)}
                    class="flex items-center gap-4 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:bg-primary/5 transition-all group">
                    <div class="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span class="material-symbols-outlined">${a.icon}</span>
                    </div>
                    <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">${a.label}</span>
                    <span class="ml-auto material-symbols-outlined text-slate-400 text-lg">chevron_right</span>
                  </button>
                `)}
              </div>

              <!-- Promo card -->
              <div class="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden group">
                <div class="relative z-10">
                  <h4 class="font-bold text-lg mb-2">Recursos disponibles</h4>
                  <p class="text-slate-400 text-sm mb-4">Guías de estudio y materiales de preparación para tus exámenes.</p>
                  <button
                    @click=${() => this._navigate('recursos')}
                    class="text-white bg-primary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-tight">
                    Acceder ahora
                  </button>
                </div>
                <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                  <span class="material-symbols-outlined !text-9xl">auto_awesome</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'est-dashboard': EstDashboard; }
}
