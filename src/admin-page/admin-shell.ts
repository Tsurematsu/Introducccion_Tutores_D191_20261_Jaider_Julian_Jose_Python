import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getUsuario, logout } from '../router.ts';
import './admin-dashboard.ts';
import './admin-estudiantes.ts';
import './admin-tutores.ts';
import './admin-scheduling.ts';
import './admin-tutorias.ts';

type AdminPage = 'dashboard' | 'estudiantes' | 'tutores' | 'scheduling' | 'tutorias';

const NAV_ITEMS: { id: AdminPage; label: string; icon: string }[] = [
  { id: 'dashboard',    label: 'Dashboard',              icon: 'dashboard'     },
  { id: 'estudiantes',  label: 'Registro Estudiantes',   icon: 'group'         },
  { id: 'tutores',      label: 'Registro de Tutores',    icon: 'person_pin'    },
  { id: 'tutorias',     label: 'Tutorías',               icon: 'menu_book'     },
  { id: 'scheduling',   label: 'Scheduling',             icon: 'calendar_month'},
];

@customElement('pagina-admin')
export class PaginaAdmin extends LitElement {
  @state() private activePage: AdminPage = 'dashboard';

  createRenderRoot() { return this; }

  private _navItem(item: typeof NAV_ITEMS[0]): TemplateResult {
    const isActive = this.activePage === item.id;
    return html`
      <button
        @click=${() => { this.activePage = item.id; }}
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group text-left
               ${isActive
                 ? 'bg-primary/10 text-primary'
                 : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}"
      >
        <span class="material-symbols-outlined text-xl
                     ${isActive ? '' : 'text-slate-400 group-hover:text-primary transition-colors'}">
          ${item.icon}
        </span>
        <span class="text-sm ${isActive ? 'font-semibold' : 'font-medium'}">${item.label}</span>
        ${isActive ? html`<span class="ml-auto w-1.5 h-5 bg-primary rounded-full"></span>` : ''}
      </button>
    `;
  }

  private _renderPage(): TemplateResult {
    switch (this.activePage) {
      case 'estudiantes':  return html`<admin-estudiantes></admin-estudiantes>`;
      case 'tutores':      return html`<admin-tutores></admin-tutores>`;
      case 'tutorias':     return html`<admin-tutorias></admin-tutorias>`;
      case 'scheduling':   return html`<admin-scheduling></admin-scheduling>`;
      default:             return html`<admin-dashboard @navigate=${(e: CustomEvent) => { this.activePage = e.detail as AdminPage; }}></admin-dashboard>`;
    }
  }

  render(): TemplateResult {
    const usuario = getUsuario();
    return html`
      <div class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased flex h-screen overflow-hidden">

        <!-- ── Sidebar ─────────────────────────────────────────────── -->
        <aside class="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">

          <!-- Logo -->
          <div class="p-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
            <div class="bg-primary rounded-lg p-2 text-white shadow-lg shadow-primary/30">
              <span class="material-symbols-outlined text-2xl">school</span>
            </div>
            <div>
              <h1 class="font-bold text-slate-900 dark:text-white leading-none">EduTutor</h1>
              <p class="text-[11px] text-slate-400 mt-0.5 font-medium tracking-wide uppercase">Admin Panel</p>
            </div>
          </div>

          <!-- Nav items -->
          <nav class="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 pt-2 pb-1">Menú principal</p>
            ${NAV_ITEMS.map(item => this._navItem(item))}
          </nav>

          <!-- User info + logout -->
          <div class="p-4 border-t border-slate-200 dark:border-slate-800">
            <div class="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-lg">manage_accounts</span>
              </div>
              <div class="overflow-hidden flex-1">
                <p class="text-sm font-bold truncate text-slate-900 dark:text-white">
                  ${usuario?.nombre ?? 'Administrador'}
                </p>
                <p class="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Super Admin</p>
              </div>
              <button
                @click=${() => logout()}
                title="Cerrar sesión"
                class="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <span class="material-symbols-outlined text-xl">logout</span>
              </button>
            </div>
          </div>
        </aside>

        <!-- ── Contenido principal ──────────────────────────────────── -->
        <div class="flex-1 flex flex-col min-w-0 overflow-hidden">

          <!-- Header bar -->
          <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-14 flex items-center justify-between px-6 flex-shrink-0">
            <h2 class="font-bold text-slate-800 dark:text-white capitalize">
              ${NAV_ITEMS.find(n => n.id === this.activePage)?.label ?? 'Dashboard'}
            </h2>
            <div class="flex items-center gap-2">
              <button class="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative">
                <span class="material-symbols-outlined text-xl">notifications</span>
                <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>
              <button class="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <span class="material-symbols-outlined text-xl">settings</span>
              </button>
            </div>
          </header>

          <!-- Page content -->
          <main class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
            ${this._renderPage()}
          </main>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'pagina-admin': PaginaAdmin; }
}
