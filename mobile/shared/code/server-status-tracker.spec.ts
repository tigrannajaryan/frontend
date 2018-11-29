import { async, TestBed } from '@angular/core/testing';
import { AppMock } from 'ionic-mocks';
import { App } from 'ionic-angular';

import { ENV } from '~/environments/environment.default';
import { ServerUnreachableError, ServerInternalError, ApiFieldAndNonFieldErrors } from './api-errors';
import { Logger } from './logger';
import { ServerStatusTracker } from './server-status-tracker';
import { Severity } from '@sentry/shim';

// Allows to re-declare Sentry.configureScope
const Sentry = require('sentry-cordova');

let instance: ServerStatusTracker;
let sentryScope;

describe('ServerStatusTracker', () => {
  beforeEach(async(() => {
    sentryScope = jasmine.createSpyObj('scope', ['setUser', 'setTag', 'setExtra']);

    Sentry.configureScope = (callback) => { callback(sentryScope) };
    spyOn(Sentry, 'captureException');

    return (
      TestBed
        .configureTestingModule({
          // provide the component-under-test and dependent service
          providers: [
            Logger,
            ServerStatusTracker,
            { provide: App, useClass: AppMock }
          ]
        })
        .compileComponents()
        .then(() => {
          instance = TestBed.get(ServerStatusTracker);
        })
    );
  }));

  it('should create the server tracker', () => {
    expect(instance).toBeTruthy();
  });

  it('should report ServerUnreachableError as warning to Sentry', () => {
    const error = new ServerUnreachableError();
    instance.notify(error);

    if (ENV.production) {
      expect(sentryScope.setTag).toHaveBeenCalledWith('made.severity', Severity.Warning);
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    } else {
      expect(Sentry.captureException).not.toHaveBeenCalled();
    }
  });

  it('should report ServerInternalError as warning to Sentry', () => {
    const error = new ServerInternalError('some error');
    instance.notify(error);

    expect(sentryScope.setTag).toHaveBeenCalledWith('made.severity', Severity.Fatal);
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('should not report ApiFieldAndNonFieldErrors to Sentry', () => {
    const error = new ApiFieldAndNonFieldErrors([]);
    instance.notify(error);

    expect(sentryScope.setTag).not.toHaveBeenCalled();
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });
});
