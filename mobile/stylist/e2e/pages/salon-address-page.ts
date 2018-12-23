import { $ } from 'protractor';

import { click, waitForNot } from '../shared-e2e/utils';

class SalonAddressPage {
  // UI element declarations
  get salonAddress() { return $('address-input [data-test-id=salonAddress] input'); }

  get continueButton() { return $('address-input [data-test-id=continueBtn]'); }

  // Operations
  async fillForm(salonAddress) {
    await this.salonAddress.sendKeys(salonAddress);
  }

  async submitForm() {
    await click(salonAddressPage.continueButton);
    await waitForNot(this.salonAddress);
  }
}

export const salonAddressPage = new SalonAddressPage();
