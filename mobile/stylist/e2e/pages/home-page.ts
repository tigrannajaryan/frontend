import { $ } from 'protractor';

class HomePage {
  // UI element declarations.
  get home() { return $('home-slots'); }
  get menuBtn() { return $('[data-test-id=menuToggleBtn]'); }
  get logoutBtn() { return $('[data-test-id=menuLogoutLink]'); }
}

export const homePage = new HomePage();
