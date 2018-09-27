import { $ } from 'protractor';

/**
 * Phone code page definition
 */
class PhoneCodePage {
  // UI element declarations.
  get codeInput() { return $('page-auth-confirm input[type=tel]'); }
  get codeErrorMsg() { return $('page-auth-confirm .AuthConfirmPage-error'); }
}

export const phoneCodePage = new PhoneCodePage();
