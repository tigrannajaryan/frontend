import { $ } from 'protractor';

import { click, waitForNot } from './utils';

class PushPrimingPage {
  // UI element declarations.
  get allowBtn() { return $('push-priming-screen button[data-test-id=allowBtn]'); }

  // Operations
  async allow() {
    await click(this.allowBtn);
    await waitForNot(this.allowBtn);
  }
}

export const pushPrimingPage = new PushPrimingPage();
