import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import './index.css'
import.meta.glob('./**/*.ts', { eager: true });

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends LitElement {

  createRenderRoot() {
    return this; // Usa Light DOM en vez de Shadow DOM
  }

  render() {
    return html`
      <pagina-estudiante></pagina-estudiante>
    `
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
