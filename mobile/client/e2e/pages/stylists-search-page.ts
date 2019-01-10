import { $, $$ } from 'protractor';

import { click, scroll, waitFor, waitForNot } from '../shared-e2e/utils';
import { stylistProfilePage } from './stylist-profile-page';

class StylistsSearchPage {
  // UI element declarations.
  get goBack() { return $('page-stylists-search button.back-button'); }
  get searchInput() { return $('page-stylists-search input[data-test-id=searchInput]'); }
  get searchingIndicator() { return $('page-stylists-search input[data-test-id=searchingIndicator]'); }

  get card() { return $('page-stylists-search stylist-card:first-child'); }

  get addOneMoreCard() { return $('page-stylists-search stylist-card:nth-child(2)'); }
  get addOneMoreStylistBtn() { return $('page-stylists-search stylist-card:nth-child(2) [data-test-id=addStylist]'); }

  get addNonBookableCard() { return $$('page-stylists-search stylist-card .StylistCard.is-nonBookable').first(); }

  async addFirstStylist() {
    await waitFor(this.searchInput);
    await click(this.card);
    await waitForNot(this.card);

    await click(stylistProfilePage.addStylist);
    await click(stylistProfilePage.goBack);
    await waitForNot(stylistProfilePage.addStylist);
    await waitFor(this.searchInput);
  }

  async addSecondStylist() {
    await waitFor(this.searchInput);
    await click(this.addOneMoreCard);
    await click(this.addOneMoreStylistBtn);
    await waitForNot(this.addOneMoreStylistBtn);
  }

  async addNonBookableStylist() {
    const nonBookable = this.addNonBookableCard;

    await waitFor(this.searchInput);
    await scroll('page-stylists-search .scroll-content', nonBookable);
    await click(nonBookable);
    await click(stylistProfilePage.addStylist);
    await click(stylistProfilePage.goBack);
    await waitForNot(stylistProfilePage.addStylist);
  }
}

export const stylistsSearchPage = new StylistsSearchPage();
