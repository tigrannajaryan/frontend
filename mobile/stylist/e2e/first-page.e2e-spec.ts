import { browser } from 'protractor';

import { firstPage } from './first-page';

describe('First Page', () => {

  beforeAll(() => {
    browser.get('');
  });

  it('should have a Log in button and Register link', () => {
    expect(firstPage.loginBtn.isPresent()).toBeTruthy();
    expect(firstPage.registerLink.isPresent()).toBeTruthy();
  });

  it('should have correct text for Log in button', () => {
    expect(firstPage.loginBtn.getText()).toContain('Log in');
  });
});
