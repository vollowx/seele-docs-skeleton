import "@vollowx/seele/m3/button/common-button.js";
import "@vollowx/seele/m3/button/icon-button.js";
import "@vollowx/seele/m3/button/common-button-toggle.js";
import "@vollowx/seele/m3/button/icon-button-toggle.js";
import "@vollowx/seele/m3/button-group/connected-button-group.js";
import "@vollowx/seele/m3/button-group/standard-button-group.js";
import "@vollowx/seele/m3/fab/fab.js";

import "@vollowx/seele/m3/checkbox/checkbox.js";
import "@vollowx/seele/m3/radio/radio.js";
import "@vollowx/seele/m3/select/outlined-select.js";
import "@vollowx/seele/m3/select/option.js";
import "@vollowx/seele/m3/slider/slider.js";
import "@vollowx/seele/m3/switch/switch.js";
import "@vollowx/seele/m3/text-field/filled-text-field.js";
import "@vollowx/seele/m3/text-field/outlined-text-field.js";

import "@vollowx/seele/m3/dialog/dialog.js";
import "@vollowx/seele/m3/list/list.js";
import "@vollowx/seele/m3/loading-indicator/loading-indicator.js";
import "@vollowx/seele/m3/menu/menu.js";
import "@vollowx/seele/m3/menu/menu-item.js";
import "@vollowx/seele/m3/tab/tab.js";
import "@vollowx/seele/m3/tab/tab-panel.js";
import "@vollowx/seele/m3/tab/tabs.js";
import "@vollowx/seele/m3/toolbar/toolbar.js";
import "@vollowx/seele/m3/tooltip/tooltip.js";
import type { Dialog } from "@vollowx/seele/base/dialog.js";
import type { Menu } from "@vollowx/seele/base/menu.js";

import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { ref, createRef, type Ref } from "lit/directives/ref.js";
import { genUniqueId } from "@vollowx/seele/core/unique-id.js";

const sizeFrom = (index: number) => ["xs", "s", "m", "l", "xl"][index - 1]

// const descriptions = {
//   button: {
//     variant:      limitedStr('filled', 'filled', 'tonal', 'elevated', 'outlined', 'text')
//     size:         limitedStr('s', ...commonSizes),
//     square:       bool(),
//     trailingIcon: bool(),
//     disabled:     bool(),
//   }
// }

@customElement("playground-m3")
export class PlaygroundM3 extends LitElement {
  @state() checkboxError = false;
  @state() checkboxDisabled = false;

  @state() loadingContained = false;

  @state() switchIcons = false;
  @state() switchCheckedIconOnly = false;
  @state() switchDisabled = false;

  static override styles = [
    css`
      :host {
        display: grid;
        gap: 3rem 1.5rem;
        margin-bottom: 1rem;
        grid-column: 1;
      }
      @media (min-width: 52.5rem) {
        :host {
          grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
          margin-bottom: 1.5rem;
        }
      }
      h1 {
        margin-block: 0 16px;
        padding: 16px;
        border-radius: 28px;
        background: var(--md-sys-color-primary-container);
        color: var(--md-sys-color-on-primary-container);
        font: var(--md-sys-typography-display-medium);
        height: min-content;
      }
      :host > div {
        display: flex;
        flex-direction: column;
      }

      .conf {
        display: flex;
        flex-direction: column;
        background: var(--md-sys-color-surface-container-low);
        padding: 16px;
        border-radius: 28px;

        h2 {
          font: var(--md-sys-typography-headline-medium);
          margin-block-start: 0;
          &.animated {
            color: var(--md-sys-color-primary);
          }
          &:last-child {
            margin-block-end: 0;
          }
        }

        label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 48px;
          padding-block: 4px;

          md-slider {
            margin-inline-end: -24px;
          }
        }
      }

      .demo {
        overflow: auto;
        flex: 1;
        padding-block: 16px;

        [role=radiogroup] > div {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }
    `,
  ];

  /**
   * In case you really are reading this pile of...
   * It is fine to use `?trailing-icon` and `.trailingIcon` since most of the
   * style attributes have their corresponding properties.
   * Just in case ( ._.)/
   *
   * TODO: unify multi-word attributes to aaabbb, remove all aaa-bbb
   */
  override render() {
    return html`
      <div>
        <h1>Material You Expressive Playground</h1>
        <md-button
          variant="tonal"
          size="m"
          @click=${() => navigation.navigate("../")}
        >
          <iconify-icon
            slot="icon"
            icon="material-symbols:table-outline"
          ></iconify-icon>
          Read docs
        </md-button>
      </div>
      <div>${this.renderButton()}</div>
      <div>${this.renderIconButton()}</div>
      <div>${this.renderButtonGroup()}</div>
      <div>
        <div class="conf">
          <h2>Checkbox</h2>
          ${this.renderBool("Error", (e: any) => (this.checkboxError = e.detail))}
          ${this.renderBool("Disabled", (e: any) => (this.checkboxDisabled = e.detail))}
        </div>
        <div class="demo">
          <md-checkbox
            aria-label="Demo checkbox"
            .error=${this.checkboxError}
            .disabled=${this.checkboxDisabled}>
          </md-checkbox>
        </div>
      </div>
      <div>${this.renderDialog()}</div>
      <div>${this.renderList()}</div>
      <div>
        <div class="conf">
          <h2 class="animated">Loading indicator</h2>
          ${this.renderBool("Contained", (e: any) => (this.loadingContained = e.detail))}
        </div>
        <div class="demo">
          <md-loading aria-label="Demo loading" ?contained=${this.loadingContained}></md-loading>
        </div>
      </div>
      <div>${this.renderMenu()}</div>
      <div>
        <div class="conf">
          <h2>Switch</h2>
          ${this.renderBool("Icons", (e: any) => (this.switchIcons = e.detail))}
          ${this.renderBool("Checked icon only", (e: any) => (this.switchCheckedIconOnly = e.detail))}
          ${this.renderBool("Disabled", (e: any) => (this.switchDisabled = e.detail))}
        </div>
        <div class="demo">
          <md-switch
            aria-label="Demo switch"
            .icons=${this.switchIcons}
            .checkedIconOnly=${this.switchCheckedIconOnly}
            .disabled=${this.switchDisabled}>
          </md-switch>
        </div>
      </div>
      <div>${this.renderRadio()}</div>
      <div>${this.renderTabs()}</div>
      <div>${this.renderTextField()}</div>
      <div>${this.renderToolbar()}</div>
    `;
  }

  @state() buttonVariant = "filled";
  @state() buttonSize = 2;
  @state() buttonSquare = false;
  @state() buttonTrailingIcon = false;
  @state() buttonDisabled = false;
  renderButton() {
    return html`
      <div class="conf">
        <h2>Button</h2>
        ${this.renderStrOpt(
          "Variant",
          ["filled", "tonal", "elevated", "outlined", "text"],
          "filled",
          (e: any) => (this.buttonVariant = e.target.value),
        )}
        ${this.renderSize("Size", (e: any) => (this.buttonSize = e.target.value))}
        ${this.renderBool('Square', (e: any) => (this.buttonSquare = e.detail))}
        ${this.renderBool('Trailing icon', (e: any) => (this.buttonTrailingIcon = e.detail))}
        ${this.renderBool('Disabled', (e: any) => (this.buttonDisabled = e.detail))}
      </div>
      <div class="demo">
        <md-button
          .variant=${this.buttonVariant}
          .size=${sizeFrom(this.buttonSize)}
          .square=${this.buttonSquare}
          .trailingIcon=${this.buttonTrailingIcon}
          .disabled=${this.buttonDisabled}
        >
          ${this.renderSampleIcon()}
          Button
        </md-button>
      </div>
    `;
  }

  @state() iconButtonVariant = "text";
  @state() iconButtonWidth = "standard";
  @state() iconButtonSize = 2;
  @state() iconButtonDisabled = false;
  renderIconButton() {
    return html`
      <div class="conf">
        <h2>Icon button</h2>
        ${this.renderStrOpt(
          "Variant",
          ["filled", "tonal", "outlined", "text"],
          "text",
          (e: any) => (this.iconButtonVariant = e.target.value),
        )}
        ${this.renderStrOpt(
          "Width",
          ["narrow", "standard", "wide"],
          "standard",
          (e: any) => (this.iconButtonWidth = e.target.value),
        )}
        ${this.renderSize("Size", (e: any) => (this.iconButtonSize = e.target.value))}
        ${this.renderBool('Disabled', (e: any) => (this.iconButtonDisabled = e.detail))}
      </div>
      <div class="demo">
        <md-icon-button
          .variant=${this.iconButtonVariant}
          .width=${this.iconButtonWidth}
          .size=${sizeFrom(this.iconButtonSize)}
          .disabled=${this.iconButtonDisabled}
        >
          ${this.renderSampleIcon(false)}
        </md-icon-button>
      </div>
    `;
  }

  @state() stdBtnGroupSize = 2;
  @state() conBtnGroupMulti = false;
  renderButtonGroup() {
    return html`
      <div class="conf">
        <h2 class="animated">Button group</h2>
        ${this.renderSize("Size", (e: any) => (this.stdBtnGroupSize = e.target.value))}
        ${this.renderBool('Multiple (for the connected)', (e: any) => (this.conBtnGroupMulti = e.detail))}
      </div>
      <div class="demo">
        <md-button-group .size=${sizeFrom(this.stdBtnGroupSize)} style="margin-block-end: 16px">
          <md-icon-button-toggle variant="filled" .size=${sizeFrom(this.stdBtnGroupSize)}>
            <iconify-icon icon="material-symbols:bluetooth-disabled"></iconify-icon>
            <iconify-icon icon="material-symbols:bluetooth" slot="checked"></iconify-icon>
          </md-icon-button-toggle>

          <md-icon-button-toggle variant="filled" width="wide" .size=${sizeFrom(this.stdBtnGroupSize)}>
            <iconify-icon icon="material-symbols:alarm-off"></iconify-icon>
            <iconify-icon icon="material-symbols:alarm" slot="checked"></iconify-icon>
          </md-icon-button-toggle>

          <md-button-toggle .size=${sizeFrom(this.stdBtnGroupSize)}>
            <iconify-icon icon="material-symbols:do-not-disturb-off-outline" slot="icon"></iconify-icon>
            <iconify-icon icon="material-symbols:do-not-disturb-on-outline" slot="icon-checked"></iconify-icon>
            <span>Focus</span>
            <span slot="checked">Focus</span>
          </md-button-toggle>

          <md-icon-button-toggle variant="filled" width="narrow" .size=${sizeFrom(this.stdBtnGroupSize)}>
            <iconify-icon icon="material-symbols:flashlight-off-outline"></iconify-icon>
            <iconify-icon icon="material-symbols:flashlight-on-outline" slot="checked"></iconify-icon>
          </md-icon-button-toggle>

          <md-icon-button-toggle variant="filled" checked .size=${sizeFrom(this.stdBtnGroupSize)}>
            <iconify-icon icon="material-symbols:wifi-off"></iconify-icon>
            <iconify-icon icon="material-symbols:wifi" slot="checked"></iconify-icon>
          </md-icon-button-toggle>
        </md-button-group>

        <md-connected-button-group ?multiple=${this.conBtnGroupMulti} style="min-width: 100%">
          <md-button-toggle variant="tonal" .size=${sizeFrom(this.stdBtnGroupSize)}>
            May
            <span slot="checked">May</span>
          </md-button-toggle>
          <md-button-toggle variant="tonal" .size=${sizeFrom(this.stdBtnGroupSize)}>
            Hammond
            <span slot="checked">Hammond</span>
          </md-button-toggle>
          <md-button-toggle variant="tonal" .size=${sizeFrom(this.stdBtnGroupSize)}>
            Clarkson
            <span slot="checked">Clarkson</span>
          </md-button-toggle>
          <md-button-toggle variant="tonal" .size=${sizeFrom(this.stdBtnGroupSize)}>
            William
            <span slot="checked">William</span>
          </md-button-toggle>
        </md-connected-button-group>
      </div>
    `;
  }

  dialogRef: Ref<Dialog> = createRef();
  renderDialog() {
    return html`
      <div class="conf">
        <h2 class="animated">Dialog</h2>
      </div>
      <div class="demo">
        <style>
          md-dialog::part(dialog) {
            max-width: 360px;
          }
        </style>
        <md-button variant="tonal" @click=${() => this.dialogRef.value!.show()}>Delete All Media</md-button>
        <md-dialog ${ref(this.dialogRef)}>
          <iconify-icon icon="material-symbols:delete-forever-outline" slot="icon"></iconify-icon>
          <h2 slot="headline">Confirm Deletion</h2>
          <p style="margin: 0">
            Not that long ago I reviewed the then new McLaren 720S and, to
            recap, I said it was a nerd’s car and that the engineers...
          </p>
          <div slot="actions">
            <md-button variant="text" @click=${() => this.dialogRef.value!.close()}>
              Cancel
            </md-button>
            <md-button variant="text" @click=${() => this.dialogRef.value!.close()}>
              Delete
            </md-button>
          </div>
        </md-dialog>
      </div>
    `;
  }

  renderList() {
    return html`
      <div class="conf">
        <h2>List and divider</h2>
      </div>
      <div class="demo">
        <md-list>
          <md-list-item>
            <iconify-icon slot="start" icon="material-symbols:looks"></iconify-icon>
            List item 1
            <span slot="trailing-supporting-text">Trailing supporting text</span>
          </md-list-item>
          <md-divider inset></md-divider>
          <md-list-item>
            List item 2
            <span slot="supporting-text">Not very supporting text</span>
            <iconify-icon slot="end" icon="material-symbols:account-circle-outline"></iconify-icon>
          </md-list-item>
          <md-list-item selected>
            <span slot="overline">And overline</span>
            List item 3
          </md-list-item>
          <md-list-item disabled>List item 4</md-list-item>
        </md-list>
      </div>
    `;
  }

  menuRef: Ref<Menu> = createRef();
  @state() menuVibrant = true;
  renderMenu() {
    return html`
      <div class="conf">
        <h2>Menu</h2>
        ${this.renderBool('Vibrant', (e: any) => (this.menuVibrant = e.detail), true)}
      </div>
      <div class="demo">
        <md-button
          id="menu-trigger"
          variant="tonal"
          @click=${() => (this.menuRef.value!.open = !this.menuRef.value!.open)}
          >File</md-button
        >
        <md-menu for="menu-trigger" ${ref(this.menuRef)} .color=${this.menuVibrant ? 'vibrant' : 'standard'}>
          <md-menu-item>New Text File</md-menu-item>
          <md-menu-item>New File...</md-menu-item>
          <md-menu-item>
            New Window
            <iconify-icon slot="end" icon="material-symbols:window"></iconify-icon>
          </md-menu-item>
          <md-divider inset></md-divider>
          <md-menu-item>Open File...</md-menu-item>
          <md-menu-item disabled>Open Folder...</md-menu-item>
          <md-divider inset></md-divider>
          <md-menu-item selected>Save</md-menu-item>
          <md-menu-item>Save As...</md-menu-item>
        </md-menu>
      </div>
    `;
  }

  renderRadio() {
    return html`
      <div class="conf">
        <h2>Radio button</h2>
      </div>
      <div class="demo">
        <form>
          <div role="radiogroup" aria-label="Fruits">
            <div>
              <md-radio name="fruit" value="apple" id="radio-apple" checked></md-radio>
              <label for="radio-apple">Apple</label>
            </div>
            <div>
              <md-radio name="fruit" value="banana" id="radio-banana"></md-radio>
              <label for="radio-banana">Banana</label>
            </div>
            <div>
              <md-radio name="fruit" value="pear" id="radio-pear" disabled></md-radio>
              <label for="radio-pear">Pear</label>
            </div>
            <div>
              <md-radio name="fruit" value="orange" id="radio-orange"></md-radio>
              <label for="radio-orange">Orange</label>
            </div>
          </div>
        </form>
      </div>
    `;
  }

  @state() tabsIcon = true;
  @state() tabsIconsAbove = true;
  renderTabs() {
    return html`
      <div class="conf">
        <h2 class="animated">Tabs</h2>
        ${this.renderBool('Icons', (e: any) => (this.tabsIcon = e.detail), true)}
        ${this.renderBool('Icons above', (e: any) => (this.tabsIconsAbove = e.detail), true)}
      </div>
      <div class="demo">
        <md-tabs selected="2" style="width: 100%" .iconsAbove=${this.tabsIconsAbove && this.tabsIcon}>
          <md-tab value="1">
            ${this.tabsIcon ? this.renderSampleIcon() : ''}
            All
          </md-tab>
          <md-tab value="2" selected>
            ${this.tabsIcon ? this.renderSampleIcon() : ''}
            Music
          </md-tab>
          <md-tab value="3">
            ${this.tabsIcon ? this.renderSampleIcon() : ''}
            Podcasts
          </md-tab>
          <md-tab value="4">
            ${this.tabsIcon ? this.renderSampleIcon() : ''}
            Explore Premium
          </md-tab>
          <md-tab-panel value="1">
            <p>Jeremy Clarkson</p>
          </md-tab-panel>
          <md-tab-panel value="2" selected>
            <p>James May</p>
          </md-tab-panel>
          <md-tab-panel value="3">
            <p>Richard Hammond</p>
          </md-tab-panel>
          <md-tab-panel value="4">
            <p>Le William</p>
          </md-tab-panel>
        </md-tabs>
      </div>
    `;
  }

  renderTextField() {
    return html`
      <div class="conf">
        <h2>Text field</h2>
      </div>
      <div class="demo" style="display: flex; flex-direction: column; gap: 16px">
        <md-filled-text-field
          label="Filter"
          placeholder="Placeholder"
          supportingtext="* requird"
          required
        ></md-filled-text-field>
        <md-outlined-text-field type="number" label="Height"></md-outlined-text-field>
      </div>
    `;
  }

  @state() fabSize = 2;
  @state() toolbarFloating = true;
  @state() toolbarVibrant = true;
  renderToolbar() {
    return html`
      <div class="conf">
        <h2>Toolbar, tooltip and FAB</h2>
        ${this.renderBool('Floating (toolbar)', (e: any) => (this.toolbarFloating = e.detail), true)}
        ${this.renderBool('Vibrant (toolbar)', (e: any) => (this.toolbarVibrant = e.detail), true)}
        ${this.renderSize("Size (of FAB)", (e: any) => (this.fabSize = e.target.value), false)}
      </div>
      <div class="demo">
        <md-toolbar
          type="${this.toolbarFloating ? 'floating' : 'docked'}"
          color=${this.toolbarVibrant ? 'vibrant' : 'standard'}
        >
          <md-icon-button id="toolbar-archive">
            <iconify-icon icon="material-symbols:archive"></iconify-icon>
          </md-icon-button>
          <md-icon-button id="toolbar-delete">
            <iconify-icon icon="material-symbols:delete"></iconify-icon>
          </md-icon-button>
          <md-icon-button id="toolbar-mail">
            <iconify-icon icon="material-symbols:mail"></iconify-icon>
          </md-icon-button>
          <md-icon-button id="toolbar-snooze">
            <iconify-icon icon="material-symbols:snooze"></iconify-icon>
          </md-icon-button>
          <md-icon-button id="toolbar-more-mailboxes">
            <iconify-icon icon="material-symbols:more-vert"></iconify-icon>
          </md-icon-button>

          <md-tooltip offset="16" for="toolbar-archive">Archive</md-tooltip>
          <md-tooltip offset="16" for="toolbar-delete">Delete</md-tooltip>
          <md-tooltip offset="16" for="toolbar-mail">Mail</md-tooltip>
          <md-tooltip offset="16" for="toolbar-snooze">Snooze</md-tooltip>
          <md-tooltip offset="16" for="toolbar-more-mailboxes">More mailboxes</md-tooltip>

          ${this.toolbarFloating ?
            html`
              <md-fab slot="fab" color="tertiary" id="toolbar-reply" .size=${sizeFrom(this.fabSize)}>
                <iconify-icon icon="material-symbols:reply"></iconify-icon>
              </md-fab>
              <md-tooltip offset="8" for="toolbar-reply">Reply</md-tooltip>
            ` : ''}
        </md-toolbar>
      </div>
    `;
  }

  renderStrOpt(
    label: string,
    options: Array<string>,
    defaultOption: string,
    callback: (e: any) => {},
  ) {
    const id = genUniqueId('demo');
    // label="${label}" FIXME: use data-aria-label
    return html`
      <label for="${id}">
        ${label}
        <md-outlined-select
          id="${id}"
          @change=${callback}
        >
          ${options.map(
            (option) => html`
              <md-option
                value="${option}"
                ?selected=${option === defaultOption}
              >
                ${option}
              </md-option>
            `,
          )}
        </md-outlined-select>
      </label>
    `;
  }
  renderSize(label: string, callback: (e: any) => {}, extra = true) {
    const id = genUniqueId('demo');
    return html`
      <label for="${id}">
        ${label}
        <md-slider
          min="${extra ? 1 : 2}" max="${extra ? 5 : 4}" value="2"
          labeled ticks
          id="${id}"
          data-aria-label="${label}"
          @input=${callback}
        ></md-slider>
      </label>
    `;
  }
  renderBool(label: string, callback: (e: any) => {}, checked = false) {
    return html`
      <label>
        ${label}
        <md-switch
          icons
          checkedicononly
          ?checked=${checked}
          @change=${callback}
        ></md-switch>
      </label>
    `;
  }
  renderSampleIcon(inSlot = true) {
    return html`<iconify-icon slot="${inSlot ? 'icon' : nothing}" icon="material-symbols:edit"></iconify-icon>`;
  }
}
