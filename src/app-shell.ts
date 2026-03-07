import { LitElement, html, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getRutaActual, guardarRuta, type Route } from './router.js';
import './page-login.js';
import './pagina-estudiante.js';
import './pagina-tutor.js';
import './pagina-admin.js';

/**
 * app-shell — Componente raíz que actúa como router de la SPA.
 * Escucha cambios de hash y renderiza el componente correspondiente.
 */
@customElement('app-shell')
export class AppShell extends LitElement {
  @state() private rutaActual: Route = '/login';

  createRenderRoot() {
    return this; // Light DOM para que TailwindCSS funcione
  }

  connectedCallback() {
    super.connectedCallback();
    this._actualizarRuta();
    window.addEventListener('hashchange', this._onHashChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this._onHashChange);
  }

  private _onHashChange = () => {
    this._actualizarRuta();
  };

  private _actualizarRuta() {
    const ruta = getRutaActual();
    // Inicializar hash si está vacío
    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = '/login';
      return;
    }
    // Aplicar guard de autenticación
    if (guardarRuta(ruta)) {
      this.rutaActual = ruta;
    }
    this.requestUpdate();
  }

  render(): TemplateResult {
    switch (this.rutaActual) {
      case '/estudiante':
        return html`<pagina-estudiante></pagina-estudiante>`;
      case '/tutor':
        return html`<pagina-tutor></pagina-tutor>`;
      case '/admin':
        return html`<pagina-admin></pagina-admin>`;
      case '/login':
      default:
        return html`<page-login></page-login>`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-shell': AppShell;
  }
}
