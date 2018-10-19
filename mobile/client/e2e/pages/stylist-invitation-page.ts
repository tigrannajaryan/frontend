import { $ } from 'protractor';

import { waitFor, waitForNot } from '../shared-e2e/utils';

class StylistInvitationPage {
  // UI element declarations.
  get startBtn() { return $('page-stylist button.StylistInvitationPage-submit'); }
  get salonName() { return $('page-stylist .StylistInvitationPage-salonName'); }
  get stylistName() { return $('page-stylist .StylistInvitationPage-name'); }
  get address() { return $('page-stylist .StylistInvitationPage-address'); }
  get stylistPhone() { return $('page-stylist .StylistInvitationPage-phone'); }

  // Operations
  async getStarted() {
    await waitFor(this.startBtn);
    await this.startBtn.click();
    await waitForNot(this.startBtn);
  }
}

export const stylistInvitationPage = new StylistInvitationPage();
