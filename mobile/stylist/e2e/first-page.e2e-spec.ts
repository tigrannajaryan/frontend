import { browser } from 'protractor';

import { firstPage } from './pages/first-page';

describe('First Page', () => {

  beforeAll(() => {
    browser.get('');
  });

  it('should have a Log in button and Register link', () => {
    expect(firstPage.loginBtn.isPresent()).toBeTruthy();
    // expect(firstPage.registerLink.isPresent()).toBeTruthy();
  });

  it('should have correct text for Get Started button', () => {
    expect(firstPage.loginBtn.getText()).toContain('Get Started');
  });
});
