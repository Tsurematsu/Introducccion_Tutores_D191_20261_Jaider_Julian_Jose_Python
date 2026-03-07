import { LitElement, html, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';

const RECURSOS = [
  {
    categoria: 'Guías de estudio',
    icon: 'auto_stories',
    color: 'blue',
    items: [
      { titulo: 'Guía de preparación para exámenes finales', tipo: 'PDF', fecha: 'Oct 2025' },
      { titulo: 'Técnicas de aprendizaje activo', tipo: 'PDF', fecha: 'Sep 2025' },
      { titulo: 'Cómo organizar tus sesiones de tutoría', tipo: 'Artículo', fecha: 'Sep 2025' },
    ],
  },
  {
    categoria: 'Videos tutoriales',
    icon: 'smart_display',
    color: 'red',
    items: [
      { titulo: 'Resolución de ecuaciones diferenciales (nivel básico)', tipo: 'Video', fecha: 'Oct 2025' },
      { titulo: 'Introducción a Python para ciencia de datos', tipo: 'Video', fecha: 'Sep 2025' },
    ],
  },
  {
    categoria: 'Plantillas y herramientas',
    icon: 'folder_open',
    color: 'amber',
    items: [
      { titulo: 'Plantilla de bitácora de sesión', tipo: 'DOCX', fecha: 'Ago 2025' },
      { titulo: 'Cronograma semanal de estudio', tipo: 'XLSX', fecha: 'Ago 2025' },
    ],
  },
];

const TIPO_ICON: Record<string, string> = {
  'PDF':      'picture_as_pdf',
  'Artículo': 'article',
  'Video':    'smart_display',
  'DOCX':     'description',
  'XLSX':     'table_chart',
};

const TIPO_COLOR: Record<string, string> = {
  'PDF':      'text-red-500',
  'Artículo': 'text-blue-500',
  'Video':    'text-purple-500',
  'DOCX':     'text-blue-600',
  'XLSX':     'text-green-600',
};

@customElement('est-recursos')
export class EstRecursos extends LitElement {
  createRenderRoot() { return this; }

  render(): TemplateResult {
    return html`
      <div class="px-6 lg:px-20 py-8">
        <div class="max-w-5xl mx-auto flex flex-col gap-8">

          <div>
            <h1 class="text-2xl font-black text-slate-900 dark:text-slate-100">Recursos de Estudio</h1>
            <p class="text-slate-500 text-sm mt-1">Materiales de apoyo para tus tutorías</p>
          </div>

          <!-- Banner destacado -->
          <div class="relative bg-gradient-to-br from-primary to-violet-600 text-white rounded-2xl p-8 overflow-hidden">
            <div class="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p class="text-white/70 text-sm font-medium uppercase tracking-wider mb-1">Nuevo recurso</p>
                <h3 class="text-xl font-black">Guía completa de exámenes finales 2025</h3>
                <p class="text-white/80 text-sm mt-1">Disponible ahora para todos los estudiantes.</p>
              </div>
              <button class="flex-shrink-0 bg-white text-primary font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors">
                Descargar gratis
              </button>
            </div>
            <div class="absolute -right-6 -top-6 opacity-10">
              <span class="material-symbols-outlined !text-[128px]">auto_awesome</span>
            </div>
          </div>

          <!-- Categorías -->
          ${RECURSOS.map(cat => html`
            <div class="flex flex-col gap-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-${cat.color}-100 dark:bg-${cat.color}-900/30 text-${cat.color}-600 flex items-center justify-center">
                  <span class="material-symbols-outlined">${cat.icon}</span>
                </div>
                <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">${cat.categoria}</h2>
                <span class="text-xs text-slate-400 font-medium">${cat.items.length} recursos</span>
              </div>

              <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                ${cat.items.map(item => html`
                  <div class="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <div class="${TIPO_COLOR[item.tipo] ?? 'text-slate-400'} flex-shrink-0">
                      <span class="material-symbols-outlined">${TIPO_ICON[item.tipo] ?? 'description'}</span>
                    </div>
                    <div class="flex-1 overflow-hidden">
                      <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-primary transition-colors">
                        ${item.titulo}
                      </p>
                      <p class="text-xs text-slate-400">${item.tipo} • ${item.fecha}</p>
                    </div>
                    <button class="flex-shrink-0 p-2 text-slate-400 hover:text-primary rounded-lg hover:bg-primary/10 transition-colors" title="Descargar">
                      <span class="material-symbols-outlined text-xl">download</span>
                    </button>
                  </div>
                `)}
              </div>
            </div>
          `)}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'est-recursos': EstRecursos; }
}
