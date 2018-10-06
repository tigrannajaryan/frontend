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
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/withLatestFrom';

import { getTestBed, TestBed } from '@angular/core/testing';

import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

import {
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
  LoadingControllerMock,
  NavControllerMock,
  PlatformMock,
  PopoverControllerMock,
  StatusBarMock
} from 'ionic-mocks';

import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { AppAvailability } from '@ionic-native/app-availability';
import { InAppBrowser } from '@ionic-native/in-app-browser';

import { AppModule } from '~/app.module';

import { AuthApiService } from '~/shared/stylist-api/auth-api-service';
import { AuthApiServiceMock } from '~/shared/stylist-api/auth-api-service-mock';
import { ClientsApi } from '~/shared/stylist-api/clients-api';
import { ClientsApiMock } from '~/shared/stylist-api/clients-api.mock';
import { ClientDetailsApi } from '~/shared/stylist-api/client-details.api';
import { ClientDetailsApiMock } from '~/shared/stylist-api/client-details.api.mock';
import { StylistServiceProvider } from '~/shared/stylist-api/stylist-service';
import { StylistServiceMock } from '~/shared/stylist-api/stylist-service-mock';
import { WorktimeApi } from '~/shared/stylist-api/worktime.api';
import { WorktimeApiMock } from '~/shared/stylist-api/worktime.api.mock';

import { ExternalAppService } from '~/shared/utils/external-app-service';

import { AppStorage } from '~/shared/storage/app-storage';
import { AppStorageMock } from '~/shared/storage/app-storage-mock';
import { HomeService } from '~/shared/stylist-api/home.service';
import { HomeServiceMock } from '~/shared/stylist-api/home.service.mock';

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
        { provide: App, useClass: AppMock },
        { provide: Platform, useFactory: () => PlatformMock.instance() },
        { provide: StatusBar, useFactory: () => StatusBarMock.instance() },
        { provide: Config, useFactory: () => ConfigMock.instance() },
        { provide: DeepLinker, useFactory: () => ConfigMock.instance() },
        { provide: AlertController, useFactory: () => AlertControllerMock.instance() },
        { provide: LoadingController, useFactory: () => LoadingControllerMock.instance() },
        { provide: NavController, useFactory: () => NavControllerMock.instance() },
        { provide: Events, useFactory: () => EventsMock.instance() },
        { provide: PopoverController, useClass: PopoverControllerMock },
        { provide: GoogleAnalytics, useClass: GoogleAnalyticsMock },
        { provide: AppStorage, useClass: AppStorageMock },
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
        // the API
        { provide: AuthApiService, useClass: AuthApiServiceMock },
        { provide: ClientsApi, useClass: ClientsApiMock },
        { provide: ClientDetailsApi, useClass: ClientDetailsApiMock },
        { provide: HomeService, useClass: HomeServiceMock },
        { provide: StylistServiceProvider, useClass: StylistServiceMock },
        { provide: WorktimeApi, useClass: WorktimeApiMock },
        ...providers
      ],
      imports: [
        IonicModule,
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
