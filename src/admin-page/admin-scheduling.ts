// src/admin-page/admin-scheduling.ts
import { LitElement, html, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('admin-scheduling')
export class AdminScheduling extends LitElement {
  createRenderRoot() { return this; }

  render(): TemplateResult {
    return html`
      <div class="p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white">Scheduling</h2>
          <p class="text-slate-500 text-sm mt-1">Gestión de franjas horarias y disponibilidad de tutores</p>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 flex flex-col items-center justify-center gap-4 text-center">
          <div class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <span class="material-symbols-outlined text-3xl">calendar_month</span>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Módulo en desarrollo</h3>
          <p class="text-slate-500 text-sm max-w-xs">
            El módulo de scheduling estará disponible próximamente. Permitirá gestionar
            franjas horarias y asignar sesiones automáticamente.
          </p>
          <button class="mt-2 flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <span class="material-symbols-outlined text-lg">notifications</span>
            Notificarme cuando esté listo
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'admin-scheduling': AdminScheduling; }
}
