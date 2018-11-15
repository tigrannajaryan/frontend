import { Component } from '@angular/core';
import { ModalController, NavController } from 'ionic-angular';

import { SuccessErrorPopupComponent, SuccessErrorPopupParams } from '~/shared/components/success-error-popup/success-error-popup.component';

// TODO: uncomment
// import { StylistServiceProvider } from '~/core/api/stylist.service';
// import { GoogleIntegrationService, GoogleOAuthResponse } from '~/core/google-integration-service';

@Component({
  selector: 'page-calendar-priming',
  templateUrl: 'calendar-priming.component.html'
})
export class CalendarPrimingComponent {

  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController
    // TODO: uncomment
    // private gi: GoogleIntegrationService,
    // private stylistService: StylistServiceProvider
  ) {
  }

  async onEnableCalendarAccess(): Promise<void> {
    // TODO: uncomment
    // const response: GoogleOAuthResponse | void = await this.requestCalendarAccess();
    const response = await this.requestCalendarAccess();
    if (!response) {
      this.showError();
      return;
    }
    try {
      // TODO: uncomment
      // await this.stylistService.setGoogleOAuthTokens(response.serverAuthCode, response.refreshToken).toPromise();
    } catch {
      this.showError();
      return;
    }
    // TODO: uncomment
    // this.showSuccess(response.email);
    this.showSuccess('');
  }

  onBack(): void {
    this.navCtrl.pop();
  }

  // tslint:disable-next-line
  private requestCalendarAccess(): Promise<boolean> {
  // TODO: uncomment
  // private requestCalendarAccess(): Promise<GoogleOAuthResponse | void> {
    return Promise.resolve(true);
    // TODO: uncomment
    // return this.gi.addGoogleCalendarBackendSupport(webClientId);
  }

  private showSuccess(calendarUserEmail: string): void {
    const params: SuccessErrorPopupParams = {
      isSuccess: true,
      title: 'Success',
      message: `This and future appointments will appear in ${calendarUserEmail} Google Calendar.`,
      dismissText: 'Continue',
      onDidDismiss: () => {
        this.onBack();
      }
    };
    const popup = this.modalCtrl.create(SuccessErrorPopupComponent, { params });
    popup.present();
  }

  private showError(): void {
    const params: SuccessErrorPopupParams = {
      isSuccess: false,
      title: 'Integration Unsuccessful',
      message: 'Please try to enable syncronization with Google Calendar later.'
    };
    const popup = this.modalCtrl.create(SuccessErrorPopupComponent, { params });
    popup.present();
  }
}
