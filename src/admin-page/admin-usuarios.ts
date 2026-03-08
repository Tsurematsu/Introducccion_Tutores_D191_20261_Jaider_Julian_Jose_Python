import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';

type Usuario = { id: number; nombre: string; email: string; rol: string; creado_en: string };

const TOKEN = () => localStorage.getItem('token') ?? '';
const H = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN()}` });

const ROL_BADGE: Record<string, string> = {
  admin:      'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  tutor:      'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
  estudiante: 'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
};
const ROL_ICON: Record<string, string> = {
  admin: 'manage_accounts', tutor: 'person_pin', estudiante: 'school',
};

type FormData = {
  nombre: string; email: string; password: string; confirmar: string;
  rol: 'estudiante' | 'tutor' | 'admin';
  carrera: string; semestre: string; especialidades: string;
};

@customElement('admin-usuarios')
export class AdminUsuarios extends LitElement {
  @state() private usuarios: Usuario[] = [];
  @state() private cargando = true;
  @state() private busqueda = '';
  @state() private filtroRol = 'todos';
  @state() private modal: 'crear' | 'eliminar' | null = null;
  @state() private sel: Partial<Usuario> = {};
  @state() private form: FormData = { nombre: '', email: '', password: '', confirmar: '', rol: 'estudiante', carrera: '', semestre: '', especialidades: '' };
  @state() private guardando = false;
  @state() private toast = '';
  @state() private toastError = false;

  createRenderRoot() { return this; }
  connectedCallback() { super.connectedCallback(); this._cargar(); }

  private async _cargar() {
    this.cargando = true;
    try { const r = await fetch('/api/usuarios', { headers: H() }); this.usuarios = await r.json(); }
    catch {/* silent */} finally { this.cargando = false; }
  }

  private _toast(msg: string, error = false) {
    this.toast = msg; this.toastError = error;
    setTimeout(() => { this.toast = ''; }, 3000);
  }

  private async _crear() {
    const { nombre, email, password, confirmar, rol, carrera, semestre, especialidades } = this.form;
    if (!nombre || !email || !password) return this._toast('Completa los campos requeridos', true);
    if (password !== confirmar) return this._toast('Las contraseñas no coinciden', true);
    if (password.length < 6) return this._toast('La contraseña debe tener al menos 6 caracteres', true);

    this.guardando = true;
    try {
      const body: Record<string, unknown> = { nombre, email, password, rol };
      if (rol === 'estudiante' && carrera) body['carrera'] = carrera;
      if (rol === 'estudiante' && semestre)  body['semestre'] = Number(semestre);
      if (rol === 'tutor' && especialidades)
        body['especialidades'] = especialidades.split(',').map(s => s.trim()).filter(Boolean);

      const r = await fetch('/api/usuarios', { method: 'POST', headers: H(), body: JSON.stringify(body) });
      if (!r.ok) {
        const err = await r.json(); throw new Error(err.error ?? 'Error al crear');
      }
      this._toast(`Cuenta de ${rol} creada ✓`);
      this.modal = null;
      this.form = { nombre: '', email: '', password: '', confirmar: '', rol: 'estudiante', carrera: '', semestre: '', especialidades: '' };
      await this._cargar();
    } catch (e: unknown) { this._toast((e instanceof Error ? e.message : 'Error desconocido'), true); }
    finally { this.guardando = false; }
  }

  private async _eliminar() {
    this.guardando = true;
    try {
      const r = await fetch(`/api/usuarios?id=${this.sel.id}`, { method: 'DELETE', headers: H() });
      if (!r.ok) { const err = await r.json(); throw new Error(err.error ?? 'Error al eliminar'); }
      this._toast('Cuenta eliminada ✓');
      this.modal = null; await this._cargar();
    } catch (e: unknown) { this._toast((e instanceof Error ? e.message : 'Error desconocido'), true); }
    finally { this.guardando = false; }
  }

  private _setForm(k: keyof FormData, v: string) { this.form = { ...this.form, [k]: v }; }

  private get _filtrados() {
    return this.usuarios
      .filter(u => this.filtroRol === 'todos' || u.rol === this.filtroRol)
      .filter(u => { const q = this.busqueda.toLowerCase();
        return !q || u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q); });
  }

  private get _counts() {
    return {
      total:      this.usuarios.length,
      admin:      this.usuarios.filter(u => u.rol === 'admin').length,
      tutores:    this.usuarios.filter(u => u.rol === 'tutor').length,
      estudiantes: this.usuarios.filter(u => u.rol === 'estudiante').length,
    };
  }

  /* ── Modal crear cuenta ──────────────────────────────────── */
  private _modalCrear(): TemplateResult {
    const f = this.form;
    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-6">
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-5">

          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Nueva cuenta de usuario</h3>
              <p class="text-slate-400 text-xs mt-0.5">Se creará la cuenta de login y el perfil correspondiente</p>
            </div>
            <button @click=${() => { this.modal = null; }} class="text-slate-400 hover:text-red-500">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Rol selector -->
          <div class="grid grid-cols-3 gap-2">
            ${(['estudiante', 'tutor', 'admin'] as const).map(r => html`
              <button @click=${() => this._setForm('rol', r)}
                class="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all
                       ${f.rol === r ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/50'}">
                <span class="material-symbols-outlined text-2xl">${ROL_ICON[r]}</span>
                <span class="text-xs font-bold capitalize">${r}</span>
              </button>`)}
          </div>

          <!-- Campos comunes -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${[
              { k: 'nombre' as const,    label: 'Nombre completo', type: 'text',     span: 2, req: true  },
              { k: 'email' as const,     label: 'Email',           type: 'email',    span: 2, req: true  },
              { k: 'password' as const,  label: 'Contraseña',      type: 'password', span: 1, req: true  },
              { k: 'confirmar' as const, label: 'Confirmar',       type: 'password', span: 1, req: true  },
            ].map(field => html`
              <div class="flex flex-col gap-1 ${field.span === 2 ? 'sm:col-span-2' : ''}">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  ${field.label} ${field.req ? html`<span class="text-red-400">*</span>` : ''}
                </label>
                <input type=${field.type} .value=${f[field.k]}
                  @input=${(ev: InputEvent) => this._setForm(field.k, (ev.target as HTMLInputElement).value)}
                  class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"/>
              </div>`)}
          </div>

          <!-- Campos condicionales por rol -->
          ${f.rol === 'estudiante' ? html`
            <div class="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Perfil de estudiante (opcional)</p>
              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-bold text-slate-500 uppercase">Carrera</label>
                  <input type="text" .value=${f.carrera} placeholder="Ingeniería de Sistemas"
                    @input=${(ev: InputEvent) => this._setForm('carrera', (ev.target as HTMLInputElement).value)}
                    class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"/>
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-bold text-slate-500 uppercase">Semestre</label>
                  <input type="number" min="1" max="12" .value=${f.semestre}
                    @input=${(ev: InputEvent) => this._setForm('semestre', (ev.target as HTMLInputElement).value)}
                    class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"/>
                </div>
              </div>
            </div>` : ''}

          ${f.rol === 'tutor' ? html`
            <div class="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Perfil de tutor (opcional)</p>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-bold text-slate-500 uppercase">Especialidades <span class="font-normal normal-case">(separadas por coma)</span></label>
                <input type="text" .value=${f.especialidades} placeholder="Matemáticas, Física, Cálculo"
                  @input=${(ev: InputEvent) => this._setForm('especialidades', (ev.target as HTMLInputElement).value)}
                  class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"/>
              </div>
            </div>` : ''}

          <!-- Indicador fortaleza contraseña -->
          ${f.password.length > 0 ? html`
            <div class="flex items-center gap-2">
              ${[1,2,3,4].map(i => html`
                <div class="flex-1 h-1 rounded-full ${
                  f.password.length >= i * 3
                    ? (i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-blue-400' : 'bg-green-500')
                    : 'bg-slate-200 dark:bg-slate-700'
                }"></div>`)}
              <span class="text-xs text-slate-400 w-16">
                ${f.password.length < 4 ? 'Débil' : f.password.length < 7 ? 'Media' : f.password.length < 10 ? 'Buena' : 'Fuerte'}
              </span>
            </div>` : ''}

          <div class="flex gap-3 pt-2">
            <button @click=${() => { this.modal = null; }}
              class="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button @click=${this._crear} ?disabled=${this.guardando}
              class="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-60">
              ${this.guardando ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </div>
        </div>
      </div>`;
  }

  /* ── Modal eliminar ──────────────────────────────────────── */
  private _modalEliminar(): TemplateResult {
    const u = this.sel;
    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-5 text-center">
          <div class="w-14 h-14 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto">
            <span class="material-symbols-outlined text-3xl">person_remove</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">¿Eliminar cuenta?</h3>
            <p class="text-slate-500 text-sm mt-2">
              Se eliminará la cuenta de <strong>${u.nombre}</strong>
              <span class="text-xs opacity-70">(${u.email})</span>
              y su perfil de <strong>${u.rol}</strong> asociado.
            </p>
            <div class="mt-3 flex items-center justify-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
              <span class="material-symbols-outlined text-sm">warning</span>
              <span class="text-xs font-medium">Esta acción no se puede deshacer</span>
            </div>
          </div>
          <div class="flex gap-3">
            <button @click=${() => { this.modal = null; }}
              class="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button @click=${this._eliminar} ?disabled=${this.guardando}
              class="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-60">
              ${this.guardando ? 'Eliminando…' : 'Sí, eliminar'}
            </button>
          </div>
        </div>
      </div>`;
  }

  render(): TemplateResult {
    const c = this._counts;
    return html`
      ${this.toast ? html`
        <div class="fixed top-4 right-4 z-[60] ${this.toastError ? 'bg-red-600' : 'bg-slate-900'} text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <span class="material-symbols-outlined ${this.toastError ? '' : 'text-green-400'}">
            ${this.toastError ? 'error' : 'check_circle'}
          </span>${this.toast}
        </div>` : ''}
      ${this.modal === 'crear'    ? this._modalCrear()    : ''}
      ${this.modal === 'eliminar' ? this._modalEliminar() : ''}

      <div class="p-8 max-w-7xl mx-auto space-y-6">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black text-slate-900 dark:text-white">Gestión de Usuarios</h2>
            <p class="text-slate-500 text-sm mt-1">${c.total} cuentas registradas</p>
          </div>
          <button @click=${() => { this.modal = 'crear'; }}
            class="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <span class="material-symbols-outlined text-lg">person_add</span> Nueva cuenta
          </button>
        </div>

        <!-- Stats rápidos -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          ${[
            { label: 'Total',        value: c.total,       icon: 'group',          color: 'slate'  },
            { label: 'Admins',       value: c.admin,       icon: 'manage_accounts',color: 'violet' },
            { label: 'Tutores',      value: c.tutores,     icon: 'person_pin',     color: 'blue'   },
            { label: 'Estudiantes',  value: c.estudiantes, icon: 'school',         color: 'green'  },
          ].map(s => html`
            <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-${s.color}-100 dark:bg-${s.color}-900/30 text-${s.color}-600 flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined">${s.icon}</span>
              </div>
              <div>
                <p class="text-2xl font-black text-slate-900 dark:text-white">${s.value}</p>
                <p class="text-xs text-slate-400 font-medium">${s.label}</p>
              </div>
            </div>`)}
        </div>

        <!-- Filtros -->
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1 max-w-sm">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input
              class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Buscar por nombre o email..."
              .value=${this.busqueda}
              @input=${(e: InputEvent) => { this.busqueda = (e.target as HTMLInputElement).value; }}/>
          </div>
          <div class="flex items-center gap-2">
            ${(['todos', 'admin', 'tutor', 'estudiante'] as const).map(r => html`
              <button @click=${() => { this.filtroRol = r; }}
                class="px-3 py-2 rounded-full text-sm font-medium border transition-all capitalize
                       ${this.filtroRol === r ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary'}">
                ${r}
              </button>`)}
          </div>
        </div>

        <!-- Tabla -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          ${this.cargando ? html`
            <div class="flex justify-center py-16 text-slate-400">
              <span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            </div>
          ` : html`
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    ${['Usuario', 'Rol', 'Fecha de registro', 'Acciones'].map(h => html`
                      <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">${h}</th>`)}
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  ${this._filtrados.length === 0 ? html`
                    <tr><td colspan="4" class="px-6 py-12 text-center text-slate-400 text-sm">No se encontraron usuarios</td></tr>
                  ` : this._filtrados.map(u => html`
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full flex items-center justify-center text-base font-black flex-shrink-0
                            ${u.rol === 'admin' ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/30' :
                              u.rol === 'tutor' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                                                  'bg-green-100 text-green-600 dark:bg-green-900/30'}">
                            ${u.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p class="font-semibold text-sm text-slate-900 dark:text-white">${u.nombre}</p>
                            <p class="text-xs text-slate-400">${u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${ROL_BADGE[u.rol] ?? ''}">
                          <span class="material-symbols-outlined text-sm">${ROL_ICON[u.rol] ?? 'person'}</span>
                          ${u.rol}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-sm text-slate-500">
                        ${u.creado_en ? new Date(u.creado_en).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                      </td>
                      <td class="px-6 py-4">
                        <button
                          @click=${() => { this.sel = { ...u }; this.modal = 'eliminar'; }}
                          class="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Eliminar cuenta"
                          ?disabled=${u.rol === 'admin'}>
                          <span class="material-symbols-outlined text-lg">
                            ${u.rol === 'admin' ? 'lock' : 'person_remove'}
                          </span>
                        </button>
                      </td>
                    </tr>`)}
                </tbody>
              </table>
            </div>
          `}
        </div>

        <!-- Nota informativa -->
        <div class="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/40">
          <span class="material-symbols-outlined text-blue-500 flex-shrink-0 mt-0.5">info</span>
          <div class="text-sm text-blue-700 dark:text-blue-300">
            <strong>Flujo de registro:</strong> Al crear una cuenta de <em>estudiante</em> o <em>tutor</em>, se genera automáticamente
            el perfil correspondiente en la base de datos. Las cuentas de <em>admin</em> no tienen perfil asociado.
            Las cuentas de administrador <span class="font-semibold">no se pueden eliminar</span> desde aquí.
          </div>
        </div>
      </div>`;
  }
}

declare global { interface HTMLElementTagNameMap { 'admin-usuarios': AdminUsuarios; } }
