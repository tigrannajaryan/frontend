import { HttpClientModule } from '@angular/common/http';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, Injector, NgModule } from '@angular/core';
import { META_REDUCERS, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { IonicApp, IonicModule } from 'ionic-angular';

import { MyAppComponent } from './app.component';
import { Logger } from './shared/logger';
import { AuthApiService } from '~/core/api/auth-api-service/auth-api-service';
import { StylistServiceProvider } from '~/core/api/stylist-service/stylist-service';
import { httpInterceptorProviders } from '~/core/http-interceptors';
import { CoreModule } from '~/core/core.module';
import { getMetaReducers, reducers } from './app.reducers';
import { UnhandledErrorHandler } from '~/shared/unhandled-error-handler';
import { initSentry } from '~/shared/sentry';
import { AppVersion } from '@ionic-native/app-version';
import { AgmCoreModule, LAZY_MAPS_API_CONFIG } from '@agm/core';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ENV } from '../environments/environment.default';
import { HomeEffects } from '~/core/effects/home.effects';
import { ProfileEffects } from '~/core/effects/profile.effects';
import { HomeService } from '~/core/api/home/home.service';
import { ClientsEffects } from '~/core/effects/clients.effects';
import { AppointmentDatesEffects } from '~/core/effects/appointment-dates.effects';
import { AppointmentDatesServiceMock } from '~/core/api/appointment/appointment-dates-service-mock';
import { ClientsService } from '~/core/api/clients/clients-service';
import { ServicesEffects } from '~/core/effects/services.effects';
import { DiscountsApi } from '~/core/api/discounts/discounts.api';
import { GoogleMapsConfig } from '~/core/google-maps-config';
import { AppStorage } from '~/core/app-storage';

initSentry();

const imports = [
  AgmCoreModule.forRoot(),
  BrowserModule,
  HttpClientModule,
  CoreModule
];

if (!ENV.production) {
  imports.push(StoreDevtoolsModule.instrument());
}

@NgModule({
  declarations: [
    MyAppComponent
  ],

  imports: [
    IonicModule.forRoot(MyAppComponent, {
      backButtonText: '',
      backButtonIcon: 'md-arrow-back',
      tabsHideOnSubPages: true
    }),

    /**
     * StoreModule.forRoot is imported once in the root module, accepting a reducer
     * function or object map of reducer functions. If passed an object of
     * reducers, combineReducers will be run creating your application
     * meta-reducer. This returns all providers for an @ngrx/store
     * based application.
     */
    StoreModule.forRoot(reducers),

    /**
     * EffectsModule.forRoot() is imported once in the root module and
     * sets up the effects class to be initialized immediately when the
     * application starts.
     *
     * See: https://github.com/ngrx/platform/blob/master/docs/effects/api.md#forroot
     */
    EffectsModule.forRoot([
      HomeEffects,
      ProfileEffects,
      ClientsEffects,
      AppointmentDatesEffects,
      ServicesEffects
    ]),

    ...imports
  ],

  bootstrap: [IonicApp],

  entryComponents: [
    MyAppComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AuthApiService,
    StylistServiceProvider,
    httpInterceptorProviders,
    AppVersion,
    AppStorage,

    HomeService,
    AppointmentDatesServiceMock,
    ClientsService,
    DiscountsApi,

    {
      // Our custom handler for unhandled exceptions
      provide: ErrorHandler,
      useClass: UnhandledErrorHandler
    },

    {
      // This allows us to inject Logger into getMetaReducers()
      provide: META_REDUCERS,
      deps: [Logger],
      useFactory: getMetaReducers
    },
    {
      // Override google maps config
      provide: LAZY_MAPS_API_CONFIG, useClass: GoogleMapsConfig
    }
  ]
})
export class AppModule {
  /**
   * Allows for retrieving singletons using `AppModule.injector.get(MyService)`
   * This is good to prevent injecting the service as constructor parameter.
   */
  static injector: Injector;

  constructor(injector: Injector) {
    AppModule.injector = injector;
  }
}
