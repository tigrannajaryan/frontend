import { $ } from 'protractor';
import { click } from '../shared-e2e/utils';

/**
 * LoginRegister page definition
 */
class LogregPage {
  // UI element declarations.
  get emailInput() { return $('page-logreg input[type=email]'); }
  get passwordInput() { return $('page-logreg input[type=password]'); }
  get loginBtn() { return $('page-logreg [data-test-id=loginBtn]'); }
  get registerBtn() { return $('page-logreg [data-test-id=registerBtn]'); }

  // Operations
  async login(email, password) {
    await this.emailInput.sendKeys(email);
    await this.passwordInput.sendKeys(password);
    await click(this.loginBtn);
  }

  async register(email, password) {
    await this.emailInput.sendKeys(email);
    await this.passwordInput.sendKeys(password);
    await click(this.registerBtn);
  }

  reRegister() {
    return click(this.registerBtn);
  }
}

export const logregPage = new LogregPage();
