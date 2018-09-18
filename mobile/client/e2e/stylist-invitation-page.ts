import { $ } from 'protractor';

import { waitFor, waitForNot } from './shared-e2e/utils';

class StylistInvitationPage {
  // UI element declarations.
  get startBtn() { return $('page-stylist-invitation button.StylistInvitationPage-submit'); }
  get salonName() { return $('page-stylist-invitation .StylistInvitationPage-salonName'); }
  get stylistName() { return $('page-stylist-invitation .StylistInvitationPage-name'); }
  get address() { return $('page-stylist-invitation .StylistInvitationPage-address'); }
  get stylistPhone() { return $('page-stylist-invitation .StylistInvitationPage-phone'); }

  // Operations
  async getStarted() {
    await waitFor(this.startBtn);
    await this.startBtn.click();
    await waitForNot(this.startBtn);
  }
}

export const stylistInvitationPage = new StylistInvitationPage();
