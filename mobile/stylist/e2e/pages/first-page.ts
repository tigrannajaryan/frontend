
import { $ } from 'protractor';

/**
 * First page definition.
 */
class FirstPage {
  // UI element declarations.
  // Note that element declarations are getter functions.
  // This allows lazy evaluation of locators which is neccessary to avoid evaluating them
  // too early and failing. By making them functions the locators are evaluated
  // exactly when they are needed in the test instead of before the tests.
  //
  // Note: if there is a no reliable good CSS selector on the UI element that you
  // need to locate in tests the best practice is to add a data-test-id attribute
  // in the html and use it here, like it is done for loginBth and registerLink.
  get loginBtn() { return $('page-first-screen [data-test-id=loginBtn]'); }
  get registerLink() { return $('page-first-screen [data-test-id=registerLink]'); }

  // Operations
  navigateToLogin() {
    return this.loginBtn.click();
  }

  navigateToRegister() {
    return this.registerLink.click();
  }
}

export const firstPage = new FirstPage();
