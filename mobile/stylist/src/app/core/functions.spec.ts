import { async, TestBed } from '@angular/core/testing';
import { Events, IonicModule, Platform } from 'ionic-angular';
import { EventsMock, PlatformMock } from 'ionic-mocks';
import { Push } from '@ionic-native/push';

import { StylistProfileStatus } from '~/shared/api/stylist-app.models';
import { Logger } from '~/shared/logger';
import { NotificationsApi } from '~/shared/push/notifications.api';
import { NotificationsApiMock } from '~/shared/push/notifications.api.mock';
import { PushNotification } from '~/shared/push/push-notification';

import { AppModule } from '~/app.module';
import { createNavHistoryList } from './functions';
import { PageNames } from './page-names';

let pushNotification: PushNotification;

describe('Shared functions: profileStatusToPage', () => {
  beforeEach(async(() =>
    TestBed
      .configureTestingModule({
        providers: [
          Logger,
          Push, PushNotification,
          { provide: NotificationsApi, useClass: NotificationsApiMock },
          // Ionic mocks:
          { provide: Events, useFactory: () => EventsMock.instance() },
          { provide: Platform, useFactory: () => PlatformMock.instance() }
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
        { page: PageNames.RegisterSalon }
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

    expect(await createNavHistoryList(profileStatus))
      .toEqual([{ page: PageNames.HomeSlots }]);

    done();
  });

  it('should correctly map half complete profile to the correct list', async done => {
    // Half profile
    const profileStatus: StylistProfileStatus = {
      has_business_hours_set: true,
      has_invited_clients: false,
      has_other_discounts_set: false,
      has_personal_data: true,
      has_picture_set: true,
      has_services_set: true,
      has_weekday_discounts_set: false
    };

    expect(await createNavHistoryList(profileStatus))
      .toEqual([
        { page: PageNames.FirstScreen },
        { page: PageNames.RegisterSalon },
        { page: PageNames.Services },
        { page: PageNames.WorkHours },
        { page: PageNames.DiscountsWeekday }
      ]);

    done();
  });
});
