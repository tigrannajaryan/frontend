import { $ } from 'protractor';

import { click, waitFor } from '../shared-e2e/utils';

class SalonAddressPage {
  // UI element declarations
  get salonAddress() { return $('salon-address [data-test-id=salonAddress] input'); }

  get continueButton() { return $('salon-address [data-test-id=continueWithAddress]'); }

  // Operations
  async fillForm(salonAddress) {
    await waitFor(this.salonAddress);
    await this.salonAddress.sendKeys(salonAddress);
  }

  async submitForm() {
    await click(this.continueButton);
  }
}

export const salonAddressPage = new SalonAddressPage();
