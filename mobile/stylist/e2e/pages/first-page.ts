
import { $ } from 'protractor';
import { click, waitForNot } from '../shared-e2e/utils';

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
  get getStartedBtn() { return $('page-first-screen [data-test-id=getStartedBtn]'); }

  // Operations
  async getStarted() {
    await click(this.getStartedBtn);
    await waitForNot(this.getStartedBtn);
  }
}

export const firstPage = new FirstPage();
