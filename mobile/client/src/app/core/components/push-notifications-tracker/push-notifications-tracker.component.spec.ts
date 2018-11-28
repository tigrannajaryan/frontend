import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Events, NavController, Platform, ToastController } from 'ionic-angular';
import { ToastOptions } from 'ionic-angular/components/toast/toast-options';
import { EventsMock, NavControllerMock, PlatformMock } from 'ionic-mocks';
import { Push } from '@ionic-native/push';
import { of } from 'rxjs/observable/of';
import * as faker from 'faker';

import { PushNotificationEventDetails } from '~/shared/events/shared-event-types';
import { Logger } from '~/shared/logger';
import { NotificationsApi } from '~/shared/push/notifications.api';
import { NotificationsApiMock } from '~/shared/push/notifications.api.mock';
import { PushNotification, PushNotificationCode } from '~/shared/push/push-notification';
import { PushNotificationHandlerParams, PushNotificationToastService, ToastDismissedBy } from '~/shared/push/push-notification-toast';

import { ClientEventTypes } from '~/core/client-event-types';
import { PageNames } from '~/core/page-names';

import { TabIndex } from '~/main-tabs/main-tabs.component';

import { PushNotificationsTrackerComponent } from './push-notifications-tracker.component';

let instance: PushNotificationsTrackerComponent;
let fixture: ComponentFixture<PushNotificationsTrackerComponent>;

describe('PushNotificationTracker (client)', () => {
  beforeEach(async(() =>
    TestBed
      .configureTestingModule({
        declarations: [PushNotificationsTrackerComponent],
        providers: [
          Logger,
          Push, PushNotification, PushNotificationToastService,
          // Ionic mocks:
          { provide: Events, useFactory: () => EventsMock.instance() },
          { provide: NavController, useFactory: () => NavControllerMock.instance() },
          { provide: NotificationsApi, useClass: NotificationsApiMock },
          { provide: Platform, useFactory: () => PlatformMock.instance() },
          {
            provide: ToastController,
            useClass: class ToastControllerMock {
              create = jasmine.createSpy('create').and.returnValue({
                // tslint:disable-next-line:no-null-keyword
                onDidDismiss: callback => callback(null, ToastDismissedBy.CloseClick),
                present: () => undefined
              });
            }
          }
        ]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(PushNotificationsTrackerComponent);
        instance = fixture.componentInstance;

        instance.nav = fixture.debugElement.injector.get(NavController);
      })
  ));

  it('should create the component', () => {
    expect(instance).toBeTruthy();
  });

  it('should handle hint_to_first_book correctly', async done => {
    const api = fixture.debugElement.injector.get(NotificationsApi);
    const events = fixture.debugElement.injector.get(Events);
    const navCtrl = fixture.debugElement.injector.get(NavController);
    const pushToast = fixture.debugElement.injector.get(PushNotificationToastService);
    const toast = fixture.debugElement.injector.get(ToastController);

    // Subscribe to PushNotificationToastService:
    instance.ngOnInit();

    // Private to public:
    const getNotificationParams = (pushToast as any).getNotificationParams.bind(pushToast);
    const getToastOptions = (pushToast as any).getToastOptions.bind(pushToast);
    const handlePushNotificationEvent = (pushToast as any).handlePushNotificationEvent.bind(pushToast);

    const uuid = faker.random.uuid();
    const message = 'New discounts are available with your stylist. Tap to book an appointment.';

    // Create push-notification details:
    const details = new PushNotificationEventDetails(
      /* foreground: */ true,
      /* coldstart: */ false,
      /* uuid: */ uuid,
      /* code: */ PushNotificationCode.hint_to_first_book,
      /* message: */ message
    );

    const handlerParams: PushNotificationHandlerParams = getNotificationParams(details);
    const toastOptions: ToastOptions = getToastOptions(details, handlerParams);

    expect(toastOptions)
      .toEqual({
        ...PushNotificationToastService.defaultToastParams,
        closeButtonText: 'Book',
        message
      });

    spyOn(api, 'ackNotification').and.returnValue(of());
    await handlePushNotificationEvent(details); // handlerParams.onClick() inside

    expect(toast.create)
      .toHaveBeenCalledWith(toastOptions);
    expect(api.ackNotification)
      .toHaveBeenCalledWith({
        message_uuids: [uuid]
      });

    // Test handlerParams.onClick() call:
    expect(navCtrl.setRoot)
      .toHaveBeenCalledWith(PageNames.MainTabs);
    expect(events.publish)
      .toHaveBeenCalledWith(ClientEventTypes.selectMainTab, TabIndex.Home);

    done();
  });

  it('should handle hint_to_select_stylist correctly', async done => {
    const api = fixture.debugElement.injector.get(NotificationsApi);
    const events = fixture.debugElement.injector.get(Events);
    const navCtrl = fixture.debugElement.injector.get(NavController);
    const pushToast = fixture.debugElement.injector.get(PushNotificationToastService);
    const toast = fixture.debugElement.injector.get(ToastController);

    // Subscribe to PushNotificationToastService:
    instance.ngOnInit();

    // Private to public:
    const getNotificationParams = (pushToast as any).getNotificationParams.bind(pushToast);
    const getToastOptions = (pushToast as any).getToastOptions.bind(pushToast);
    const handlePushNotificationEvent = (pushToast as any).handlePushNotificationEvent.bind(pushToast);

    const uuid = faker.random.uuid();
    const message =
      'We noticed that you registered but did not select a stylist. We have <N> stylists available for booking. Tap to see them.';

    const details = new PushNotificationEventDetails(
      /* foreground: */ true,
      /* coldstart: */ false,
      /* uuid: */ uuid,
      /* code: */ PushNotificationCode.hint_to_select_stylist,
      /* message: */ message
    );

    const handlerParams: PushNotificationHandlerParams = getNotificationParams(details);
    const toastOptions: ToastOptions = getToastOptions(details, handlerParams);

    spyOn(api, 'ackNotification').and.returnValue(of());
    await handlePushNotificationEvent(details); // handlerParams.onClick() inside

    expect(toast.create)
      .toHaveBeenCalledWith(toastOptions);
    expect(api.ackNotification)
      .toHaveBeenCalledWith({
        message_uuids: [uuid]
      });

    // Test handlerParams.onClick() call:
    expect(navCtrl.setRoot)
      .toHaveBeenCalledWith(PageNames.MainTabs);
    expect(events.publish)
      .toHaveBeenCalledWith(ClientEventTypes.selectMainTab, TabIndex.Stylists);
    expect(navCtrl.push)
      .toHaveBeenCalledWith(PageNames.StylistSearch);

    done();
  });
});
