import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getUsuario, logout } from '../router';
import './est-dashboard';
import './est-mis-tutorias';
import './est-tutores';
import './est-recursos';

type EstPage = 'dashboard' | 'tutorias' | 'tutores' | 'recursos';

const NAV: { id: EstPage; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard',    icon: 'dashboard'     },
  { id: 'tutorias',  label: 'Mis Sesiones', icon: 'calendar_month'},
  { id: 'tutores',   label: 'Tutores',      icon: 'person_search' },
  { id: 'recursos',  label: 'Recursos',     icon: 'menu_book'     },
];

@customElement('pagina-estudiante')
export class PaginaEstudiante extends LitElement {
  @state() private activePage: EstPage = 'dashboard';

  createRenderRoot() { return this; }

  private _setPage(id: EstPage) { this.activePage = id; }

  private _renderPage(): TemplateResult {
    switch (this.activePage) {
      case 'tutorias': return html`<est-mis-tutorias></est-mis-tutorias>`;
      case 'tutores':  return html`<est-tutores></est-tutores>`;
      case 'recursos': return html`<est-recursos></est-recursos>`;
      default:         return html`<est-dashboard @navigate=${(e: CustomEvent) => this._setPage(e.detail as EstPage)}></est-dashboard>`;
    }
  }

  render(): TemplateResult {
    const usuario = getUsuario();
    return html`
      <div class="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div class="flex h-full grow flex-col">

          <!-- ── Navbar ─────────────────────────────────────────────── -->
          <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 px-6 py-4 lg:px-20 bg-white dark:bg-background-dark/50 backdrop-blur-md sticky top-0 z-50">
            <div class="flex items-center gap-8">
              <!-- Logo -->
              <div class="flex items-center gap-3 text-primary">
                <div class="size-8 flex items-center justify-center rounded-lg bg-primary text-white">
                  <span class="material-symbols-outlined">auto_stories</span>
                </div>
                <span class="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight">EduTutor</span>
              </div>
              <!-- Nav links — desktop -->
              <nav class="hidden md:flex items-center gap-6">
                ${NAV.map(n => html`
                  <button
                    @click=${() => this._setPage(n.id)}
                    class="text-sm font-medium leading-normal transition-colors
                           ${this.activePage === n.id
                             ? 'text-primary font-semibold'
                             : 'text-slate-600 dark:text-slate-400 hover:text-primary'}">
                    ${n.label}
                  </button>
                `)}
              </nav>
            </div>

            <!-- Right side -->
            <div class="flex flex-1 justify-end gap-5 items-center">
              <!-- Search -->
              <label class="hidden sm:flex flex-col min-w-40 h-10 max-w-64">
                <div class="flex w-full flex-1 items-stretch rounded-lg h-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                  <div class="text-slate-400 flex items-center justify-center pl-3">
                    <span class="material-symbols-outlined text-xl">search</span>
                  </div>
                  <input
                    class="flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 text-sm placeholder:text-slate-400 outline-none px-2"
                    placeholder="Buscar tutoría..." />
                </div>
              </label>
              <!-- Notif + avatar -->
              <div class="flex items-center gap-3">
                <button class="relative text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                  <span class="material-symbols-outlined">notifications</span>
                  <span class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-background-dark"></span>
                </button>
                <!-- Avatar + nombre -->
                <div class="flex items-center gap-2">
                  <div class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                    ${(usuario?.nombre ?? 'E').charAt(0).toUpperCase()}
                  </div>
                  <span class="hidden md:block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    ${usuario?.nombre ?? 'Estudiante'}
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
            </div>
          </header>

          <!-- ── Contenido ──────────────────────────────────────────── -->
          <main class="flex-1 pb-20 md:pb-0">
            ${this._renderPage()}
          </main>

          <!-- ── Barra inferior mobile ──────────────────────────────── -->
          <div class="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-background-dark border-t border-slate-100 dark:border-slate-800 flex justify-around py-2 z-50">
            ${NAV.map(n => html`
              <button
                @click=${() => this._setPage(n.id)}
                class="flex flex-col items-center gap-0.5 px-4 py-1 transition-colors
                       ${this.activePage === n.id ? 'text-primary' : 'text-slate-400'}">
                <span class="material-symbols-outlined">${n.icon}</span>
                <span class="text-[10px] font-bold">${n.label}</span>
              </button>
            `)}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'pagina-estudiante': PaginaEstudiante; }
}
