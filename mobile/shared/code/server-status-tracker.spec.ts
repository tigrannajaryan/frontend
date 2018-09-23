import { TestBed } from '@angular/core/testing';
import { AppMock, NavControllerMock } from 'ionic-mocks';
import { App } from 'ionic-angular';
import * as Sentry from 'sentry-cordova';

import { ServerUnreachableError, ServerInternalError, ApiFieldAndNonFieldErrors, ApiClientError, HttpStatus } from './api-errors';
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
    spyOn(Sentry, 'setTagsContext');

    const error = new ServerUnreachableError();
    instance.notify(error);

    expect(Sentry.setTagsContext).toHaveBeenCalledWith({ 'made.severity': Severity.Warning });
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('should report ServerUnreachableError as warning to Sentry', async () => {
    spyOn(Sentry, 'captureException');
    spyOn(Sentry, 'setTagsContext');

    const error = new ServerInternalError('some error');
    instance.notify(error);

    expect(Sentry.setTagsContext).toHaveBeenCalledWith({ 'made.severity': Severity.Fatal });
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });

  it('should not report ApiFieldAndNonFieldErrors to Sentry', async () => {
    spyOn(Sentry, 'captureException');
    spyOn(Sentry, 'setTagsContext');

    const error = new ApiFieldAndNonFieldErrors([]);
    instance.notify(error);

    expect(Sentry.setTagsContext).not.toHaveBeenCalled();
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });
});
