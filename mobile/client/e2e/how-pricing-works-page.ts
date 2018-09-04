import { $ } from 'protractor';

import { waitFor, waitForNot } from './shared/utils';

class HowPricingWorksPage {
  // UI element declarations.
  get continueBtn() { return $('page-how-pricing-works button[data-test-id=continueBtn]'); }

  // Operations
  async continue() {
    await waitFor(this.continueBtn);
    await this.continueBtn.click();
    await waitForNot(this.continueBtn);
  }
}

export const howPricingWorksPage = new HowPricingWorksPage();
