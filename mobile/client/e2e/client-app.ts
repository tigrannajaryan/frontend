import { browser } from 'protractor';

import { clearIonicStorage, clearSessionData } from './shared-e2e/utils';

/**
 * ClientApp definition
 */
class ClientApp {
  async loadNew() {
    await browser.restart();
    await clearIonicStorage();
    await browser.get('');
    await clearSessionData();
  }
}

export const clientApp = new ClientApp();
