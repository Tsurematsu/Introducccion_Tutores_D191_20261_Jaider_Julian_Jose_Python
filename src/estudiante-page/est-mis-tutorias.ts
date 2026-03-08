import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getUsuario } from '../router';

/* ── Tipos ─────────────────────────────────────────────────────────────── */
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
  PROCESO_ESPECIAL:      'bg-orange-100  text-orange-700',
  CANCELADO:             'bg-red-100      text-red-600     dark:bg-red-900/30   dark:text-red-400',
  APLAZADO:              'bg-amber-100    text-amber-700',
  COMPLETADO:            'bg-emerald-100  text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const ESTADO_ICON: Record<string, string> = {
  INSCRITO: 'hourglass_empty', ASIGNADO: 'person_check', EN_DIAGNOSTICO: 'manage_search',
  EN_SEGUIMIENTO_ACTIVO: 'trending_up', COMPLETADO: 'check_circle', CANCELADO: 'cancel', APLAZADO: 'pause_circle',
};

/* ── Componente ─────────────────────────────────────────────────────────── */
@customElement('est-mis-tutorias')
export class EstMisTutorias extends LitElement {
  @state() private tutorias: Tutoria[] = [];
  @state() private cargando = true;
  @state() private filtro: 'todas' | 'activas' | 'completadas' = 'todas';

  // Modal solicitar nueva tutoría
  @state() private modalAbierto = false;
  @state() private nAsignatura  = '';
  @state() private nTema        = '';
  @state() private nObs         = '';
  @state() private guardando    = false;

  // Feedback
  @state() private msg: { tipo: 'ok' | 'error'; texto: string } | null = null;

  createRenderRoot() { return this; }

  connectedCallback() { super.connectedCallback(); this._cargar(); }

  /* ── API ────────────────────────────────────────────────────────────── */
  private get _token() { return localStorage.getItem('token') ?? ''; }

  private async _cargar() {
    this.cargando = true;
    try {
      const u = getUsuario();
      if (!u) return;
      const r = await fetch(`/api/tutorias?estudiante_id=${u.id}`, {
        headers: { Authorization: `Bearer ${this._token}` },
      });
      const data = await r.json();
      this.tutorias = Array.isArray(data) ? data : [];
    } catch { /* silent */ }
    finally { this.cargando = false; }
  }

  private async _solicitar() {
    const u = getUsuario();
    if (!u || !this.nAsignatura.trim()) return;
    this.guardando = true;
    try {
      const r = await fetch('/api/tutorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this._token}` },
        body: JSON.stringify({
          estudiante_id: u.id,
          asignatura: this.nAsignatura.trim(),
          tema: this.nTema.trim() || null,
          observaciones: this.nObs.trim() || null,
        }),
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error ?? 'Error al solicitar');
      }
      this.modalAbierto = false;
      this.nAsignatura  = '';
      this.nTema        = '';
      this.nObs         = '';
      await this._cargar();
      this._toast('ok', '¡Solicitud de tutoría enviada! Te asignaremos un tutor pronto.');
    } catch (e: unknown) {
      this._toast('error', `No se pudo enviar: ${(e as Error).message}`);
    } finally {
      this.guardando = false;
    }
  }

  private _toast(tipo: 'ok' | 'error', texto: string) {
    this.msg = { tipo, texto };
    setTimeout(() => { this.msg = null; }, 5000);
  }

  private get _filtradas() {
    switch (this.filtro) {
      case 'activas':     return this.tutorias.filter(t => !['CANCELADO', 'COMPLETADO'].includes(t.estado));
      case 'completadas': return this.tutorias.filter(t => ['COMPLETADO', 'CANCELADO'].includes(t.estado));
      default:            return this.tutorias;
    }
  }

  /* ── Render: Modal solicitud ────────────────────────────────────────── */
  private _renderModal(): TemplateResult {
    if (!this.modalAbierto) return html``;
    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
           @click=${(e: Event) => { if (e.target === e.currentTarget) this.modalAbierto = false; }}>
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div class="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800
                    shadow-2xl w-full max-w-md overflow-hidden">

          <!-- Header -->
          <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 class="font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">add_circle</span>
                Solicitar nueva tutoría
              </h3>
              <p class="text-xs text-slate-400 mt-1">Se creará con estado INSCRITO y se asignará un tutor.</p>
            </div>
            <button @click=${() => { this.modalAbierto = false; }}
              class="text-slate-400 hover:text-slate-600 transition-colors p-1">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 space-y-4">

            <!-- Asignatura -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Asignatura *</label>
              <input type="text" placeholder="Ej: Cálculo I, Programación…"
                .value=${this.nAsignatura}
                @input=${(e: Event) => { this.nAsignatura = (e.target as HTMLInputElement).value; }}
                class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm
                       text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>

            <!-- Tema -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Tema específico <span class="font-normal normal-case">(opcional)</span></label>
              <input type="text" placeholder="Ej: Integrales por sustitución…"
                .value=${this.nTema}
                @input=${(e: Event) => { this.nTema = (e.target as HTMLInputElement).value; }}
                class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm
                       text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>

            <!-- Observaciones -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Observaciones <span class="font-normal normal-case">(opcional)</span></label>
              <textarea rows="3" placeholder="Describe qué necesitas…"
                .value=${this.nObs}
                @input=${(e: Event) => { this.nObs = (e.target as HTMLTextAreaElement).value; }}
                class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm
                       text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"></textarea>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button @click=${() => { this.modalAbierto = false; }}
              class="px-4 py-2.5 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400
                     border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              Cancelar
            </button>
            <button id="btn-enviar-solicitud"
              @click=${() => this._solicitar()}
              ?disabled=${this.guardando || !this.nAsignatura.trim()}
              class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-primary text-white
                     hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
              ${this.guardando
                ? html`<span class="material-symbols-outlined animate-spin text-lg">progress_activity</span> Enviando...`
                : html`<span class="material-symbols-outlined text-lg">send</span> Enviar solicitud`}
            </button>
          </div>
        </div>
      </div>`;
  }

  /* ── Render principal ───────────────────────────────────────────────── */
  render(): TemplateResult {
    const lista = this._filtradas;

    return html`
      ${this._renderModal()}

      <div class="px-6 lg:px-20 py-8">
        <div class="max-w-4xl mx-auto flex flex-col gap-6">

          <!-- Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-black text-slate-900 dark:text-slate-100">Mis Sesiones</h1>
              <p class="text-slate-500 text-sm mt-1">${this.tutorias.length} tutoría${this.tutorias.length !== 1 ? 's' : ''} en total</p>
            </div>
            <button id="btn-nueva-tutoria"
              @click=${() => { this.modalAbierto = true; }}
              class="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold
                     hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              <span class="material-symbols-outlined">add_circle</span>
              Solicitar tutoría
            </button>
          </div>

          <!-- Toast -->
          ${this.msg ? html`
            <div class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                        ${this.msg.tipo === 'ok'
                          ? 'bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400'
                          : 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400'}">
              <span class="material-symbols-outlined text-lg">${this.msg.tipo === 'ok' ? 'check_circle' : 'error'}</span>
              ${this.msg.texto}
            </div>` : ''}

          <!-- Filtros -->
          <div class="flex gap-2 flex-wrap">
            ${(['todas', 'activas', 'completadas'] as const).map(f => html`
              <button @click=${() => { this.filtro = f; }}
                class="px-4 py-2 rounded-full text-sm font-semibold border transition-all capitalize
                       ${this.filtro === f
                         ? 'bg-primary text-white border-primary shadow-sm'
                         : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary'}">
                ${f}
              </button>`)}
          </div>

          <!-- Lista tutorías -->
          ${this.cargando ? html`
            <div class="flex justify-center py-16 text-slate-400">
              <span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            </div>
          ` : lista.length === 0 ? html`
            <div class="flex flex-col items-center gap-4 py-16 text-slate-400">
              <span class="material-symbols-outlined text-6xl">school</span>
              <p class="text-base font-semibold">No hay tutorías en esta categoría</p>
              <button @click=${() => { this.modalAbierto = true; }}
                class="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                <span class="material-symbols-outlined">add_circle</span>
                Solicitar mi primera tutoría
              </button>
            </div>
          ` : html`
            <div class="flex flex-col gap-4">
              ${lista.map(t => html`
                <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800
                            hover:border-primary/30 hover:shadow-md transition-all">
                  <div class="flex items-start justify-between flex-wrap gap-3">
                    <div class="flex flex-col gap-1.5 flex-1 min-w-0">
                      <!-- Estado pill -->
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${ESTADO_BADGE[t.estado] ?? ''}">
                          <span class="material-symbols-outlined text-[13px]">${ESTADO_ICON[t.estado] ?? 'help'}</span>
                          ${t.estado.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <!-- Asignatura -->
                      <p class="text-lg font-black text-slate-900 dark:text-slate-100">${t.asignatura}</p>
                      ${t.tema ? html`<p class="text-sm text-slate-500 dark:text-slate-400">${t.tema}</p>` : ''}
                    </div>
                    <!-- Icono -->
                    <div class="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                      <span class="material-symbols-outlined">school</span>
                    </div>
                  </div>

                  <!-- Detalles -->
                  <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-base text-slate-400">person</span>
                      <span class="truncate font-medium">${t.tutor_nombre ?? 'Por asignar'}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-base text-slate-400">library_books</span>
                      <span>${t.numero_sesiones} sesión${t.numero_sesiones !== 1 ? 'es' : ''}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-base text-slate-400">calendar_today</span>
                      <span>${t.fecha_inscripcion ? new Date(t.fecha_inscripcion + 'T12:00:00').toLocaleDateString('es-CO') : '—'}</span>
                    </div>
                  </div>

                  ${t.observaciones ? html`
                    <p class="mt-3 text-xs text-slate-400 italic border-t border-slate-100 dark:border-slate-800 pt-3">
                      ${t.observaciones}
                    </p>` : ''}

                  <!-- Barra de progreso estado -->
                  <div class="mt-4">
                    <div class="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                      <span>Inscrito</span><span>Diagnóstico</span><span>Seguimiento</span><span>Completado</span>
                    </div>
                    <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                      <div class="bg-primary h-1.5 rounded-full transition-all" style="width: ${
                        t.estado === 'INSCRITO' ? '10%' :
                        t.estado === 'ASIGNADO' ? '25%' :
                        t.estado === 'EN_DIAGNOSTICO' ? '50%' :
                        t.estado === 'EN_SEGUIMIENTO_ACTIVO' ? '75%' :
                        t.estado === 'COMPLETADO' ? '100%' : '10%'
                      }"></div>
                    </div>
                  </div>
                </div>`)}
            </div>
          `}

        </div>
      </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'est-mis-tutorias': EstMisTutorias; }
}
