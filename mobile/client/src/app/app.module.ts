import { enableProdMode, ErrorHandler, Injector, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { IonicApp, IonicModule } from 'ionic-angular';

import { AppVersion } from '@ionic-native/app-version';
import { Clipboard } from '@ionic-native/clipboard';
import { EmailComposer } from '@ionic-native/email-composer';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { META_REDUCERS, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { Logger } from '~/shared/logger';
import { initSentry } from '~/shared/sentry';
import { SharedSingletonsModule } from '~/shared/shared-singletons.module';

import { AuthInterceptor } from '~/core/http-interceptors/auth-interceptor';
import { ClientUnhandledErrorHandler } from '~/core/unhandled-error-handler';

import { ClientAppComponent } from '~/app.component';
import { getMetaReducers } from '~/app.reducers';

import { LogoutEffects } from '~/core/effects/logout.effects';

import { AuthEffects } from '~/auth/auth.effects';
import { ServicesEffects } from '~/core/effects/services.effects';
import { StylistsEffects } from '~/core/effects/stylists.effects';

import { CoreModule } from '~/core/core.module';
import { DataModule } from '~/core/api/data.module';

import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { BaseService } from '~/core/api/base-service';

import { authPath, authReducer } from '~/auth/auth.reducer';
import { profilePath, profileReducer } from '~/core/reducers/profile.reducer';
import { stylistsPath, stylistsReducer } from '~/core/reducers/stylists.reducer';
import { servicesPath, servicesReducer } from '~/core/reducers/services.reducer';

import { ENV } from '~/environments/environment.default';

// Init sentry reporting (inits only if ENV.sentryDsn):
initSentry();

if (ENV.production) {
  // Enable Angular’s production mode:
  enableProdMode();
}

@NgModule({
  declarations: [
    ClientAppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    CoreModule,
    SharedSingletonsModule,
    DataModule.forRoot(),

    IonicModule.forRoot(ClientAppComponent, {
      backButtonText: '',
      backButtonIcon: 'ios-arrow-round-back'
    }),
    IonicStorageModule.forRoot(),

    /**
     * StoreModule.forRoot is imported once in the root module, accepting a reducer
     * function or object map of reducer functions. If passed an object of
     * reducers, combineReducers will be run creating your application
     * meta-reducer. This returns all providers for an @ngrx/store
     * based application.
     *
     * Using forFeature in order to fix empty initial state error, for more info see
     * - https://github.com/ngrx/store/issues/401
     * - https://forum.ionicframework.com/t/ngrx-state-does-not-work-in-production-build/107226/3
     */
    StoreModule.forRoot({}),
    StoreModule.forFeature(authPath, authReducer),
    StoreModule.forFeature(profilePath, profileReducer),
    StoreModule.forFeature(stylistsPath, stylistsReducer),
    StoreModule.forFeature(servicesPath, servicesReducer),

    /**
     * EffectsModule.forRoot() is imported once in the root module and
     * sets up the effects class to be initialized immediately when the
     * application starts.
     *
     * See: https://github.com/ngrx/platform/blob/master/docs/effects/api.md#forroot
     */
    EffectsModule.forRoot([
      LogoutEffects,

      AuthEffects,
      ServicesEffects,
      StylistsEffects
    ])
  ],

  bootstrap: [IonicApp],

  entryComponents: [
    ClientAppComponent
  ],
  providers: [
    Logger,

    // Plugins
    AppVersion,
    Clipboard,
    EmailComposer,
    SplashScreen,
    StatusBar,
    ScreenOrientation,

    // Shared:
    BaseService,
    ServerStatusTracker,

    { // Add auth token to all requests
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor, multi: true
    },

    {
      // Our custom handler for unhandled exceptions
      provide: ErrorHandler,
      useClass: ClientUnhandledErrorHandler
    },

    {
      // This allows us to inject Logger into getMetaReducers()
      provide: META_REDUCERS,
      deps: [Logger],
      useFactory: getMetaReducers
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
