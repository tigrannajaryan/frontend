import { $ } from 'protractor';
import { click, waitForNot } from '../shared-e2e/utils';

class DiscountsWeekdayPage {
  get continueButton() { return $('page-discounts-weekday [data-test-id=continueBtn]'); }

  async continue() {
    await click(this.continueButton);
    await waitForNot(this.continueButton);
  }
}

export const discountsWeekdayPage = new DiscountsWeekdayPage();
