import { browser } from 'protractor';

import { firstPage } from './pages/first-page';

describe('First Page', () => {

  beforeAll(async () => {
    await browser.get('');
  });

  it('should have a Log in button and Register link', () => {
    expect(firstPage.getStartedBtn.isPresent()).toBeTruthy();
  });

  it('should have correct text for Get Started button', () => {
    expect(firstPage.getStartedBtn.getText()).toContain('Get Started');
  });
});
