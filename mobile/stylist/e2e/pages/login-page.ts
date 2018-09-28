import { $ } from 'protractor';
import { click, waitForNot } from '../shared-e2e/utils';

/**
 * Login page definition
 */
class LoginPage {
  // UI element declarations.
  get phoneInput() { return $('page-auth-start input[type=tel]'); }
  get continueBtn() { return $('page-auth-start [data-test-id=contunueBtn]'); }

  // Operations
  async login(phone) {
    await this.phoneInput.sendKeys(phone);
    await click(this.continueBtn);
    await waitForNot(this.continueBtn);
  }
}

export const loginPage = new LoginPage();
