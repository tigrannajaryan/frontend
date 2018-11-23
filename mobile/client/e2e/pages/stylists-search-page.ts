import { $ } from 'protractor';

import { click, waitFor, waitForNot } from '../shared-e2e/utils';

class StylistsSearchPage {
  // UI element declarations.
  get searchInput() { return $('page-stylists-search input[data-test-id=searchInput]'); }
  get searchingIndicator() { return $('page-stylists-search input[data-test-id=searchingIndicator'); }

  get card() { return $('page-stylists-search stylist-card:first-child'); }
  get addStylist() { return $('page-stylists-search stylist-card:first-child [data-test-id=addStylist]'); }

  async addFirstStylist() {
    await waitFor(this.searchInput);
    await click(this.card);
    await click(this.addStylist);
    await waitForNot(this.addStylist);
  }
}

export const stylistsSearchPage = new StylistsSearchPage();
