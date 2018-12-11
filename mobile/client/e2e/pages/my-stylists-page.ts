import { $, $$ } from 'protractor';
import { click, globals, waitFor, waitForNot } from '../shared-e2e/utils';

class MyStylistsPage {
  // UI element declarations.
  get stylistSearchBtn() { return $$('my-stylists button[data-test-id=goToStylistSearch]').first(); }
  get savedStylistsBtn() { return $('my-stylists button[data-test-id=savedStylistsBtn]'); }
  get savedStylistsCard() { return $('my-stylists [data-test-id=savedStylistsTabList] stylist-card:first-child'); }
  get savedStylistsCardRemoveBtn() { return $('my-stylists [data-test-id=savedStylistsTabList] stylist-card:first-child [data-test-id=savedStylistRemoveBtn]'); }

  // Operations
  async goToStylistSearch() {
    await waitFor(this.stylistSearchBtn);
    await click(this.stylistSearchBtn);
    await waitForNot(this.stylistSearchBtn);
  }

  async changeTabToSavedStylists() {
    await waitFor(this.savedStylistsBtn);
    await click(this.savedStylistsBtn);
  }

  async selectFirstSavedStylistAndRemoveIt() {
    await waitFor(this.savedStylistsCard);
    await click(this.savedStylistsCard);
    await waitFor(this.savedStylistsCardRemoveBtn);
    await click(this.savedStylistsCardRemoveBtn);
    const alertButton = globals.alertButton('Yes, Remove');
    await click(alertButton);
    await waitForNot(alertButton);
  }
}

export const myStylistsPage = new MyStylistsPage();
