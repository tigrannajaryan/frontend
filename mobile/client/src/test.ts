// This file is based on https://github.com/lathonez/clicker which has MIT license.
// Tests are set up using instructions here http://lathonez.com/2018/ionic-2-unit-testing/
//
// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/dist/long-stack-trace-zone';
import 'zone.js/dist/proxy.js';
import 'zone.js/dist/sync-test';
import 'zone.js/dist/jasmine-patch';
import 'zone.js/dist/async-test';
import 'zone.js/dist/fake-async-test';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/withLatestFrom';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { getTestBed, TestBed } from '@angular/core/testing';

import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';

import {
  ActionSheetController,
  AlertController,
  App,
  Config,
  DeepLinker,
  DomController,
  Events,
  Form,
  GestureController,
  IonicModule,
  Keyboard,
  LoadingController,
  MenuController,
  ModalController,
  NavController,
  NavParams,
  Platform,
  ToastController
} from 'ionic-angular';

import { AppAvailability } from '@ionic-native/app-availability';
import { Camera } from '@ionic-native/camera';
import { Clipboard } from '@ionic-native/clipboard';
import { EmailComposer } from '@ionic-native/email-composer';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { StatusBar } from '@ionic-native/status-bar';
import { Storage } from '@ionic/storage';
import { Push } from '@ionic-native/push';

import {
  AlertControllerMock,
  ConfigMock,
  EventsMock,
  LoadingControllerMock,
  ModalControllerMock,
  NavControllerMock,
  PlatformMock,
  StatusBarMock,
  StorageMock,
  ToastControllerMock
} from 'ionic-mocks';

import { BrMaskerModule } from 'brmasker-ionic-3';

import { ExternalAppService } from './app/shared/utils/external-app-service';
import { GeolocationService } from './app/shared/utils/geolocation.service';
import { GeolocationServiceMock } from './app/shared/utils/geolocation.service.mock';
import { PushNotification } from './app/shared/push/push-notification';
import { SharedSingletonsModule } from './app/shared/shared-singletons.module';
import { CoreModule } from './app/core/core.module';

// ngrx
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { Logger } from './app/shared/logger';
import { LoggerMock } from './app/shared/logger.mock';

import { AppModule } from './app/app.module';

import { AppointmentsApi } from './app/core/api/appointments.api';
import { AppointmentsApiMock } from './app/core/api/appointments.api.mock';
import { AuthService } from './app/shared/api/auth.api';
import { AuthServiceMock } from './app/shared/api/auth.api.mock';
import { MadeAnalyticsApi } from './app/shared/api/made-analytics.api';
import { MadeAnalyticsApiMock } from './app/shared/api/made-analytics.api.mock';

import { BookingApi } from './app/core/api/booking.api';
import { BookingApiMock } from './app/core/api/booking.api.mock';
import { ServicesService } from './app/core/api/services.service';
import { ServicesServiceMock } from './app/core/api/services.service.mock';
import { StylistsService } from './app/core/api/stylists.service';
import { StylistsServiceMock } from './app/core/api/stylists.service.mock';
import { ProfileApi } from './app/core/api/profile-api';
import { ProfileApiMock } from './app/core/api/profile-api.mock';

import { profilePath, profileReducer } from './app/core/reducers/profile.reducer';
import { servicesPath, servicesReducer } from './app/core/reducers/services.reducer';

import { LogoutEffects } from './app/core/effects/logout.effects';
import { ServicesEffects } from './app/core/effects/services.effects';

import { AuthProcessState } from './app/shared/storage/auth-process-state';
import { AuthProcessStateMock } from './app/shared/storage/auth-process-state.mock';

import { DataModule } from './app/core/api/data.module';
import { BaseService } from './app/shared/api/base.service';
import { FollowersApiMock } from './app/core/api/followers.api.mock';
import { FollowersApi } from './app/core/api/followers.api';
import { ClientStartupNavigation } from './app/core/client-startup-navigation';

import { BookingData } from './app/core/api/booking.data';
import { BookingDataMock } from './app/core/api/booking.data.mock';

declare const require: any;

// First, initialize the Angular testing environment.
getTestBed()
  .initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
// Then we find all the tests.
const context: any = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys()
  .map(context);

// Modify platform mock
const platformMock = PlatformMock.instance();
platformMock.resume = jasmine.createSpyObj('resume', {
  subscribe() {}
});

export class TestUtils {

  static beforeEachCompiler(components: any[], providers: any[] = [], imports: any = []): Promise<{ fixture: any, instance: any }> {
    // Hide warnings in console:
    spyOn(window.console, 'warn');

    return TestUtils.configureIonicTestingModule(components, providers, imports)
      .compileComponents()
      .then(() => {
        if (components.length === 0) {
          return;
        }

        const fixture: any = TestBed.createComponent(components[0]);

        // Needed to use AppModule.injector.get(…):
        AppModule.injector = fixture.debugElement.injector;

        return {
          fixture,
          instance: fixture.debugElement.componentInstance
        };
      });
  }

  static configureIonicTestingModule(components: any[], providers: any[] = [], imports: any = []): typeof TestBed {
    return TestBed.configureTestingModule({
      declarations: [
        ...components
      ],
      providers: [
        App, Form, Keyboard, DomController, MenuController, NavController,
        NavParams, GestureController, AlertControllerMock, LoadingControllerMock,
        Clipboard, EmailComposer, ProfileApiMock, ActionSheetController, BaseService,
        PushNotification, Push, ClientStartupNavigation,
        Camera,
        { provide: AlertController, useFactory: () => AlertControllerMock.instance() },
        { provide: ModalController, useFactory: () => ModalControllerMock.instance() },
        { provide: Config, useFactory: () => ConfigMock.instance() },
        { provide: DeepLinker, useFactory: () => ConfigMock.instance() },
        { provide: Events, useFactory: () => EventsMock.instance() },
        { provide: LoadingController, useFactory: () => LoadingControllerMock.instance() },
        { provide: NavController, useFactory: () => NavControllerMock.instance() },
        { provide: Platform, useFactory: () => platformMock },
        { provide: StatusBar, useFactory: () => StatusBarMock.instance() },
        { provide: Storage, useFactory: () => StorageMock.instance() },
        { provide: ToastController, useFactory: () => ToastControllerMock.instance() },
        { provide: AuthProcessState, useClass: AuthProcessStateMock },
        LaunchNavigator, ExternalAppService,
        { provide: GeolocationService, useClass: GeolocationServiceMock },
        {
          provide: AppAvailability,
          useClass: class AppAvailabilityMock {
            check = jasmine.createSpy('check').and.returnValue(Promise.resolve(true));
          }
        },
        { provide: Logger, useClass: LoggerMock },
        // API
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: AppointmentsApi, useClass: AppointmentsApiMock },
        { provide: BookingApi, useClass: BookingApiMock },
        { provide: ServicesService, useClass: ServicesServiceMock },
        { provide: StylistsService, useClass: StylistsServiceMock },
        { provide: ProfileApi, useClass: ProfileApiMock },
        { provide: FollowersApi, useClass: FollowersApiMock },
        { provide: BookingData, useClass: BookingDataMock },
        { provide: MadeAnalyticsApi, useClass: MadeAnalyticsApiMock },
        ...providers
      ],
      imports: [
        FormsModule,
        IonicModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        // Common for app
        SharedSingletonsModule,
        CoreModule,
        DataModule.forRoot(),
        // Store
        StoreModule.forRoot({}),
        StoreModule.forFeature(profilePath, profileReducer),
        StoreModule.forFeature(servicesPath, servicesReducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([
          LogoutEffects,
          ServicesEffects
        ]),
        BrMaskerModule,
        ...imports
      ]
    });
  }

  // http://stackoverflow.com/questions/2705583/how-to-simulate-a-click-with-javascript
  static eventFire(el: any, etype: string): void {
    if (el.fireEvent) {
      el.fireEvent(`on${etype}`);
    } else {
      const evObj: any = document.createEvent('Events');
      evObj.initEvent(etype, true, false);
      el.dispatchEvent(evObj);
    }
  }
}
