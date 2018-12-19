import { $ } from 'protractor';
import { click, waitForNot } from '../shared-e2e/utils';

class InstagramConnectPage {
  get skipButton() { return $('connect-instagram [data-test-id=skipBtn]'); }

  async skip() {
    await click(this.skipButton);
    await waitForNot(this.skipButton);
  }
}

export const instagramConnectPage = new InstagramConnectPage();
