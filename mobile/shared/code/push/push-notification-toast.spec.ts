import * as faker from 'faker';

import { TestBed } from '@angular/core/testing';
import { Events, NavController, Platform, ToastController } from 'ionic-angular';
import { NavControllerMock, PlatformMock, ToastControllerMock } from 'ionic-mocks';

import { PushNotificationEventDetails, SharedEventTypes } from '~/shared/events/shared-event-types';
import { PushNotificationToastService } from '~/shared/push/push-notification-toast';
import { PushNotificationCode } from '~/shared/push/push-notification';
import { Logger } from '~/shared/logger';

import { NotificationsApi } from './notifications.api';
import { NotificationsApiMock } from './notifications.api.mock';

let instance: PushNotificationToastService;

describe('PushNotificationToast', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      // provide the component-under-test and dependent service
      providers: [
        Events,
        Logger,
        { provide: NavController, useFactory: () => NavControllerMock.instance() },
        { provide: NotificationsApi, useClass: NotificationsApiMock },
        { provide: Platform, useFactory: () => PlatformMock.instance() },
        { provide: ToastController, useFactory: () => ToastControllerMock.instance() },
        PushNotificationToastService
      ]
    });

    instance = TestBed.get(PushNotificationToastService);
  });

  it('should create the instance', () => {
    expect(instance).toBeTruthy();
  });

  it('should show toast on notification event', () => {
    const events = TestBed.get(Events);
    const toastCtrl = TestBed.get(ToastController);

    const notificationDetails = new PushNotificationEventDetails(
      true, true, faker.random.uuid(),
      PushNotificationCode.hint_to_first_book,
      'New discounts are available with your stylist. Tap to book an appointment.'
    );

    events.publish(SharedEventTypes.pushNotification, notificationDetails);

    expect(toastCtrl.create)
      .toHaveBeenCalled();
  });
});
