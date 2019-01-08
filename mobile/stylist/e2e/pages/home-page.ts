import { $ } from 'protractor';
import { click, globals, waitFor, waitForNot } from '../shared-e2e/utils';

class HomePage {
  // UI element declarations.
  get home() { return $('home-slots'); }
  get menuBtn() { return $('[data-test-id=menuToggleBtn]'); }
  get logoutBtn() { return $('[data-test-id=menuLogoutLink]'); }
  get getMenuProfileLink() { return $('[data-test-id=menuProfileLink]'); }

  async logout() {
    await waitFor(this.logoutBtn);
    await click(this.logoutBtn);
    await click(globals.alertButton('Yes, Logout'));
    await waitForNot(this.logoutBtn);
  }
}

export const homePage = new HomePage();
