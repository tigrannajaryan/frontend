import { $ } from 'protractor';
import { click, waitForNot } from '../shared-e2e/utils';

class HomePage {
  // UI element declarations.
  get bookBtn() { return $('page-home [data-test-id=bookLink]'); }
  get searchBtn() { return $('page-home [data-test-id=searchBtn]'); }

  // Operations
  async startBooking() {
    await click(this.bookBtn);
    await waitForNot(this.bookBtn);
  }

  async startSearch() {
    await click(this.searchBtn);
    await waitForNot(this.searchBtn);
  }
}

export const homePage = new HomePage();
