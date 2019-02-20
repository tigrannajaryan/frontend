import { Component } from '@angular/core';
import { LoadingController, ModalController, NavController, NavParams, Platform } from 'ionic-angular';

import { SuccessErrorPopupComponent, SuccessErrorPopupParams } from '~/shared/components/success-error-popup/success-error-popup.component';

import { GoogleOAuthScope, GoogleSignin } from '~/shared/google-signin';
import { AddIntegrationRequest, IntegrationsApi, IntegrationTypes } from '~/shared/api/integrations.api';

import { Logger } from '~/shared/logger';
import { PlatformNames } from '~/shared/constants';
import { ENV } from '~/environments/environment.default';

import webClientIdMap from '~/../../../support/config/webclientid-config.json';
import { MadeDisableOnClick } from '~/shared/utils/loading';

export interface CalendarPrimingParams {
  onSuccess?: Function;
}

@Component({
  selector: 'page-calendar-priming',
  templateUrl: 'calendar-priming.component.html'
})
export class CalendarPrimingComponent {

  private params: CalendarPrimingParams;

  constructor(
    private gs: GoogleSignin,
    private integrationsApi: IntegrationsApi,
    private loadingCtrl: LoadingController,
    private logger: Logger,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private navParams: NavParams,
    private platform: Platform
  ) {
    this.params = this.navParams.get('params') || {};
  }

  @MadeDisableOnClick
  async onEnableCalendarAccess(): Promise<void> {
    // Show loader
    const loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    await loading.present();

    // Start Google Signin process
    let loginResponse;
    try {
      const platformName = this.platform.is(PlatformNames.ios) ? PlatformNames.ios : PlatformNames.android;
      const envName = ENV.production ? 'prod' : 'staging'; // Not type safe, carefull, we read this from json
      const webClientId = webClientIdMap[envName][platformName];

      this.logger.info(`Preparing for Google Signin using webClientId=${webClientId}`);

      // Ask user to login to their Google account and give us access to their calendar
      loginResponse = await this.gs.login(webClientId, [GoogleOAuthScope.CalendarEvents]);
      if (!loginResponse) {
        this.showError();
        return;
      }

      // User gave consent. Remember consent on the backend.
      const request: AddIntegrationRequest = {
        server_auth_code: loginResponse.serverAuthCode,
        integration_type: IntegrationTypes.google_calendar
      };
      const { error } = await this.integrationsApi.addIntegration(request).toPromise();
      if (error) {
        this.showError();
        return;
      }
    } finally {
      loading.dismiss();
    }

    // All done, signin was successful.

    if (this.params.onSuccess) {
      this.params.onSuccess();
    }

    this.showSuccess(loginResponse.email);
  }

  @MadeDisableOnClick
  async onBack(): Promise<void> {
    await this.navCtrl.pop();
  }

  private showSuccess(calendarUserEmail: string): void {
    const params: SuccessErrorPopupParams = {
      isSuccess: true,
      title: 'Success',
      message: `This and future appointments will appear in ${calendarUserEmail} Google Calendar within 15 mins after a new booking.`,
      dismissText: 'Continue'
    };
    const popup = this.modalCtrl.create(SuccessErrorPopupComponent, { params });
    popup.present();

    // Pop our screen from stack. We do it after presenting popup, so that actual poping is not visible to user
    this.navCtrl.pop();
  }

  private showError(): void {
    const params: SuccessErrorPopupParams = {
      isSuccess: false,
      title: 'Integration Unsuccessful',
      message: 'Please try to enable syncronization with Google Calendar later.'
    };
    const popup = this.modalCtrl.create(SuccessErrorPopupComponent, { params });
    popup.present();

    // Pop our screen from stack. We do it after presenting popup, so that actual poping is not visible to user
    this.navCtrl.pop();
  }
}
