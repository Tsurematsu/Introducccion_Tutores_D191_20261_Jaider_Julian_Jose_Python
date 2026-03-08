import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getUsuario } from '../router';

type Sesion = {
  id: number; fecha: string; estado_sesion: string;
  tutor_evaluacion_bases: boolean | null;
  tutor_evaluacion_comprension: boolean | null;
  observaciones: string | null; tutoria_id: number;
};

type Tutoria = { id: number; asignatura: string; estudiante_nombre: string };

@customElement('tutor-sesiones')
export class TutorSesiones extends LitElement {
  @state() private sesiones: Sesion[] = [];
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
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const rT = await fetch(`/api/tutorias?tutor_id=${u.id}`, { headers });
      this.tutorias = await rT.json();

      // Cargar sesiones de todas sus tutorías
      const allSesiones: Sesion[] = [];
      for (const t of this.tutorias) {
        const rS = await fetch(`/api/sesiones?tutoria_id=${t.id}`, { headers });
        const ses = await rS.json();
        allSesiones.push(...ses);
      }
      this.sesiones = allSesiones.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    } catch {/* silent */}
    finally { this.cargando = false; }
  }

  private _tituloTutoria(id: number) {
    return this.tutorias.find(t => t.id === id)?.asignatura ?? `Tutoría #${id}`;
  }

  private _estudianteTutoria(id: number) {
    return this.tutorias.find(t => t.id === id)?.estudiante_nombre ?? '—';
  }

  render(): TemplateResult {
    return html`
      <div class="p-6 lg:p-10 max-w-5xl mx-auto space-y-6">
        <div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white">Historial de Sesiones</h2>
          <p class="text-slate-500 text-sm mt-1">${this.sesiones.length} sesiones registradas</p>
        </div>

        ${this.cargando ? html`
          <div class="flex justify-center py-16 text-slate-400">
            <span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
          </div>
        ` : this.sesiones.length === 0 ? html`
          <div class="flex flex-col items-center gap-3 py-16 text-slate-400">
            <span class="material-symbols-outlined text-5xl">history</span>
            <p class="text-sm font-medium">No hay sesiones registradas aún</p>
          </div>
        ` : html`
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    ${['Fecha', 'Asignatura', 'Estudiante', 'Estado', 'Bases', 'Comprensión', 'Observaciones']
                      .map(h => html`<th class="px-5 py-4 text-xs font-bold text-slate-500 uppercase">${h}</th>`)}
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  ${this.sesiones.map(s => html`
                    <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                      <td class="px-5 py-4 text-sm font-medium">
                        ${s.fecha ? new Date(s.fecha).toLocaleDateString('es-CO') : '—'}
                      </td>
                      <td class="px-5 py-4 text-sm">${this._tituloTutoria(s.tutoria_id)}</td>
                      <td class="px-5 py-4 text-sm text-slate-500">${this._estudianteTutoria(s.tutoria_id)}</td>
                      <td class="px-5 py-4">
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
                          ${s.estado_sesion === 'Realizada'  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            s.estado_sesion === 'Cancelada'  ? 'bg-red-100 text-red-600' :
                                                               'bg-amber-100 text-amber-700'}">
                          <span class="material-symbols-outlined text-sm">
                            ${s.estado_sesion === 'Realizada' ? 'check_circle' : s.estado_sesion === 'Cancelada' ? 'cancel' : 'pause_circle'}
                          </span>
                          ${s.estado_sesion}
                        </span>
                      </td>
                      <td class="px-5 py-4 text-center">
                        ${s.tutor_evaluacion_bases === null ? html`<span class="text-slate-300">—</span>` :
                          s.tutor_evaluacion_bases ? html`<span class="text-green-600 material-symbols-outlined text-lg">check</span>` :
                          html`<span class="text-red-400 material-symbols-outlined text-lg">close</span>`}
                      </td>
                      <td class="px-5 py-4 text-center">
                        ${s.tutor_evaluacion_comprension === null ? html`<span class="text-slate-300">—</span>` :
                          s.tutor_evaluacion_comprension ? html`<span class="text-green-600 material-symbols-outlined text-lg">check</span>` :
                          html`<span class="text-red-400 material-symbols-outlined text-lg">close</span>`}
                      </td>
                      <td class="px-5 py-4 text-xs text-slate-400 max-w-[180px] truncate">
                        ${s.observaciones ?? '—'}
                      </td>
                    </tr>
                  `)}
                </tbody>
              </table>
            </div>
          </div>
        `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'tutor-sesiones': TutorSesiones; }
}
