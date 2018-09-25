import { $ } from 'protractor';
import { click, waitForNot } from '../shared-e2e/utils';

class InvitationsPage {
  get skipButton() { return $('page-invitations [data-test-id=skipBtn]'); }
  get continueButton() { return $('page-invitations [data-test-id=continueBtn]'); }

  async skip() {
    await click(this.skipButton);
    await waitForNot(this.skipButton);
  }
}

export const invitationsPage = new InvitationsPage();
