import { $ } from 'protractor';

import { waitFor, waitForNot } from '../shared-e2e/utils';

/**
 * FirstPage definition
 */
class FirstPage {
  // UI element declarations.
  get startBtn() { return $('first-screen button[data-test-id=get-started]'); }

  // Operations
  async getStarted() {
    await waitFor(this.startBtn);
    await this.startBtn.click();
    await waitForNot(this.startBtn);
  }
}

export const firstPage = new FirstPage();
