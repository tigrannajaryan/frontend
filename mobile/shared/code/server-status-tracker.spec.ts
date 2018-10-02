import { TestBed } from '@angular/core/testing';
import { AppMock } from 'ionic-mocks';
import { App } from 'ionic-angular';
import * as Sentry from 'sentry-cordova';

import { ENV } from '~/environments/environment.default';
import { ServerUnreachableError, ServerInternalError, ApiFieldAndNonFieldErrors } from './api-errors';
import { Logger } from './logger';
import { ServerStatusTracker } from './server-status-tracker';
import { Severity } from '@sentry/shim';

let instance: ServerStatusTracker;

describe('ServerStatusTracker', () => {
  beforeAll(() => {
    TestBed.configureTestingModule({
      // provide the component-under-test and dependent service
      providers: [
        Logger,
        ServerStatusTracker,
        { provide: App, useClass: AppMock }
      ]
    });

    instance = TestBed.get(ServerStatusTracker);
  });

  it('should create the server tracker', async () => {
    expect(instance).toBeTruthy();
  });

  it('should report ServerUnreachableError as warning to Sentry', async () => {
    spyOn(Sentry, 'captureException');
    spyOn(Sentry, 'configureScope');

    const error = new ServerUnreachableError();
    instance.notify(error);

    if (ENV.production) {
      expect(Sentry.configureScope).toHaveBeenCalledWith(jasmine.any(Function));
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    } else {
      expect(Sentry.captureException).not.toHaveBeenCalled();
    }
  });

  it('should report ServerInternalError as warning to Sentry', async () => {
    spyOn(Sentry, 'captureException');
    spyOn(Sentry, 'configureScope');

    const error = new ServerInternalError('some error');
    instance.notify(error);

    expect(Sentry.configureScope).toHaveBeenCalledWith(jasmine.any(Function));
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('should not report ApiFieldAndNonFieldErrors to Sentry', async () => {
    spyOn(Sentry, 'captureException');
    spyOn(Sentry, 'configureScope');

    const error = new ApiFieldAndNonFieldErrors([]);
    instance.notify(error);

    expect(Sentry.configureScope).not.toHaveBeenCalled();
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });
});
