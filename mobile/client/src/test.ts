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
  NavController,
  NavParams,
  Platform
} from 'ionic-angular';

import { AppAvailability } from '@ionic-native/app-availability';
import { Camera } from '@ionic-native/camera';
import { Clipboard } from '@ionic-native/clipboard';
import { EmailComposer } from '@ionic-native/email-composer';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { StatusBar } from '@ionic-native/status-bar';
import { Storage } from '@ionic/storage';

import {
  AlertControllerMock,
  ConfigMock,
  EventsMock,
  LoadingControllerMock,
  NavControllerMock,
  PlatformMock,
  StatusBarMock,
  StorageMock
} from 'ionic-mocks';

import { ExternalAppService } from '~/shared/utils/external-app-service';

import { SharedSingletonsModule } from '~/shared/shared-singletons.module';
import { CoreModule } from '~/core/core.module';

// ngrx
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { Logger } from '~/shared/logger';

import { AppModule } from '~/app.module';

import { AppointmentsApi } from '~/core/api/appointments.api';
import { AppointmentsApiMock } from '~/core/api/appointments.api.mock';
import { AuthService } from '~/shared/api/auth.api';
import { AuthServiceMock } from '~/shared/api/auth.api.mock';
import { BookingApi } from '~/core/api/booking.api';
import { BookingApiMock } from '~/core/api/booking.api.mock';
import { ServicesService } from '~/core/api/services-service';
import { ServicesServiceMock } from '~/core/api/services-service.mock';
import { StylistsService } from '~/core/api/stylists-service';
import { StylistsServiceMock } from '~/core/api/stylists-service.mock';
import { ProfileApi } from '~/core/api/profile-api';
import { ProfileApiMock } from '~/core/api/profile-api.mock';

import { authPath, authReducer } from '~/shared/storage/auth.reducer';
import { profilePath, profileReducer } from '~/core/reducers/profile.reducer';
import { stylistsPath, stylistsReducer } from '~/core/reducers/stylists.reducer';
import { servicesPath, servicesReducer } from '~/core/reducers/services.reducer';

import { LogoutEffects } from '~/core/effects/logout.effects';
import { AuthEffects } from '~/shared/storage/auth.effects';
import { ServicesEffects } from '~/core/effects/services.effects';
import { StylistsEffects } from '~/core/effects/stylists.effects';

import { AuthProcessState } from '~/shared/storage/auth-process-state';
import { AuthProcessStateMock } from '~/shared/storage/auth-process-state.mock';

import { DataModule } from '~/core/api/data.module';
import { BaseService } from '~/shared/api/base-service';

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

export class TestUtils {

  static beforeEachCompiler(components: any[], providers: any[] = [], imports: any = []): Promise<{ fixture: any, instance: any }> {
    // Hide warnings in console:
    spyOn(window.console, 'warn');

    return TestUtils.configureIonicTestingModule(components, providers, imports)
      .compileComponents()
      .then(() => {
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
        App, Form, Keyboard, DomController, Logger, MenuController, NavController,
        NavParams, GestureController, AlertControllerMock, LoadingControllerMock,
        Clipboard, EmailComposer, ProfileApiMock, ActionSheetController, BaseService,
        Camera,
        { provide: AlertController, useFactory: () => AlertControllerMock.instance() },
        { provide: Config, useFactory: () => ConfigMock.instance() },
        { provide: DeepLinker, useFactory: () => ConfigMock.instance() },
        { provide: Events, useFactory: () => EventsMock.instance() },
        { provide: LoadingController, useFactory: () => LoadingControllerMock.instance() },
        { provide: NavController, useFactory: () => NavControllerMock.instance() },
        { provide: Platform, useFactory: () => PlatformMock.instance() },
        { provide: StatusBar, useFactory: () => StatusBarMock.instance() },
        { provide: Storage, useFactory: () => StorageMock.instance() },
        { provide: AuthProcessState, useClass: AuthProcessStateMock },
        ExternalAppService,
        {
          provide: InAppBrowser,
          useClass: class InAppBrowserMock {
            create = jasmine.createSpy('create').and.returnValue(
              jasmine.createSpyObj('instance', { show: Promise.resolve() })
            );
          }
        },
        {
          provide: AppAvailability,
          useClass: class AppAvailabilityMock {
            check = jasmine.createSpy('check').and.returnValue(Promise.resolve(true));
          }
        },
        // API
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: AppointmentsApi, useClass: AppointmentsApiMock },
        { provide: BookingApi, useClass: BookingApiMock },
        { provide: ServicesService, useClass: ServicesServiceMock },
        { provide: StylistsService, useClass: StylistsServiceMock },
        { provide: ProfileApi, useClass: ProfileApiMock },
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
        StoreModule.forFeature(authPath, authReducer),
        StoreModule.forFeature(profilePath, profileReducer),
        StoreModule.forFeature(stylistsPath, stylistsReducer),
        StoreModule.forFeature(servicesPath, servicesReducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([
          LogoutEffects,
          AuthEffects,
          ServicesEffects,
          StylistsEffects
        ]),
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
