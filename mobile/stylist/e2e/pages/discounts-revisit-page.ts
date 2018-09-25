import { $ } from 'protractor';
import { click, waitForNot } from '../shared-e2e/utils';

class DiscountsRevisitPage {
  get continueButton() { return $('page-discounts-revisit [data-test-id=continueBtn]'); }

  async continue() {
    await click(this.continueButton);
    await waitForNot(this.continueButton);
  }
}

export const discountsRevisitPage = new DiscountsRevisitPage();
