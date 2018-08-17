import { ErrorHandler, Injector, NgModule } from '@angular/core';
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
import { getMetaReducers, reducers } from '~/app.reducers';

import { LogoutEffects } from '~/core/effects/logout.effects';

import { AuthEffects } from '~/core/effects/auth.effects';
import { ServicesEffects } from '~/core/effects/services.effects';
import { StylistsEffects } from '~/core/effects/stylists.effects';

import { CoreModule } from '~/core/core.module';
import { DataModule } from '~/core/api/data.module';

import { ServerStatusTracker } from '~/shared/server-status-tracker';

initSentry();

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
