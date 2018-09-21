import { $ } from 'protractor';

import { click, waitForNot } from '../shared-e2e/utils';

class WelcomeToMadePage {
  // UI element declarations.
  get continueBtn() { return $('page-welcome-to-made [data-test-id=continueBtn]'); }

  // Operations
  async continue() {
    await click(this.continueBtn);
    await waitForNot(this.continueBtn);
  }
}

export const welcomeToMadePage = new WelcomeToMadePage();
