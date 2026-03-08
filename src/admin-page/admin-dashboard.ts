import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';

const H = () => ({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });

@customElement('admin-dashboard')
export class AdminDashboard extends LitElement {
  @state() private nEstudiantes = '…';
  @state() private nTutores = '…';
  @state() private nTutorias = '…';
  @state() private nSesiones = '…';

  createRenderRoot() { return this; }

  connectedCallback() {
    super.connectedCallback();
    void this._cargar();
  }

  private async _cargar() {
    try {
      const [rE, rT, rTu] = await Promise.all([
        fetch('/api/estudiantes', { headers: H() }),
        fetch('/api/tutorias',   { headers: H() }),
        fetch('/api/tutores',    { headers: H() }),
      ]);
      const [estudiantes, tutorias, tutores] = await Promise.all([rE.json(), rT.json(), rTu.json()]);
      this.nEstudiantes = String(estudiantes.length);
      this.nTutores     = String(tutores.length);
      this.nTutorias    = String(tutorias.filter((t: { estado: string }) => !['CANCELADO', 'COMPLETADO'].includes(t.estado)).length);
      this.nSesiones    = String(tutorias.reduce((s: number, t: { numero_sesiones?: number }) => s + (t.numero_sesiones ?? 0), 0));
    } catch {/* silent */}
  }

  private _navigate(page: string) {
    this.dispatchEvent(new CustomEvent('navigate', { detail: page, bubbles: true, composed: true }));
  }

  render(): TemplateResult {
    return html`
      <div class="p-8 space-y-8 max-w-7xl mx-auto">

        <!-- Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${[
            { icon: 'group',          color: 'blue',   label: 'Total Estudiantes', value: this.nEstudiantes, badge: 'Ver registro', page: 'estudiantes' },
            { icon: 'person_pin',     color: 'indigo', label: 'Total Tutores',     value: this.nTutores,     badge: 'Ver registro', page: 'tutores'     },
            { icon: 'menu_book',      color: 'violet', label: 'Tutorías Activas',  value: this.nTutorias,    badge: 'Ver todas',    page: 'tutorias'    },
            { icon: 'library_books',  color: 'cyan',   label: 'Sesiones Totales',  value: this.nSesiones,    badge: 'Ver todo',     page: 'tutorias'    },
          ].map(c => html`
            <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between mb-4">
                <div class="w-10 h-10 rounded-lg bg-${c.color}-100 dark:bg-${c.color}-900/30 text-${c.color}-600 flex items-center justify-center">
                  <span class="material-symbols-outlined">${c.icon}</span>
                </div>
              </div>
              <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">${c.label}</p>
              <p class="text-3xl font-black mt-1 text-slate-900 dark:text-white">${c.value}</p>
              <button @click=${() => this._navigate(c.page)}
                class="mt-3 text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                ${c.badge} <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          `)}
        </div>

        <!-- Quick access + estado sistema -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-5">Accesos rápidos</h3>
            <div class="grid grid-cols-2 gap-3">
              ${[
                { icon: 'person_add',      label: 'Nuevo Estudiante', page: 'estudiantes', color: 'blue'   },
                { icon: 'manage_accounts', label: 'Nuevo Tutor',      page: 'tutores',     color: 'indigo' },
                { icon: 'add_task',        label: 'Nueva Tutoría',    page: 'tutorias',    color: 'violet' },
                { icon: 'event',           label: 'Scheduling',       page: 'scheduling',  color: 'cyan'   },
              ].map(a => html`
                <button @click=${() => this._navigate(a.page)}
                  class="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:bg-primary/5 transition-all group">
                  <div class="w-10 h-10 rounded-lg bg-${a.color}-100 dark:bg-${a.color}-900/20 text-${a.color}-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined">${a.icon}</span>
                  </div>
                  <span class="text-xs font-semibold text-slate-600 dark:text-slate-400 text-center">${a.label}</span>
                </button>`)}
            </div>
          </div>

          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-5">Estado del sistema</h3>
            <div class="space-y-4">
              ${[
                { label: 'Base de datos',        status: 'Operativo', color: 'green' },
                { label: 'API autenticación',    status: 'Operativo', color: 'green' },
                { label: 'Servicio notif.',      status: 'Pendiente', color: 'amber' },
              ].map(s => html`
                <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span class="text-sm font-medium text-slate-700 dark:text-slate-300">${s.label}</span>
                  <span class="flex items-center gap-1.5 text-xs font-semibold text-${s.color}-600">
                    <span class="w-2 h-2 rounded-full bg-${s.color}-500 ${s.color === 'green' ? 'animate-pulse' : ''}"></span>
                    ${s.status}
                  </span>
                </div>`)}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
declare global { interface HTMLElementTagNameMap { 'admin-dashboard': AdminDashboard; } }
