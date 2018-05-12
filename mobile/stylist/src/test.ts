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

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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

import { AlertControllerMock, ConfigMock, LoadingControllerMock, PlatformMock } from 'ionic-mocks';
import { WorktimeApi } from './app/worktime/worktime.api';
import { WorktimeApiMock } from './app/worktime/worktime.api.mock';
import { AuthServiceProvider } from './app/shared/auth-service/auth-service';
import { AuthServiceProviderMock } from './app/shared/auth-service/auth-service-mock';

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

  static beforeEachCompiler(components: any[]): Promise<{ fixture: any, instance: any }> {
    return TestUtils.configureIonicTestingModule(components)
      .compileComponents()
      .then(() => {
        const fixture: any = TestBed.createComponent(components[0]);

        return {
          fixture,
          instance: fixture.debugElement.componentInstance
        };
      });
  }

  static configureIonicTestingModule(components: any[]): typeof TestBed {
    return TestBed.configureTestingModule({
      declarations: [
        ...components
      ],
      providers: [
        App, Form, Keyboard, DomController, MenuController, NavController,
        NavParams, GestureController, AlertControllerMock, LoadingControllerMock,
        { provide: Platform, useFactory: () => PlatformMock.instance() },
        { provide: Config, useFactory: () => ConfigMock.instance() },
        { provide: DeepLinker, useFactory: () => ConfigMock.instance() },
        { provide: AlertController, useFactory: () => AlertControllerMock.instance() },
        { provide: LoadingController, useFactory: () => LoadingControllerMock.instance() },
        { provide: AuthServiceProvider, useClass: AuthServiceProviderMock },
        { provide: WorktimeApi, useClass: WorktimeApiMock }
      ],
      imports: [
        FormsModule,
        IonicModule,
        ReactiveFormsModule
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
