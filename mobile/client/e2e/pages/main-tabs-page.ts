import { by, element } from 'protractor';
import { waitFor } from '../shared-e2e/utils';

class MainTabsPage {
  private tabSelector(tabName: string) {
    return element(by.cssContainingText('main-tabs ion-tabs span.tab-button-text', tabName));
  }

  // UI element declarations.
  get homeTab() { return this.tabSelector('Home'); }
  get historyTab() { return this.tabSelector('History'); }
  get stylsitsTab() { return this.tabSelector('Stylists'); }
  get profileTab() { return this.tabSelector('Profile'); }

  // Operations
  async goToMyStylists() {
    await this.stylsitsTab.click();
    await waitFor(this.stylsitsTab);
  }
}

export const mainTabsPage = new MainTabsPage();
