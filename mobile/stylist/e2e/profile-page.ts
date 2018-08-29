import { $ } from 'protractor';

/**
 * Profile page definition
 */
class ProfilePage {
  // UI element declarations
  get takePhotoBtn() { return $('page-register-salon label[data-test-id=takePhotoBtn]'); }
  get firstNameInput() { return $('page-register-salon input[formControlName=first_name]'); }
  get lastNameInput() { return $('page-register-salon input[formControlName=last_name]'); }
  get salonNameInput() { return $('page-register-salon input[formControlName=salon_name]'); }
  get salonAddressInput() { return $('page-register-salon input[formControlName=salon_address]'); }
  get phoneNumberInput() { return $('page-register-salon input[formControlName=phone]'); }
  get instagramNameInput() { return $('page-register-salon input[formControlName=instagram_url]'); }
  get websiteInput() { return $('page-register-salon input[formControlName=website_url]'); }
  get continueButton() { return $('page-register-salon button[data-test-id=submitProfileBtn]'); }
  
  // Operations
  fillForm(firstName, lastName, salonName,address,phoneNumber,instagramName,websiteName) {
    this.firstNameInput.sendKeys(firstName);
    this.lastNameInput.sendKeys(lastName);
    this.salonNameInput.sendKeys(salonName);
    this.salonAddressInput.sendKeys(address);
    this.phoneNumberInput.sendKeys(phoneNumber);
    this.instagramNameInput.sendKeys(instagramName);
    this.websiteInput.sendKeys(websiteName);
  }

  submitForm(){
    return this.continueButton.click();
  }
  
  //should be added
  takePhoto(){}
}

export const profilePage = new ProfilePage();
