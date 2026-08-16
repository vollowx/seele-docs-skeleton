import { LitElement, html, css, isServer } from "lit";
import { customElement, state } from "lit/decorators.js";

import "@vollowx/seele/m3/toolbar/toolbar.js";
import "@vollowx/seele/m3/button/common-button-toggle.js";
import "@vollowx/seele/m3/button-group/connected-button-group.js";

type Theme = "auto" | "light" | "dark";
type Motion = "expressive" | "standard";

@customElement("docs-config")
export class DocsConfig extends LitElement {
  @state() theme: Theme = "auto";
  @state() motion: Motion = "expressive";

  #mq: MediaQueryList | null = null;

  static override styles = [
    css`
      md-toolbar {
        position: fixed;
        inset-block-end: 16px;
        inset-inline-start: 50%;
        transform: translateX(-50%);
        z-index: 50;
      }
    `,
  ];

  override render() {
    return html`
      <md-toolbar type="floating">
        ${this.renderGroup(
          ["auto", "light", "dark"],
          this.theme,
          this.#updateTheme,
        )}
        ${this.renderGroup(
          ["expressive", "standard"],
          this.motion,
          this.#updateMotion,
        )}
      </md-toolbar>
    `;
  }

  renderGroup(
    options: string[],
    selectedValue: string,
    handler: (e: Event) => void,
  ) {
    const label = (opt: string) => opt.charAt(0).toUpperCase() + opt.slice(1);
    return html`
      <md-connected-button-group @change=${handler}>
        ${options.map(
          (opt) => html`
            <md-button-toggle variant="tonal" ?checked=${selectedValue === opt}>
              <span>${label(opt)}</span>
              <span slot="checked">${label(opt)}</span>
            </md-button-toggle>
          `,
        )}
      </md-connected-button-group>
    `;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.#mq = window.matchMedia("(prefers-color-scheme: dark)");
    this.#mq.addEventListener("change", this.#handleThemeChange.bind(this));
  }

  override firstUpdated() {
    this.theme = (localStorage.getItem("md-color-scheme") as Theme) || "auto";
    this.motion = (localStorage.getItem("md-motion-scheme") as Motion) || "expressive";
    this.#applyTheme();
    this.#applyMotion();
  }

  override disconnectedCallback() {
    this.#mq?.removeEventListener("change", this.#handleThemeChange.bind(this));
    super.disconnectedCallback();
  }

  #handleThemeChange() {
    if (this.theme === "auto") {
      this.#applyTheme();
    }
  }

  #applyTheme() {
    const isDark =
      this.theme === "auto" ? this.#mq?.matches : this.theme === "dark";
    document.documentElement.dataset.mdColorScheme = isDark ? "dark" : "light";
  }

  #applyMotion() {
    document.documentElement.dataset.mdMotionScheme = this.motion;
  }

  #updateTheme(e: Event) {
    const btn = (e.target as Element).closest("md-button-toggle");
    if (!btn) return;

    const values = ["auto", "light", "dark"];

    const group = e.currentTarget as HTMLElement;
    const idx = Array.from(group.children).indexOf(btn as any);

    this.theme = values[idx] as Theme;

    localStorage.setItem("md-color-scheme", this.theme);
    this.#applyTheme();
  }

  #updateMotion(e: Event) {
    const btn = (e.target as Element).closest("md-button-toggle");
    if (!btn) return;

    const group = e.currentTarget as HTMLElement;
    const idx = Array.from(group.children).indexOf(btn as any);

    if (idx === 0) this.motion = "expressive";
    else if (idx === 1) this.motion = "standard";

    localStorage.setItem("md-motion-scheme", this.motion);
    this.#applyMotion();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-config": DocsConfig;
  }
}
