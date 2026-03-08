import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getUsuario } from '../router';

/* ── Tipos ─────────────────────────────────────────────────────────────── */
type Franja = { dia: string; hora_inicio: string; hora_fin: string };
type Disponibilidad = { franjas: Franja[] };
type DatosDisp = {
  id: number;
  nombre: string;
  email: string;
  especialidades: string[];
  disponibilidad: Disponibilidad | null;
  estado: string;
};

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const HORAS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

const ASIGNATURAS_SUGERIDAS = [
  'Cálculo I', 'Cálculo II', 'Álgebra Lineal', 'Estadística',
  'Programación I', 'Programación II', 'Estructuras de Datos',
  'Bases de Datos', 'Física I', 'Física II',
  'Química General', 'Inglés Técnico', 'Economía', 'Contabilidad',
  'Redes', 'Sistemas Operativos', 'Inteligencia Artificial',
];

/* ── Componente ─────────────────────────────────────────────────────────── */
@customElement('tutor-disponibilidad')
export class TutorDisponibilidad extends LitElement {
  @state() private datos: DatosDisp | null = null;
  @state() private cargando = true;
  @state() private guardando = false;
  @state() private msg: { tipo: 'ok' | 'error'; texto: string } | null = null;

  // Estado local del formulario
  @state() private franjas: Franja[] = [];
  @state() private especialidades: string[] = [];

  // Formulario nueva franja
  @state() private nDia = 'Lunes';
  @state() private nInicio = '08:00';
  @state() private nFin = '10:00';

  // Formulario nueva especialidad
  @state() private nEsp = '';

  createRenderRoot() { return this; }

  connectedCallback() {
    super.connectedCallback();
    this._cargar();
  }

  /* ── API ──────────────────────────────────────────────────────────────── */
  private async _cargar() {
    this.cargando = true;
    try {
      const u = getUsuario();
      if (!u) return;
      const tutorId = (u as { perfil_id?: number | null }).perfil_id ?? u.id;
      const r = await fetch(`/api/disponibilidad?tutor_id=${tutorId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!r.ok) throw new Error(await r.text());
      this.datos = await r.json();
      this.franjas = this.datos?.disponibilidad?.franjas ?? [];
      this.especialidades = this.datos?.especialidades ?? [];
    } catch (e: unknown) {
      this._toast('error', `Error al cargar: ${(e as Error).message}`);
    } finally {
      this.cargando = false;
    }
  }

  private async _guardar() {
    this.guardando = true;
    this.msg = null;
    try {
      const u = getUsuario();
      if (!u) return;
      const tutorId = (u as { perfil_id?: number | null }).perfil_id ?? u.id;
      const r = await fetch(`/api/disponibilidad?tutor_id=${tutorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          disponibilidad: { franjas: this.franjas },
          especialidades: this.especialidades,
        }),
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error ?? 'Error desconocido');
      }
      this.datos = await r.json();
      this._toast('ok', '¡Configuración guardada correctamente!');
    } catch (e: unknown) {
      this._toast('error', `No se pudo guardar: ${(e as Error).message}`);
    } finally {
      this.guardando = false;
    }
  }

  /* ── Helpers franjas ──────────────────────────────────────────────────── */
  private _agregarFranja() {
    // Validación mínima: fin > inicio
    if (this.nInicio >= this.nFin) {
      this._toast('error', 'La hora de fin debe ser mayor a la de inicio.');
      return;
    }
    // Evitar duplicados en mismo día y solapamiento simple
    const solapado = this.franjas.some(f =>
      f.dia === this.nDia &&
      !(this.nFin <= f.hora_inicio || this.nInicio >= f.hora_fin)
    );
    if (solapado) {
      this._toast('error', 'Ya existe una franja que se solapa en ese día y horario.');
      return;
    }
    this.franjas = [...this.franjas, { dia: this.nDia, hora_inicio: this.nInicio, hora_fin: this.nFin }];
  }

  private _eliminarFranja(idx: number) {
    this.franjas = this.franjas.filter((_, i) => i !== idx);
  }

  /* ── Helpers especialidades ───────────────────────────────────────────── */
  private _agregarEsp(nombre: string) {
    const limpio = nombre.trim();
    if (!limpio || this.especialidades.includes(limpio)) return;
    this.especialidades = [...this.especialidades, limpio];
    this.nEsp = '';
  }

  private _eliminarEsp(nombre: string) {
    this.especialidades = this.especialidades.filter(e => e !== nombre);
  }

  /* ── Toast ────────────────────────────────────────────────────────────── */
  private _toast(tipo: 'ok' | 'error', texto: string) {
    this.msg = { tipo, texto };
    setTimeout(() => { this.msg = null; }, 4000);
  }

  /* ── Render ───────────────────────────────────────────────────────────── */
  render(): TemplateResult {
    if (this.cargando) return html`
      <div class="flex justify-center items-center py-24 text-slate-400">
        <span class="material-symbols-outlined animate-spin text-5xl">progress_activity</span>
      </div>`;

    /* Franjas agrupadas por día */
    const porDia = DIAS.reduce<Record<string, Franja[]>>((acc, d) => {
      acc[d] = this.franjas.filter(f => f.dia === d).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
      return acc;
    }, {});

    return html`
      <div class="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">

        <!-- ── Header ──────────────────────────────────────────────────── -->
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">manage_history</span>
              Disponibilidad &amp; Asignaturas
            </h2>
            <p class="text-slate-500 text-sm mt-1">
              Configura tus franjas horarias disponibles y las asignaturas que puedes cubrir.
            </p>
          </div>
          <button
            id="btn-guardar-disponibilidad"
            @click=${() => this._guardar()}
            ?disabled=${this.guardando}
            class="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold
                   hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
            ${this.guardando
              ? html`<span class="material-symbols-outlined animate-spin text-lg">progress_activity</span> Guardando...`
              : html`<span class="material-symbols-outlined text-lg">save</span> Guardar cambios`}
          </button>
        </div>

        <!-- ── Toast ───────────────────────────────────────────────────── -->
        ${this.msg ? html`
          <div class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                      ${this.msg.tipo === 'ok'
                        ? 'bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400'
                        : 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400'}">
            <span class="material-symbols-outlined text-lg">
              ${this.msg.tipo === 'ok' ? 'check_circle' : 'error'}
            </span>
            ${this.msg.texto}
          </div>` : ''}

        <!-- ═══════════════════════════════════════════════════════════════
             SECCIÓN 1 — FRANJAS HORARIAS
             ═══════════════════════════════════════════════════════════════ -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <!-- Cabecera sección -->
          <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div class="bg-primary/10 text-primary p-2 rounded-lg">
              <span class="material-symbols-outlined">schedule</span>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 dark:text-white">Franjas horarias disponibles</h3>
              <p class="text-xs text-slate-400 mt-0.5">
                ${this.franjas.length} franja${this.franjas.length !== 1 ? 's' : ''} registrada${this.franjas.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <!-- ── Formulario añadir franja ─────────────────────────────── -->
            <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Nueva franja</p>
              <div class="flex flex-col sm:flex-row gap-3 items-end">

                <!-- Día -->
                <div class="flex flex-col gap-1 flex-1 min-w-[130px]">
                  <label class="text-xs font-semibold text-slate-500">Día</label>
                  <select
                    .value=${this.nDia}
                    @change=${(e: Event) => { this.nDia = (e.target as HTMLSelectElement).value; }}
                    class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm
                           text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                    ${DIAS.map(d => html`<option .value=${d}>${d}</option>`)}
                  </select>
                </div>

                <!-- Hora inicio -->
                <div class="flex flex-col gap-1 flex-1 min-w-[110px]">
                  <label class="text-xs font-semibold text-slate-500">Desde</label>
                  <select
                    .value=${this.nInicio}
                    @change=${(e: Event) => { this.nInicio = (e.target as HTMLSelectElement).value; }}
                    class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm
                           text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                    ${HORAS.map(h => html`<option .value=${h}>${h}</option>`)}
                  </select>
                </div>

                <!-- Hora fin -->
                <div class="flex flex-col gap-1 flex-1 min-w-[110px]">
                  <label class="text-xs font-semibold text-slate-500">Hasta</label>
                  <select
                    .value=${this.nFin}
                    @change=${(e: Event) => { this.nFin = (e.target as HTMLSelectElement).value; }}
                    class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm
                           text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                    ${HORAS.map(h => html`<option .value=${h}>${h}</option>`)}
                  </select>
                </div>

                <!-- Botón añadir -->
                <button
                  id="btn-agregar-franja"
                  @click=${() => this._agregarFranja()}
                  class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold
                         hover:bg-primary/90 transition-all whitespace-nowrap flex-shrink-0">
                  <span class="material-symbols-outlined text-lg">add</span>
                  Añadir
                </button>
              </div>
            </div>

            <!-- ── Vista semanal ────────────────────────────────────────── -->
            ${this.franjas.length === 0 ? html`
              <div class="py-10 text-center text-slate-400">
                <span class="material-symbols-outlined text-4xl block mb-2">calendar_today</span>
                <p class="text-sm">No has registrado ninguna franja horaria aún.</p>
                <p class="text-xs mt-1">Usa el formulario de arriba para añadir tu disponibilidad.</p>
              </div>
            ` : html`
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                ${DIAS.filter(d => porDia[d].length > 0).map(dia => html`
                  <div class="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <!-- Cabecera día -->
                    <div class="bg-primary/10 px-3 py-2 border-b border-primary/20">
                      <p class="text-xs font-bold text-primary uppercase tracking-wider">${dia}</p>
                    </div>
                    <!-- Franjas del día -->
                    <div class="divide-y divide-slate-100 dark:divide-slate-800">
                      ${porDia[dia].map((f, gi) => {
                        const idx = this.franjas.indexOf(f);
                        return html`
                          <div class="flex items-center justify-between px-3 py-2.5
                                      hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                            <div class="flex items-center gap-2">
                              <span class="material-symbols-outlined text-primary text-sm">access_time</span>
                              <span class="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                ${f.hora_inicio} – ${f.hora_fin}
                              </span>
                            </div>
                            <button
                              id="btn-eliminar-franja-${gi}"
                              @click=${() => this._eliminarFranja(idx)}
                              class="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-red-400
                                     hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all"
                              title="Eliminar franja">
                              <span class="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        `;
                      })}
                    </div>
                  </div>
                `)}
              </div>

              <!-- Resumen total -->
              <div class="flex gap-4 flex-wrap mt-2">
                <div class="flex items-center gap-2 text-xs text-slate-500">
                  <span class="material-symbols-outlined text-primary text-sm">event_available</span>
                  <span><strong class="text-slate-800 dark:text-slate-200">${DIAS.filter(d => porDia[d].length > 0).length}</strong> días disponibles</span>
                </div>
                <div class="flex items-center gap-2 text-xs text-slate-500">
                  <span class="material-symbols-outlined text-primary text-sm">schedule</span>
                  <span><strong class="text-slate-800 dark:text-slate-200">${this.franjas.length}</strong> franjas en total</span>
                </div>
              </div>
            `}
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════
             SECCIÓN 2 — ASIGNATURAS / ESPECIALIDADES
             ═══════════════════════════════════════════════════════════════ -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <!-- Cabecera sección -->
          <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div class="bg-emerald-500/10 text-emerald-600 p-2 rounded-lg">
              <span class="material-symbols-outlined">menu_book</span>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 dark:text-white">Asignaturas / Especialidades</h3>
              <p class="text-xs text-slate-400 mt-0.5">
                ${this.especialidades.length} asignatura${this.especialidades.length !== 1 ? 's' : ''} registrada${this.especialidades.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div class="p-6 space-y-6">

            <!-- ── Formulario añadir especialidad ─────────────────────── -->
            <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Añadir asignatura</p>

              <!-- Input + botón -->
              <div class="flex gap-2">
                <input
                  id="input-nueva-especialidad"
                  type="text"
                  placeholder="Ej: Cálculo I, Programación…"
                  .value=${this.nEsp}
                  @input=${(e: Event) => { this.nEsp = (e.target as HTMLInputElement).value; }}
                  @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this._agregarEsp(this.nEsp); }}
                  class="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm
                         text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                <button
                  id="btn-agregar-especialidad"
                  @click=${() => this._agregarEsp(this.nEsp)}
                  class="flex items-center gap-1 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold
                         hover:bg-emerald-600 transition-all whitespace-nowrap">
                  <span class="material-symbols-outlined text-lg">add</span>
                  Añadir
                </button>
              </div>

              <!-- Sugerencias rápidas -->
              <div class="mt-3">
                <p class="text-xs text-slate-400 mb-2">Sugerencias rápidas:</p>
                <div class="flex gap-2 flex-wrap">
                  ${ASIGNATURAS_SUGERIDAS
                    .filter(a => !this.especialidades.includes(a))
                    .slice(0, 10)
                    .map(a => html`
                      <button
                        @click=${() => this._agregarEsp(a)}
                        class="px-2.5 py-1 text-xs font-medium rounded-full border border-slate-200 dark:border-slate-700
                               bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400
                               hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50
                               dark:hover:border-emerald-600 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/10
                               transition-all">
                        + ${a}
                      </button>
                    `)}
                </div>
              </div>
            </div>

            <!-- ── Lista de especialidades actuales ─────────────────────── -->
            ${this.especialidades.length === 0 ? html`
              <div class="py-10 text-center text-slate-400">
                <span class="material-symbols-outlined text-4xl block mb-2">school</span>
                <p class="text-sm">No has registrado ninguna asignatura aún.</p>
              </div>
            ` : html`
              <div class="flex flex-wrap gap-2">
                ${this.especialidades.map((esp, i) => html`
                  <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                              bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50
                              text-emerald-700 dark:text-emerald-400 group">
                    <span class="material-symbols-outlined text-sm">library_books</span>
                    <span class="text-sm font-semibold">${esp}</span>
                    <button
                      id="btn-eliminar-esp-${i}"
                      @click=${() => this._eliminarEsp(esp)}
                      class="ml-1 text-emerald-400 hover:text-red-500 transition-colors rounded-full
                             hover:bg-red-50 dark:hover:bg-red-900/20 p-0.5"
                      title="Eliminar ${esp}">
                      <span class="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                `)}
              </div>
            `}
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════
             SECCIÓN 3 — RESUMEN / ESTADO ACTUAL EN LA BD
             ═══════════════════════════════════════════════════════════════ -->
        ${this.datos ? html`
          <div class="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-sm">info</span>
              Estado guardado en la base de datos
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div class="flex flex-col gap-0.5">
                <span class="text-xs text-slate-400 font-medium">Franjas guardadas</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">
                  ${this.datos.disponibilidad?.franjas?.length ?? 0} franja(s)
                </span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-xs text-slate-400 font-medium">Asignaturas guardadas</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">
                  ${this.datos.especialidades?.length ?? 0} asignatura(s)
                </span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-xs text-slate-400 font-medium">Estado del perfil</span>
                <span class="font-bold ${this.datos.estado === 'Activo' ? 'text-green-600' : 'text-slate-500'}">
                  ${this.datos.estado}
                </span>
              </div>
            </div>
            <p class="text-xs text-slate-400 mt-3">
              💡 Pulsa <strong>Guardar cambios</strong> para persistir los cambios actuales en la base de datos.
            </p>
          </div>
        ` : ''}

      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'tutor-disponibilidad': TutorDisponibilidad; }
}
