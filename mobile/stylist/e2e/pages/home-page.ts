import { $ } from 'protractor';

class HomePage {
  // UI element declarations.
  get home() { return $('home-slots'); }
  get homeMenuToggleBtn() { return $('home-slots [data-test-id=menuToggleBtn]'); }
}

export const homePage = new HomePage();
