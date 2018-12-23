import { $ } from 'protractor';
import { click, waitForNot } from '../shared-e2e/utils';

class PhotoAddPage {
  get skipButton() { return $('stylist-photo [data-test-id=skipBtn]'); }

  async skip() {
    await click(this.skipButton);
    await waitForNot(this.skipButton);
  }
}

export const photoAddPage = new PhotoAddPage();
