import { $ } from 'protractor';

import { click, waitFor, waitForNot } from '../shared-e2e/utils';

class SalonAddressPage {
  // UI element declarations
  get salonAddress() { return $('salon-address [data-test-id=salonAddress] input'); }

  get continueButton() { return $('salon-address [data-test-id=continueWithAddress]'); }

  // Operations
  async fillForm(salonAddress) {
    await waitFor(this.salonAddress);
    // we need this click function before sendKeys
    // it's fix bug. when sometimes `Selenium sendKeys(string) method only sending part of string`
    await click(this.salonAddress);
    await this.salonAddress.sendKeys(salonAddress);
  }

  async submitForm() {
    await click(this.continueButton);
    await waitForNot(this.continueButton);
  }
}

export const salonAddressPage = new SalonAddressPage();
