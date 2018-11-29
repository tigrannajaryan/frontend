import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Events, IonicModule, NavParams, Platform } from 'ionic-angular';
import { EventsMock, PlatformMock } from 'ionic-mocks';
import { Push } from '@ionic-native/push';

import { PushPrimingScreenComponent, PushPrimingScreenParams } from '~/shared/components/push-priming-screen/push-priming-screen.component';
import { Logger } from '~/shared/logger';
import { NotificationsApi } from '~/shared/push/notifications.api';
import { NotificationsApiMock } from '~/shared/push/notifications.api.mock';
import { PushNotification } from '~/shared/push/push-notification';

let fixture: ComponentFixture<PushPrimingScreenComponent>;
let instance: PushPrimingScreenComponent;

describe('PushPrimingScreenComponent', () => {
  beforeEach(async(() =>
    TestBed
      .configureTestingModule({
        declarations: [PushPrimingScreenComponent],
        providers: [
          Logger, NavParams,
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
        fixture = TestBed.createComponent(PushPrimingScreenComponent);
        instance = fixture.componentInstance;
      })
      .then(() => {
        const navParams = fixture.debugElement.injector.get(NavParams);
        const params: PushPrimingScreenParams = {
          onContinue: jasmine.createSpy('onContinue')
        };
        navParams.data = { params };
        instance.ngOnInit();
      })
  ));

  it('should create the page', () => {
    expect(instance).toBeTruthy();
  });

  it('should call refreshLastPrimingScreenShowTime on loaded', () => {
    const pushNotification = fixture.debugElement.injector.get(PushNotification);
    spyOn(pushNotification, 'refreshLastPrimingScreenShowTime');

    instance.ionViewDidLoad();

    expect(pushNotification.refreshLastPrimingScreenShowTime)
      .toHaveBeenCalled();
  });

  it('should call getSystemPermissionAndRegister before continue on allow', async done => {
    const pushNotification = fixture.debugElement.injector.get(PushNotification);
    spyOn(pushNotification, 'getSystemPermissionAndRegister');

    instance.ngOnInit();
    await instance.onAllowClick();

    // Make public:
    const { params } = instance as any;

    expect(pushNotification.getSystemPermissionAndRegister)
      .toHaveBeenCalled();
    expect(params.onContinue)
      .toHaveBeenCalled();

    done();
  });

  it('should call only onContinue on disallow', () => {
    const pushNotification = fixture.debugElement.injector.get(PushNotification);
    spyOn(pushNotification, 'getSystemPermissionAndRegister');

    instance.ngOnInit();
    instance.onNotNowClick();

    // Make public:
    const { params } = instance as any;

    expect(pushNotification.getSystemPermissionAndRegister)
      .not.toHaveBeenCalled();
    expect(params.onContinue)
      .toHaveBeenCalled();
  });
});
