import { $ } from 'protractor';

import { click, waitForNot } from '../shared-e2e/utils';

/**
 * Profile page definition
 */
class RegisterProfilePage {
  // UI element declarations
  get takePhotoBtn() { return $('page-register-salon [data-test-id=takePhotoBtn]'); }
  get firstNameInput() { return $('page-register-salon input[formControlName=first_name]'); }
  get lastNameInput() { return $('page-register-salon input[formControlName=last_name]'); }
  get salonNameInput() { return $('page-register-salon input[formControlName=salon_name]'); }
  get salonAddressInput() { return $('page-register-salon input[formControlName=salon_address]'); }
  get phoneNumberInput() { return $('page-register-salon input[formControlName=phone]'); }
  get websiteInput() { return $('page-register-salon input[formControlName=website_url]'); }
  get continueButton() { return $('page-register-salon [data-test-id=submitProfileBtn]'); }

  // Operations
  async fillForm(firstName, lastName, salonName, address, phoneNumber, websiteName) {
    await this.firstNameInput.sendKeys(firstName);
    await this.lastNameInput.sendKeys(lastName);
    await this.salonNameInput.sendKeys(salonName);
    await this.salonAddressInput.sendKeys(address);
    await this.phoneNumberInput.sendKeys(phoneNumber);
    await this.websiteInput.sendKeys(websiteName);
  }

  async submitForm() {
    try {
      await click(registerProfilePage.continueButton);
    } catch (e) {
      console.warn('Cannot click on Continue button in profile page.', e);
      console.warn(await this.firstNameInput.getText());
      console.warn(await this.lastNameInput.getText());
      console.warn(await this.salonNameInput.getText());
      console.warn(await this.salonAddressInput.getText());
      console.warn(await this.phoneNumberInput.getText());
      console.warn(await this.websiteInput.getText());
    }
    await waitForNot(this.continueButton);
  }
}

export const registerProfilePage = new RegisterProfilePage();
