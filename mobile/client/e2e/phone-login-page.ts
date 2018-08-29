import { $ } from 'protractor';

/**
 * LoginRegister page definition
 */
class PhoneLoginPage {
  // UI element declarations.
  get phoneInput() { return $('page-auth-start input[type=tel]'); }
  get continueBtn() { return $('page-auth-start button[type=submit]'); }

  // Operations
  login(phone) {
    this.phoneInput.sendKeys(phone);
    return this.continueBtn.click();
  }
}

export const phoneLoginPage = new PhoneLoginPage();
