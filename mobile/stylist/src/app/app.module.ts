import { HttpClientModule } from '@angular/common/http';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { META_REDUCERS, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyAppComponent } from './app.component';
import { Logger } from './shared/logger';
import { AuthServiceProvider } from './shared/auth-service/auth-service';
import { StylistServiceProvider } from './shared/stylist-service/stylist-service';
import { httpInterceptorProviders } from './shared/http-interceptors';
import { SharedModule } from './shared/shared.module';
import { getMetaReducers, reducers } from './app.reducers';
import { ExampleSharedProvider } from '@shared/example-provider';

@NgModule({
  declarations: [
    MyAppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyAppComponent, {backButtonText: '', backButtonIcon: 'md-arrow-back'}),
    SharedModule,

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
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    AuthServiceProvider,
    StylistServiceProvider,
    httpInterceptorProviders,

    {
      // This allows us to inject Logger into getMetaReducers()
      provide: META_REDUCERS,
      deps: [Logger],
      useFactory: getMetaReducers
    },
    ExampleSharedProvider
  ]
})
export class AppModule { }
