import { $ } from 'protractor';
import { click, waitForNot } from '../shared-e2e/utils';

class DiscountsFirstVisitPage {
  get continueButton() { return $('page-discounts-first-booking [data-test-id=continueBtn]'); }

  async continue() {
    await click(this.continueButton);
    await waitForNot(this.continueButton);
  }
}

export const discountsFirstVisitPage = new DiscountsFirstVisitPage();
