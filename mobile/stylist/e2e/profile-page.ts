import { $ } from 'protractor';

/**
 * Profile page definition
 */
class ProfilePage {
  // UI element declarations
  get firstNameInput() { return $('page-register-salon input[formControlName=first_name]'); }
  get lastNameInput() { return $('page-register-salon input[formControlName=last_name]'); }

  // Operations
  fillForm(firstName, lastName) {
    this.firstNameInput.sendKeys(firstName);
    this.lastNameInput.sendKeys(lastName);
  }
}

export const profilePage = new ProfilePage();
