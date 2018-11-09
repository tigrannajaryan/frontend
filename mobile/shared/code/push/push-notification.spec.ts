import { TestBed } from '@angular/core/testing';
import { Events, Platform, NavController } from 'ionic-angular';
import { PlatformMock, NavControllerMock } from 'ionic-mocks';
import { Push, RegistrationEventResponse } from '@ionic-native/push';
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

class PushMock {
  static pushObjectMock = jasmine.createSpyObj('push', {
    on: jasmine.createSpyObj('on', {
      subscribe: jasmine.createSpy('subscribe')
    })
  });
  hasPermission = jasmine.createSpy('hasPermission').and.returnValue(Promise.resolve(true));
  init = jasmine.createSpy('init').and.returnValue(PushMock.pushObjectMock);
}

// These tests are disabled because they cause other tests to fail.
describe('PushNotification', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      // provide the component-under-test and dependent service
      providers: [
        Events,
        Logger,
        { provide: NavController, useFactory: () => NavControllerMock.instance() },
        { provide: NotificationsApi, useClass: NotificationsApiMock },
        { provide: Platform, useFactory: () => PlatformMock.instance() },
        { provide: Push, useClass: PushMock },
        PushNotification
      ]
    });

    instance = TestBed.get(PushNotification);
  });

  it('should create the instance', () => {
    expect(instance).toBeTruthy();
  });

  it('should register/unregister correctly', () => {
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

  it('should init correctly', async done => {
    const navCtrl = TestBed.get(NavController);
    const push = TestBed.get(Push);
    const storage = new AppStorageMock({});
    const fakePage = new FakePrimingScreen();

    await instance.init(navCtrl, fakePage, storage);

    expect(push.hasPermission)
      .toHaveBeenCalled();
    expect(push.init)
      .toHaveBeenCalledWith(PushNotification.pushOptions);

    expect(PushMock.pushObjectMock.on)
      .toHaveBeenCalledWith('registration');
    expect(PushMock.pushObjectMock.on)
      .toHaveBeenCalledWith('notification');
    expect(PushMock.pushObjectMock.on)
      .toHaveBeenCalledWith('error');

    expect(instance.registered())
      .toBe(true);

    done();
  });

  it('should show priming screen', async done => {
    const navCtrl = TestBed.get(NavController);
    const push = TestBed.get(Push);
    const storage = new AppStorageMock({});
    const fakePage = new FakePrimingScreen();

    push.hasPermission = jasmine.createSpy('hasPermission').and.returnValue(Promise.resolve(false));

    await instance.init(navCtrl, fakePage, storage);
    instance.showPermissionScreen(true); // await will not resolve, using setTimeout

    setTimeout(() => {
      expect(navCtrl.setRoot)
        .toHaveBeenCalled();
      expect(instance.primingScreenLastSeen())
        .toBeTruthy();

      done();
    });
  });
});
