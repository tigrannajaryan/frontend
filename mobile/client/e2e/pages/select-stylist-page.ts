import { $, by } from 'protractor';
import { click, firstVisible, waitForNot } from '../shared-e2e/utils';

class SelectStylistPage {
  // UI element declarations.
  get stylistCard() {
    return firstVisible(by.css('select-stylist [data-test-id=StylistCard]'));
  }

  // Operations
  async selectStylist() {
    await click(this.stylistCard);
    await waitForNot(this.stylistCard);
  }
}

export const selectStylistPage = new SelectStylistPage();
