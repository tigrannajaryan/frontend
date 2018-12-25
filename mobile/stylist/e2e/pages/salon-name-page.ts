import { $, $$ } from 'protractor';

import { click, waitFor } from '../shared-e2e/utils';

class SalonNamePage {
  // UI element declarations
  get salonName() { return $('field-edit [data-test-id=salonName] input'); }

  get continueButton() { return $$('field-edit [data-test-id=continueBtn]').last(); }

  // Operations
  async fillForm(salonName) {
    await waitFor(this.salonName);
    await this.salonName.sendKeys(salonName);
  }

  async submitForm() {
    await click(this.continueButton);
  }
}

export const salonNamePage = new SalonNamePage();
