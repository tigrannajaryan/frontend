import { $ } from 'protractor';

class HomePage {
  // UI element declarations.
  get homeTabs() { return $('page-home [data-test-id=homeTabs]'); }
  get homeMenuToggleBtn() { return $('page-home [data-test-id=menuToggleBtn]'); }
}

export const homePage = new HomePage();
