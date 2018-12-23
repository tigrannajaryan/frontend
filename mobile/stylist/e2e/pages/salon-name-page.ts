import { $ } from 'protractor';

import { click, waitForNot } from '../shared-e2e/utils';

class SalonNamePage {
  // UI element declarations
  get salonName() { return $('salon-name [data-test-id=salonName] input'); }

  get continueButton() { return $('salon-name [data-test-id=continueBtn]'); }

  // Operations
  async fillForm(salonName) {
    await this.salonName.sendKeys(salonName);
  }

  async submitForm() {
    await click(salonNamePage.continueButton);
    await waitForNot(this.salonName);
  }
}

export const salonNamePage = new SalonNamePage();
