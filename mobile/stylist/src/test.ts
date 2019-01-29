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

import 'rxjs/add/observable/from';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/withLatestFrom';

import * as moment from 'moment';

import { getTestBed, TestBed } from '@angular/core/testing';

import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

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
  Haptic,
  IonicModule,
  Keyboard,
  LoadingController,
  MenuController,
  NavController,
  NavParams,
  Platform,
  PopoverController
} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';

import {
  AlertControllerMock,
  AppMock,
  ConfigMock,
  EventsMock,
  GoogleAnalyticsMock,
  HapticMock,
  LoadingControllerMock,
  NavControllerMock,
  PlatformMock,
  PopoverControllerMock,
  StatusBarMock
} from 'ionic-mocks';

import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { AppAvailability } from '@ionic-native/app-availability';
import { Clipboard } from '@ionic-native/clipboard';
import { EmailComposer } from '@ionic-native/email-composer';
import { DatePicker } from '@ionic-native/date-picker';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { profileReducer, profileStatePath } from '~/core/components/made-menu-header/profile.reducer';
import { ProfileEffects } from '~/core/components/made-menu-header/profile.effects';

import { ClientsApi } from '~/core/api/clients-api';
import { ClientsApiMock } from '~/core/api/clients-api.mock';
import { ClientDetailsApi } from '~/core/api/client-details.api';
import { ClientDetailsApiMock } from '~/core/api/client-details.api.mock';
import { StylistServiceProvider } from '~/core/api/stylist.service';
import { StylistServiceMock } from '~/core/api/stylist.service.mock';
import { WorktimeApi } from '~/core/api/worktime.api';
import { WorktimeApiMock } from '~/core/api/worktime.api.mock';

import { MadeAnalyticsApi } from './app/shared/api/made-analytics.api';
import { MadeAnalyticsApiMock } from './app/shared/api/made-analytics.api.mock';

import { ExternalAppService } from '~/shared/utils/external-app-service';
import { Logger } from '~/shared/logger';
import { LoggerMock } from '~/shared/logger.mock';

import { GoogleSignin } from '~/shared/google-signin';

import { StylistAppStorage } from '~/core/stylist-app-storage';
import { StylistAppStorageMock } from '~/core/stylist-app-storage.mock';
import { HomeService } from '~/core/api/home.service';
import { HomeServiceMock } from '~/core/api/home.service.mock';

import { AppModule } from '~/app.module';

declare const require: any;
declare const console: any;

console.warn = jasmine.createSpy('console.warn');

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
    return TestUtils.configureIonicTestingModule(components, providers, imports)
      .compileComponents()
      .then(() => {
        const fixture: any = TestBed.createComponent(components[0]);

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
        Clipboard, EmailComposer, Logger, ActionSheetController,
        { provide: App, useClass: AppMock },
        { provide: Logger, useClass: LoggerMock },
        { provide: Platform, useFactory: () => PlatformMock.instance() },
        { provide: StatusBar, useFactory: () => StatusBarMock.instance() },
        { provide: Config, useFactory: () => ConfigMock.instance() },
        { provide: DeepLinker, useFactory: () => ConfigMock.instance() },
        { provide: AlertController, useFactory: () => AlertControllerMock.instance() },
        { provide: LoadingController, useFactory: () => LoadingControllerMock.instance() },
        { provide: NavController, useFactory: () => NavControllerMock.instance() },
        { provide: Events, useFactory: () => EventsMock.instance() },
        { provide: Haptic, useFactory: () => HapticMock.instance() },
        { provide: PopoverController, useClass: PopoverControllerMock },
        { provide: GoogleAnalytics, useClass: GoogleAnalyticsMock },
        { provide: StylistAppStorage, useClass: StylistAppStorageMock },
        ExternalAppService, GoogleSignin,
        {
          provide: AppAvailability,
          useClass: class AppAvailabilityMock {
            check = jasmine.createSpy('check').and.returnValue(Promise.resolve(true));
          }
        },
        {
          provide: DatePicker,
          useClass: class DatePickerMock {
            // https://stackoverflow.com/questions/36267237/how-to-correctly-set-androidtheme-in-cordova-plugin-datepicker-plugin
            ANDROID_THEMES = {
              THEME_TRADITIONAL: 1,
              THEME_HOLO_DARK: 2,
              THEME_HOLO_LIGHT: 3,
              THEME_DEVICE_DEFAULT_DARK: 4,
              THEME_DEVICE_DEFAULT_LIGHT: 5
            };
            show = jasmine.createSpy('show').and.returnValue(
              Promise.resolve(moment().format())
            );
          }
        },
        // the API
        { provide: ClientsApi, useClass: ClientsApiMock },
        { provide: ClientDetailsApi, useClass: ClientDetailsApiMock },
        { provide: HomeService, useClass: HomeServiceMock },
        { provide: StylistServiceProvider, useClass: StylistServiceMock },
        { provide: WorktimeApi, useClass: WorktimeApiMock },
        { provide: MadeAnalyticsApi, useClass: MadeAnalyticsApiMock },
        ...providers
      ],
      imports: [
        IonicModule,
        // ngrx
        StoreModule.forRoot({}),
        StoreModule.forFeature(profileStatePath, profileReducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([ProfileEffects]),
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
