import { Component } from '@angular/core';
import { ModalController, NavController, Platform } from 'ionic-angular';

import { SuccessErrorPopupComponent, SuccessErrorPopupParams } from '~/shared/components/success-error-popup/success-error-popup.component';

import { GoogleOAuthScope, GoogleSignin } from '~/shared/google-signin';
import { AddIntegrationRequest, IntegrationsApi, IntegrationTypes } from '~/shared/api/integrations.api';

import { PlatformNames } from '~/shared/constants';
import { ENV } from '~/environments/environment.default';

import webClientIdMap from '~/../../../support/config/webclientid-config.json';

@Component({
  selector: 'page-calendar-priming',
  templateUrl: 'calendar-priming.component.html'
})
export class CalendarPrimingComponent {

  constructor(
    private gs: GoogleSignin,
    private integrationsApi: IntegrationsApi,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private platform: Platform
  ) {
  }

  async onEnableCalendarAccess(): Promise<void> {
    const platformName = this.platform.is(PlatformNames.ios) ? PlatformNames.ios : PlatformNames.android;
    const envName = ENV.production ? 'prod' : 'staging'; // Not type safe, carefull, we read this from json
    const webClientId = webClientIdMap[envName][platformName];

    // Ask user to login to their Google account and give us access to their calendar
    const response = await this.gs.login(webClientId, [GoogleOAuthScope.CalendarEvents]);
    if (!response) {
      this.showError();
      return;
    }

    // User gave consent. Remember consent on the backend.
    const request: AddIntegrationRequest = {
      server_auth_code: response.serverAuthCode,
      integration_type: IntegrationTypes.google_calendar
    };
    const { error } = await this.integrationsApi.addIntegration(request).toPromise();
    if (error) {
      this.showError();
      return;
    }
    this.showSuccess(response.email);
  }

  onBack(): void {
    this.navCtrl.pop();
  }

  private showSuccess(calendarUserEmail: string): void {
    const params: SuccessErrorPopupParams = {
      isSuccess: true,
      title: 'Success',
      message: `This and future appointments will appear in ${calendarUserEmail} Google Calendar.`,
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
