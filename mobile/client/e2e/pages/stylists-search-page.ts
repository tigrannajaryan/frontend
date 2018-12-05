import { $, by, element } from 'protractor';

import { click, firstVisible, globals, waitFor, waitForNot } from '../shared-e2e/utils';

class StylistsSearchPage {
  // UI element declarations.
  get searchInput() { return $('page-stylists-search input[data-test-id=searchInput]'); }
  get searchingIndicator() { return $('page-stylists-search input[data-test-id=searchingIndicator]'); }

  get card() { return $('page-stylists-search stylist-card:first-child'); }
  get addStylist() { return $('page-stylists-search stylist-card:first-child [data-test-id=addStylist]'); }

  get addOneMoreCard() { return $('page-stylists-search stylist-card:nth-child(2)'); }
  get addOneMoreStylistBtn() { return $('page-stylists-search stylist-card:nth-child(2) [data-test-id=addStylist]'); }

  get addNonBookableCard() { return $('page-stylists-search stylist-card .StylistCard.is-hearted'); }
  get addNonBookableStylistBtn() { return element.all(by.css('page-stylists-search stylist-card .StylistCard.is-hearted.is-active [data-test-id=savedStylistSaveBtn]')).first(); }

  get saveNonBookableModalButton() { return $('ion-modal [data-test-id=confirmSavingStylist]'); }

  async addFirstStylist() {
    await waitFor(this.searchInput);
    await click(this.card);
    await click(this.addStylist);
    await waitForNot(this.addStylist);
  }

  async addSecondStylist() {
    await waitFor(this.searchInput);
    await click(this.addOneMoreCard);
    await click(this.addOneMoreStylistBtn);
    await waitForNot(this.addOneMoreStylistBtn);
  }

  async addNonBookableStylist() {
    await waitFor(this.searchInput);
    await click(this.addNonBookableCard);
    await click(this.addNonBookableStylistBtn);
    await waitForNot(this.addNonBookableStylistBtn);
    await waitFor(this.saveNonBookableModalButton);
    await click(this.saveNonBookableModalButton);
    await waitForNot(this.saveNonBookableModalButton);
  }
}

export const stylistsSearchPage = new StylistsSearchPage();
