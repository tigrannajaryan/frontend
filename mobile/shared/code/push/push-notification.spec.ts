import { TestBed } from '@angular/core/testing';
import { Events, Platform, NavController } from 'ionic-angular';
import { PlatformMock, NavControllerMock } from 'ionic-mocks';
import { Push, RegistrationEventResponse } from '@ionic-native/push';
import { Page } from 'ionic-angular/navigation/nav-util';
import * as faker from 'faker';

import { Logger } from '~/shared/logger';
import { PushNotification } from '~/shared/push/push-notification';
import { NotificationsApi, RegUnregDeviceRequest } from './notifications.api';
import { NotificationsApiMock } from './notifications.api.mock';
import { AppStorageMock } from '~/shared/storage/app-storage.mock';
import { isDevelopmentBuild } from '~/shared/get-build-info';
import { appDefinitions } from '~/environments/app-def';

let instance: PushNotification;

function FakePrimingScreen() {
}

// These tests are disabled because they cause other tests to fail.
// TODO: understand what's going on and fit it.
xdescribe('PushNotification', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      // provide the component-under-test and dependent service
      providers: [
        Events,
        Logger,
        { provide: NavController, useFactory: () => NavControllerMock.instance() },
        { provide: NotificationsApi, useClass: NotificationsApiMock },
        { provide: Platform, useFactory: () => PlatformMock.instance() },
        Push,
        PushNotification
      ]
    });

    instance = TestBed.get(PushNotification);
  });

  it('should create the instance', () => {
    expect(instance).toBeTruthy();
  });

  it('should register/unregister correctly', async () => {
    const api = TestBed.get(NotificationsApi);
    spyOn(api, 'registerDevice');
    spyOn(api, 'unregisterDevice');

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
    const navCtrl = TestBed.get(NavController);
    const storage = new AppStorageMock({});
    const fakePage = new FakePrimingScreen();
    await instance.init(navCtrl, fakePage, storage);

    // TODO: verify initialization
  });
});
