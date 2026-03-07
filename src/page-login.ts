import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { navigate, rutaPorRol, type Rol } from './router.js';

@customElement('page-login')
export class PageLogin extends LitElement {
  @property()
  name?: string = 'page-login';

  @state() private cargando = false;
  @state() private error = '';
  @state() private rolSeleccionado: 'Student' | 'Tutor' = 'Student';

  createRenderRoot() {
    return this; // Usa Light DOM en vez de Shadow DOM
  }

  private async _handleSubmit(e: Event) {
    e.preventDefault();
    this.error = '';
    this.cargando = true;

    const form = e.target as HTMLFormElement;
    const email = (form.querySelector('#email') as HTMLInputElement)?.value?.trim();
    const password = (form.querySelector('#password') as HTMLInputElement)?.value;

    if (!email || !password) {
      this.error = 'Por favor ingresa tu email y contraseña.';
      this.cargando = false;
      return;
    }

    try {
      const resp = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        this.error = data.error || 'Error al iniciar sesión.';
        this.cargando = false;
        return;
      }

      // Guardar JWT
      localStorage.setItem('token', data.token);

      // Redirigir según rol
      const ruta = rutaPorRol[data.rol as Rol] ?? '/login';
      navigate(ruta);
    } catch {
      this.error = 'No se pudo conectar con el servidor. Intenta más tarde.';
    } finally {
      this.cargando = false;
    }
  }

  private _handleRolChange(rol: 'Student' | 'Tutor') {
    this.rolSeleccionado = rol;
  }

  render(): TemplateResult {
    return html`
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
                rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap"
                rel="stylesheet" />
            <title>EduTutor - Iniciar Sesión</title>
            <div
                class="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center relative overflow-hidden">
                <!-- Decorative Background Elements -->
                <div class="absolute inset-0 z-0 opacity-10 pointer-events-none">
                    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]"></div>
                    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]"></div>
                </div>
                <!-- Main Container -->
                <div class="relative z-10 w-full max-w-md px-6 py-12">
                    <div
                        class="bg-white dark:bg-slate-900 shadow-xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <!-- Logo Section -->
                        <div class="pt-10 pb-6 flex flex-col items-center">
                            <div class="flex items-center gap-3 text-primary mb-2">
                                <div class="p-2 bg-primary/10 rounded-lg">
                                    <span class="material-symbols-outlined text-3xl font-bold">school</span>
                                </div>
                                <h1 class="text-2xl font-black tracking-tight">EduTutor</h1>
                            </div>
                            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Bienvenido de nuevo. Ingresa a tu cuenta.</p>
                        </div>
                        <!-- Role Selector -->
                        <div class="px-8 pb-4">
                            <div class="flex h-11 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                                <label
                                    class="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 ${this.rolSeleccionado === 'Student' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 dark:text-slate-400'} text-sm font-semibold transition-all"
                                    @click=${() => this._handleRolChange('Student')}>
                                    <span class="truncate">Estudiante</span>
                                    <input class="hidden" name="user_role" type="radio" value="Student"
                                        ?checked=${this.rolSeleccionado === 'Student'} />
                                </label>
                                <label
                                    class="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 ${this.rolSeleccionado === 'Tutor' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 dark:text-slate-400'} text-sm font-semibold transition-all"
                                    @click=${() => this._handleRolChange('Tutor')}>
                                    <span class="truncate">Tutor</span>
                                    <input class="hidden" name="user_role" type="radio" value="Tutor"
                                        ?checked=${this.rolSeleccionado === 'Tutor'} />
                                </label>
                            </div>
                        </div>
                        <!-- Form Section -->
                        <form class="px-8 pb-10 pt-4 space-y-5" @submit=${this._handleSubmit}>
                            <div class="space-y-1.5">
                                <label class="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1" for="email">Correo electrónico</label>
                                <div class="relative">
                                    <span
                                        class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                                    <input
                                        id="email"
                                        class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                        placeholder="nombre@ejemplo.com" type="email" autocomplete="email" required />
                                </div>
                            </div>
                            <div class="space-y-1.5">
                                <div class="flex justify-between items-center ml-1">
                                    <label class="text-sm font-semibold text-slate-700 dark:text-slate-300" for="password">Contraseña</label>
                                </div>
                                <div class="relative">
                                    <span
                                        class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                                    <input
                                        id="password"
                                        class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                        placeholder="••••••••" type="password" autocomplete="current-password" required />
                                </div>
                            </div>

                            <!-- Error message -->
                            ${this.error ? html`
                                <div class="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                                    <span class="material-symbols-outlined text-base">error</span>
                                    <span>${this.error}</span>
                                </div>
                            ` : ''}

                            <button
                                class="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                type="submit"
                                ?disabled=${this.cargando}>
                                ${this.cargando ? html`
                                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                    <span>Verificando...</span>
                                ` : html`
                                    <span>Ingresar al Dashboard</span>
                                    <span class="material-symbols-outlined text-lg">arrow_forward</span>
                                `}
                            </button>
                        </form>
                    </div>
                    <!-- Footer Links -->
                    <div class="mt-8 flex justify-center gap-6">
                        <a class="text-xs font-semibold text-slate-500 hover:text-primary transition-colors" href="#">Privacidad</a>
                        <a class="text-xs font-semibold text-slate-500 hover:text-primary transition-colors" href="#">Términos</a>
                        <a class="text-xs font-semibold text-slate-500 hover:text-primary transition-colors" href="#">Ayuda</a>
                    </div>
                </div>
            </div>
        `;
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'page-login': PageLogin;
  }
}