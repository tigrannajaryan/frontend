import { async, TestBed } from '@angular/core/testing';
import * as faker from 'faker';

import { TestUtils } from '~/../test';
import { InstagramOAuthService } from './instagram-oauth-service';

type Callback = (...args: any[]) => any;

class BrowserWindowMock {
  close = jasmine.createSpy('close');

  private listeners = new Map<string, Callback>();

  addEventListener(event: string, callback: Callback): void {
    this.listeners.set(event, callback);
  }

  getEventListener(event: string): Callback {
    return this.listeners.get(event);
  }
}

const browserWindowMockInstance = new BrowserWindowMock();

const inAppBrowser = {
  open: jasmine.createSpy('open').and.returnValue(
    browserWindowMockInstance
  )
};

(window as any).cordova = {
  InAppBrowser: inAppBrowser
};

let instance: InstagramOAuthService;

describe('InstagramOAuthService', () => {
  beforeEach(async(() =>
    TestUtils.beforeEachCompiler([], [InstagramOAuthService])
      .then(() => {
        instance = TestBed.get(InstagramOAuthService);
      })
  ));

  it('should create the service', () => {
    expect(instance).toBeTruthy();
  });

  it('should correctly do auth', async done => {
    const fakeClientId = faker.random.uuid();
    const fakeToken = faker.random.alphaNumeric();

    instance.auth(fakeClientId)
      .then(token => {
        expect(browserWindowMockInstance.close)
          .toHaveBeenCalled();

        expect(token)
          .toBe(fakeToken);

        done();
      });

    const baseUrl = 'https://api.instagram.com/oauth/authorize/';
    const redirectTo = 'https://madebeauty.com/';

    expect(inAppBrowser.open)
      .toHaveBeenCalledWith(
        `${baseUrl}?redirect_uri=${redirectTo}&response_type=token&client_id=${fakeClientId}`,
        '_blank', 'location=no,hidden=yes,clearsessioncache=yes,clearcache=yes,closebuttoncaption=Cancel'
      );

    // Trigger loadstart
    browserWindowMockInstance.getEventListener('loadstart')({
      type: 'loadstart',
      url: `${redirectTo}#access_token=${fakeToken}`
    });
  });
});
