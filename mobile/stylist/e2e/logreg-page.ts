import { $, by } from 'protractor';
import { firstVisible } from './utils';

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
  login(email, password) {
    this.emailInput.sendKeys(email);
    this.passwordInput.sendKeys(password);
    return this.loginBtn.click();
  }

  register(email, password) {
    this.emailInput.sendKeys(email);
    this.passwordInput.sendKeys(password);
    return this.registerBtn.click();
  }
}

export const logregPage = new LogregPage();
