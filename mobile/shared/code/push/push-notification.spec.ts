import { async, TestBed } from '@angular/core/testing';
import { Events, IonicModule, Platform } from 'ionic-angular';
import { EventsMock, PlatformMock } from 'ionic-mocks';
import { Push, RegistrationEventResponse } from '@ionic-native/push';
import { of } from 'rxjs/observable/of';
import * as faker from 'faker';

import { isDevelopmentBuild } from '~/shared/get-build-info';
import { Logger } from '~/shared/logger';
import { LoggerMock } from '~/shared/logger.mock';
import { NotificationsApi, RegUnregDeviceRequest } from '~/shared/push/notifications.api';
import { NotificationsApiMock } from '~/shared/push/notifications.api.mock';
import { PushNotification } from '~/shared/push/push-notification';
import { AppStorageMock } from '~/shared/storage/app-storage.mock';

import { appDefinitions } from '~/environments/app-def';
import { ENV } from '~/environments/environment.default';

let instance: PushNotification;

// Modify platform mock
const platformMock = PlatformMock.instance();
platformMock.resume = jasmine.createSpyObj('resume', {
  subscribe() {}
});

describe('PushNotification', () => {
  beforeEach(async(() =>
    TestBed
      .configureTestingModule({
        providers: [
          Push, PushNotification,
          { provide: Logger, useClass: LoggerMock },
          { provide: NotificationsApi, useClass: NotificationsApiMock },
          // Ionic mocks:
          { provide: Events, useFactory: () => EventsMock.instance() },
          { provide: Platform, useFactory: () => platformMock }
        ],
        imports: [
          // Load all Ionic’s deps:
          IonicModule.forRoot(this)
        ]
      })
      .compileComponents()
      .then(() => {
        instance = TestBed.get(PushNotification);
      })
  ));

  it('should create the instance', () => {
    expect(instance).toBeTruthy();
  });

  it('should register/unregister correctly', async () => {
    const api = TestBed.get(NotificationsApi);
    spyOn(api, 'registerDevice').and.returnValue(of());
    spyOn(api, 'unregisterDevice').and.returnValue(of());

    // Initiate device registration
    const registration: RegistrationEventResponse = {
      registrationId: faker.random.uuid()
    };
    instance.onDeviceRegistration(registration);

    // Registration should not happen because we didn't set the user id yet
    expect(api.registerDevice).not.toHaveBeenCalledWith();

    // Now set the user id
    const userUuid = faker.random.uuid();
    instance.setUser(userUuid);

    // Test device register flow
    instance.onDeviceRegistration(registration);

    const regRequest: RegUnregDeviceRequest = {
      device_registration_id: registration.registrationId,
      // hard-coded to fcm since PlatformMock.is() returns hard-coded true and PushNotification first checks that this is 'android'
      device_type: 'fcm',
      is_development_build: isDevelopmentBuild(),
      user_role: appDefinitions.userRole
    };

    expect(api.registerDevice).toHaveBeenCalledWith(regRequest);

    // Test device unregister flow
    instance.setUser(undefined);
    expect(api.unregisterDevice).toHaveBeenCalledWith(regRequest);
  });

  it('should init correctly', async () => {
    const storage = new AppStorageMock({});
    const pushObjectMock = {
      on: jasmine.createSpy('on').and.returnValue({
        subscribe() {}
      })
    };

    const push = TestBed.get(Push);
    spyOn(push, 'hasPermission').and.returnValue(Promise.resolve(true));
    spyOn(push, 'init').and.returnValue(pushObjectMock);

    await instance.init(storage);

    expect(push.hasPermission)
      .toHaveBeenCalled();

    // Initialized:
    expect(push.init)
      .toHaveBeenCalledWith({
        android: {
          senderID: ENV.FCM_PUSH_SENDER_ID
        },
        ios: {
          alert: true,
          badge: true,
          sound: true
        },
        windows: {}
      });

    // Subscribed:
    expect(pushObjectMock.on)
      .toHaveBeenCalledWith('registration');
    expect(pushObjectMock.on)
      .toHaveBeenCalledWith('notification');

    const { isRegistered } = instance as any;
    expect(isRegistered)
      .toBe(true);
  });
});
