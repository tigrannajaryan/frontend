import { $ } from 'protractor';
import { click, waitForNot } from '../shared-e2e/utils';

class HomePage {
  // UI element declarations.
  get bookBtn() { return $('page-home [data-test-id=bookLink]'); }

  // Operations
  async startBooking() {
    await click(this.bookBtn);
    await waitForNot(this.bookBtn);
  }
}

export const homePage = new HomePage();
