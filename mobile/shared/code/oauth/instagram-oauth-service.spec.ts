import { async, TestBed } from '@angular/core/testing';
import { IonicModule } from 'ionic-angular';
import * as faker from 'faker';

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
    TestBed
      .configureTestingModule({
        providers: [
          InstagramOAuthService
        ],
        imports: [
          // Load all Ionic’s deps:
          IonicModule.forRoot(this)
        ]
      })
      .compileComponents()
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

    expect(inAppBrowser.open)
      .toHaveBeenCalledWith(
        `${InstagramOAuthService.baseUrl}?client_id=${fakeClientId}&redirect_uri=${InstagramOAuthService.redirectTo}&response_type=token`,
        '_blank', 'location=no,clearsessioncache=yes,clearcache=yes,closebuttoncaption=Cancel'
      );

    // Trigger loadstart
    browserWindowMockInstance.getEventListener('loadstart')({
      type: 'loadstart',
      url: `${InstagramOAuthService.redirectTo}#access_token=${fakeToken}`
    });
  });
});
