import { $, browser } from 'protractor';
import { waitFor } from '../shared-e2e/utils';

class MenuComponent {
  // UI element declarations.
  get menuToggleBtn() { return $('ion-header[madeMenuHeader] button[menuToggle]'); }
  get menuProfileTitle() { return $('made-menu [data-test-id="menuProfileTitle"]'); }

  getMenuItem(categoryNum: number) {
    return $(`made-menu [data-test-id=categorySection${categoryNum}] [data-test-id=serviceList]`);
  }

  // Operations
  async openMenu() {
    // await click(this.menuToggleBtn);
    browser.actions().mouseMove(this.menuToggleBtn).click().perform();
    await waitFor(this.menuProfileTitle);
  }
}

export const menuComponent = new MenuComponent();
