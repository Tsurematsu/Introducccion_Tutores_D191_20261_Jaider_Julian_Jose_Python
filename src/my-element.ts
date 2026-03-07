import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import './index.css'
import './app-shell.js'
import.meta.glob('./**/*.ts', { eager: true });

/**
 * Punto de entrada principal de la app.
 * El routing real está en <app-shell>.
 */
@customElement('my-element')
export class MyElement extends LitElement {

  createRenderRoot() {
    return this; // Usa Light DOM en vez de Shadow DOM
  }

  render() {
    return html`
      <app-shell></app-shell>
    `
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
