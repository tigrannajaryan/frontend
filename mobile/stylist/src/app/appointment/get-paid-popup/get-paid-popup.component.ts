import { Component, OnInit } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

import { StylistAppointmentModel } from '~/shared/api/appointments.models';
import { AddIntegrationRequest, IntegrationsApi, IntegrationTypes } from '~/shared/api/integrations.api';

import { ProfileDataStore } from '~/core/profile.data';
import { StripeOAuthService } from '~/core/stripe-oauth-service';

export interface GetPaidPopupParams {
  appointment: StylistAppointmentModel;
}

@Component({
  selector: 'get-paid-popup',
  templateUrl: 'get-paid-popup.component.html'
})
export class GetPaidPopupComponent implements OnInit {
  params: GetPaidPopupParams;

  constructor(
    private api: IntegrationsApi,
    private navParams: NavParams,
    private profileData: ProfileDataStore,
    private stripe: StripeOAuthService,
    private viewCtrl: ViewController
  ) {
  }

  ngOnInit(): void {
    this.params = (this.navParams.get('params') || {}) as GetPaidPopupParams;
  }

  async onConnectPayout(): Promise<void> {
    const { response: profile } = await this.profileData.get();
    const code = await this.stripe.auth(this.params.appointment.stripe_connect_client_id, profile);
    if (code) {
      const params: AddIntegrationRequest = {
        server_auth_code: code,
        integration_type: IntegrationTypes.stripe_connect
      };
      const { error } = await this.api.addIntegration(params).toPromise();
      if (!error) {
        this.params.appointment.can_checkout_with_made = true;
      }
    }
  }

  async onDismiss(): Promise<void> {
    await this.viewCtrl.dismiss();
  }
}
