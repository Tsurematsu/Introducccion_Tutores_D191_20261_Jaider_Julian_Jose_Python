import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getUsuario, logout } from '../router';
import './tutor-overview';
import './tutor-schedule';
import './tutor-sesiones';
import './tutor-estudiantes';
import './tutor-settings';
import './tutor-disponibilidad';

type TutorPage = 'overview' | 'schedule' | 'sesiones' | 'estudiantes' | 'settings' | 'disponibilidad';

const SIDE_NAV: { id: TutorPage; label: string; icon: string }[] = [
  { id: 'overview',        label: 'Overview',            icon: 'grid_view'      },
  { id: 'schedule',        label: 'Mis Asignaciones',    icon: 'calendar_today' },
  { id: 'sesiones',        label: 'Historial Sesiones',  icon: 'history'        },
  { id: 'estudiantes',     label: 'Mis Estudiantes',     icon: 'group'          },
  { id: 'disponibilidad',  label: 'Disponibilidad',      icon: 'manage_history' },
  { id: 'settings',        label: 'Configuración',       icon: 'settings'       },
];

@customElement('pagina-tutor')
export class PaginaTutor extends LitElement {
  @state() private activePage: TutorPage = 'overview';

  createRenderRoot() { return this; }

  private _setPage(id: TutorPage) { this.activePage = id; }

  private _renderPage(): TemplateResult {
    switch (this.activePage) {
      case 'schedule':       return html`<tutor-schedule></tutor-schedule>`;
      case 'sesiones':       return html`<tutor-sesiones></tutor-sesiones>`;
      case 'estudiantes':    return html`<tutor-estudiantes></tutor-estudiantes>`;
      case 'disponibilidad': return html`<tutor-disponibilidad></tutor-disponibilidad>`;
      case 'settings':       return html`<tutor-settings></tutor-settings>`;
      default:               return html`<tutor-overview @navigate=${(e: CustomEvent) => this._setPage(e.detail as TutorPage)}></tutor-overview>`;
    }
  }

  render(): TemplateResult {
    const usuario = getUsuario();

    return html`
      <div class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
        <div class="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
          <div class="flex h-full grow flex-col">

            <!-- ── Navbar top ──────────────────────────────────────── -->
            <header class="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 lg:px-10 sticky top-0 z-50">
              <div class="flex items-center gap-8">
                <!-- Logo -->
                <div class="flex items-center gap-2 text-primary">
                  <span class="material-symbols-outlined text-3xl font-bold">school</span>
                  <h2 class="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">EduTutor</h2>
                </div>
                <!-- Nav links desktop -->
                <nav class="hidden md:flex items-center gap-6">
                  ${SIDE_NAV.slice(0, 4).map(n => html`
                    <button
                      @click=${() => this._setPage(n.id)}
                      class="text-sm font-medium transition-colors
                             ${this.activePage === n.id
                               ? 'text-primary font-semibold border-b-2 border-primary pb-0.5'
                               : 'text-slate-600 dark:text-slate-400 hover:text-primary'}">
                      ${n.label}
                    </button>
                  `)}
                </nav>
              </div>

              <!-- Right -->
              <div class="flex flex-1 justify-end gap-4 items-center">
                <label class="hidden sm:flex flex-col min-w-40 h-10 max-w-64">
                  <div class="flex w-full flex-1 items-stretch rounded-lg h-full bg-slate-100 dark:bg-slate-800">
                    <div class="text-slate-500 flex items-center justify-center pl-4">
                      <span class="material-symbols-outlined text-xl">search</span>
                    </div>
                    <input
                      class="flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 text-sm placeholder:text-slate-500 px-3 outline-none"
                      placeholder="Buscar sesiones..." />
                  </div>
                </label>
                <button class="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors relative">
                  <span class="material-symbols-outlined">notifications</span>
                  <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-900"></span>
                </button>
                <div class="flex items-center gap-2">
                  <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border-2 border-primary/20 flex-shrink-0">
                    ${(usuario?.nombre ?? 'T').charAt(0).toUpperCase()}
                  </div>
                  <span class="hidden md:block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    ${usuario?.nombre ?? 'Tutor'}
                  </span>
                </div>
                <button
                  @click=${() => logout()}
                  title="Cerrar sesión"
                  class="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <span class="material-symbols-outlined">logout</span>
                </button>
              </div>
            </header>

            <!-- ── Body: sidebar + contenido ──────────────────────── -->
            <main class="flex-1 flex flex-col lg:flex-row">

              <!-- Sidebar -->
              <aside class="w-full lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-8 flex-shrink-0">
                <!-- Profile -->
                <div class="flex items-center gap-3">
                  <div class="bg-primary/10 p-2 rounded-lg text-primary">
                    <span class="material-symbols-outlined">account_circle</span>
                  </div>
                  <div class="flex flex-col overflow-hidden">
                    <p class="text-slate-900 dark:text-white text-sm font-bold truncate">${usuario?.nombre ?? 'Tutor'}</p>
                    <p class="text-slate-500 text-xs">${usuario?.email ?? ''}</p>
                  </div>
                </div>

                <!-- Nav items -->
                <nav class="flex flex-col gap-1">
                  ${SIDE_NAV.map(n => html`
                    <button
                      @click=${() => this._setPage(n.id)}
                      class="flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm text-left w-full
                             ${this.activePage === n.id
                               ? 'bg-primary text-white font-semibold shadow-sm shadow-primary/20'
                               : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'}">
                      <span class="material-symbols-outlined text-xl">${n.icon}</span>
                      <span>${n.label}</span>
                    </button>
                  `)}
                </nav>

                <!-- Weekly goal widget -->
                <div class="mt-auto bg-primary/5 rounded-xl p-4 border border-primary/10">
                  <p class="text-xs text-primary font-bold uppercase tracking-wider mb-2">Meta semanal</p>
                  <div class="flex justify-between items-end mb-1">
                    <span class="text-2xl font-bold text-slate-900 dark:text-white">12/20</span>
                    <span class="text-xs text-slate-500">horas</span>
                  </div>
                  <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div class="bg-primary h-1.5 rounded-full transition-all" style="width: 60%"></div>
                  </div>
                  <p class="text-xs text-slate-400 mt-1.5">¡A 8 horas de tu meta!</p>
                </div>
              </aside>

              <!-- Contenido -->
              <div class="flex-1 overflow-y-auto">
                ${this._renderPage()}
              </div>
            </main>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'pagina-tutor': PaginaTutor; }
}
