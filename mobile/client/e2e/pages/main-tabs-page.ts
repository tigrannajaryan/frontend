import { by, element } from 'protractor';

class MainTabsPage {
  private tabSelector(tabName: string) {
    return element(by.cssContainingText('main-tabs ion-tabs span.tab-button-text', tabName));
  }

  // UI element declarations.
  get homeTab() { return this.tabSelector('Home'); }
  get historyTab() { return this.tabSelector('History'); }
  get stylsitsTab() { return this.tabSelector('Stylists'); }
  get profileTab() { return this.tabSelector('Profile'); }
}

export const mainTabsPage = new MainTabsPage();
