import { $ } from 'protractor';

class StylistsSearchPage {
  // UI element declarations.
  get searchInput() { return $('page-stylists-search input[data-test-id=searchInput]'); }

  get card() { return $('page-stylists-search stylist-card'); }
  get addStylist() { return $('page-stylists-search stylist-card [data-test-id=addStylist]'); }
}

export const stylistsSearchPage = new StylistsSearchPage();
