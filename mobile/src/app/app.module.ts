import { HttpClientModule } from '@angular/common/http';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyAppComponent } from './app.component';
import { ListComponent } from '../pages/list/list';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { httpInterceptorProviders } from '../http-interceptors';
import { StylistServiceProvider } from '../providers/stylist-service/stylist-service';
import { StoreService } from '../providers/store/store';
import { StoreServiceHelper } from '../providers/store/store-helper';

@NgModule({
  declarations: [
    MyAppComponent,
    ListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyAppComponent, {backButtonText: '', backButtonIcon: 'md-arrow-back'})
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyAppComponent,
    ListComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthServiceProvider,
    StylistServiceProvider,
    httpInterceptorProviders,
    StoreService,
    StoreServiceHelper
  ]
})
export class AppModule {}
