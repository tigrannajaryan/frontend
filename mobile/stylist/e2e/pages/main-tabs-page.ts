import { $, by, element } from 'protractor';

class MainTabsPage {
  private tabSelector(tabName: string) {
    // Cannot use data-test-id on ion-tab (it has no effect), so have to use tab class name in selector
    return element(by.cssContainingText('page-tabs ion-tabs span.tab-button-text', tabName));
  }

  // UI element declarations.
  get homeTab() { return this.tabSelector('Home'); }
  get hoursTab() { return this.tabSelector('Hours'); }
  get discountTab() { return this.tabSelector('Discount'); }
  get servicesTab() { return this.tabSelector('Services'); }
  get inviteTab() { return this.tabSelector('Invite'); }
}

export const mainTabsPage = new MainTabsPage();
