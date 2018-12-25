import { async, TestBed } from '@angular/core/testing';
import { Events, IonicModule, Platform } from 'ionic-angular';
import { EventsMock, PlatformMock } from 'ionic-mocks';
import { Push } from '@ionic-native/push';

import { StylistProfileStatus } from '~/shared/api/stylist-app.models';
import { Logger } from '~/shared/logger';
import { NotificationsApi } from '~/shared/push/notifications.api';
import { NotificationsApiMock } from '~/shared/push/notifications.api.mock';
import { PushNotification } from '~/shared/push/push-notification';

import { StylistAppStorage } from '~/core/stylist-app-storage';
import { StylistAppStorageMock } from '~/core/stylist-app-storage.mock';

import { AppModule } from '~/app.module';
import { createNavHistoryList } from './functions';
import { PageNames } from './page-names';

let pushNotification: PushNotification;

// Modify platform mock
const platformMock = PlatformMock.instance();
platformMock.resume = jasmine.createSpyObj('resume', {
  subscribe() {}
});

describe('Shared functions: profileStatusToPage', () => {
  beforeEach(async(() =>
    TestBed
      .configureTestingModule({
        providers: [
          Logger,
          Push, PushNotification,
          { provide: NotificationsApi, useClass: NotificationsApiMock },
          { provide: StylistAppStorage, useClass: StylistAppStorageMock },
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
        AppModule.injector = TestBed;
        pushNotification = TestBed.get(PushNotification);
      })
  ));

  it('should correctly map undefined profile status to RegisterSalon', async done => {
    // No profile
    expect(await createNavHistoryList(undefined))
      .toEqual([
        { page: PageNames.FirstScreen },
        { page: PageNames.FieldEdit, params: { params: { control: 'first_name' } } }
      ]);

    done();
  });

  it('should correctly map fully complete profile completeness to home screen', async done => {
    // Full profile
    const profileStatus: StylistProfileStatus = {
      has_business_hours_set: true,
      has_invited_clients: true,
      has_other_discounts_set: true,
      has_personal_data: true,
      has_picture_set: true,
      has_services_set: true,
      has_weekday_discounts_set: true
    };

    spyOn(pushNotification, 'needToShowPermissionScreen').and.returnValue(
      Promise.resolve(false) // skip push notification priming screen
    );

    const storage = TestBed.get(StylistAppStorage);
    spyOn(storage, 'get').and.returnValue(true);

    expect(await createNavHistoryList(profileStatus))
      .toEqual([{ page: PageNames.HomeSlots }]);

    done();
  });
});
