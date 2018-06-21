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
import { AuthApiService } from '~/core/auth-api-service/auth-api-service';
import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { httpInterceptorProviders } from '~/core/http-interceptors';
import { CoreModule } from '~/core/core.module';
import { getMetaReducers, reducers } from './app.reducers';
import { UnhandledErrorHandler } from '~/shared/unhandled-error-handler';
import { initSentry } from '~/shared/sentry';

initSentry();

@NgModule({
  declarations: [
    MyAppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyAppComponent, {backButtonText: '', backButtonIcon: 'md-arrow-back'}),
    CoreModule,

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
    EffectsModule.forRoot([])
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
