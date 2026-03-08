import { LitElement, html, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { getUsuario } from '../router';

@customElement('tutor-settings')
export class TutorSettings extends LitElement {
  createRenderRoot() { return this; }

  render(): TemplateResult {
    const u = getUsuario();
    return html`
      <div class="p-6 lg:p-10 max-w-2xl mx-auto space-y-8">
        <div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white">Configuración</h2>
          <p class="text-slate-500 text-sm mt-1">Gestiona tu perfil y preferencias</p>
        </div>

        <!-- Perfil -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
          <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">manage_accounts</span>
            Información de perfil
          </h3>
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-black flex-shrink-0">
              ${(u?.nombre ?? 'T').charAt(0).toUpperCase()}
            </div>
            <div>
              <p class="font-bold text-slate-900 dark:text-white">${u?.nombre ?? '—'}</p>
              <p class="text-sm text-slate-500">${u?.email ?? '—'}</p>
              <span class="inline-block mt-1 text-xs font-bold uppercase tracking-wide px-2 py-0.5 bg-primary/10 text-primary rounded-full">Tutor</span>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${[
              { label: 'Nombre completo', value: u?.nombre ?? '', icon: 'person'    },
              { label: 'Email',           value: u?.email  ?? '', icon: 'mail'      },
            ].map(f => html`
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">${f.icon}</span>${f.label}
                </label>
                <input
                  .value=${f.value}
                  class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  readonly
                />
              </div>
            `)}
          </div>
          <button class="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <span class="material-symbols-outlined text-lg">save</span>
            Guardar cambios
          </button>
        </div>

        <!-- Disponibilidad -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">schedule</span>
            Disponibilidad horaria
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            ${['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(d => html`
              <div class="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">${d}</span>
                <button class="relative w-9 h-5 bg-slate-300 dark:bg-slate-700 rounded-full transition-colors hover:bg-primary/70"
                  title="Activar ${d}">
                  <span class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"></span>
                </button>
              </div>
            `)}
          </div>
        </div>

        <!-- Notificaciones -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <h3 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">notifications</span>
            Notificaciones
          </h3>
          ${[
            { label: 'Nueva solicitud de tutoría', desc: 'Cuando un estudiante solicite una sesión' },
            { label: 'Recordatorio de sesión',     desc: '30 minutos antes de cada sesión'          },
          ].map(n => html`
            <div class="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">${n.label}</p>
                <p class="text-xs text-slate-400">${n.desc}</p>
              </div>
              <button class="relative w-11 h-6 bg-primary rounded-full transition-colors">
                <span class="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"></span>
              </button>
            </div>
          `)}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'tutor-settings': TutorSettings; }
}
