import { $ } from 'protractor';

import { click, waitForNot } from './utils';

class HowPricingWorksPage {
  // UI element declarations.
  get continueBtn() { return $('page-how-pricing-works button[data-test-id=continueBtn]'); }

  // Operations
  async continue() {
    await click(this.continueBtn);
    await waitForNot(this.continueBtn);
  }
}

export const howPricingWorksPage = new HowPricingWorksPage();
