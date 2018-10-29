import { $ } from 'protractor';

class StylistsSearchPage {
  // UI element declarations.
  get searchInput() { return $('page-stylists-search input[data-test-id=searchInput]'); }
}

export const stylistsSearchPage = new StylistsSearchPage();
