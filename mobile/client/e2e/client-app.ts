import { browser } from 'protractor';

import { clearIonicStorage } from './shared-e2e/utils';

/**
 * ClientApp definition
 */
class ClientApp {
  async loadNew() {
    await clearIonicStorage();
    await browser.get('');
  }
}

export const clientApp = new ClientApp();
