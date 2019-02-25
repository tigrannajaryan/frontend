import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { NavController } from 'ionic-angular';
import { Page } from 'ionic-angular/navigation/nav-util';

import { ExternalAppService } from '~/shared/utils/external-app-service';
import { InputTypes } from '~/shared/api/base.models';
import { AddIntegrationRequest, IntegrationsApi, IntegrationTypes } from '~/shared/api/integrations.api';

import { PageNames } from '~/core/page-names';
import { StylistSettings, StylistSettingsKeys } from '~/shared/api/stylist-app.models';
import { StylistServiceProvider } from '~/core/api/stylist.service';
import { ProfileDataStore } from '~/core/profile.data';
import { StripeOAuthService } from '~/core/stripe-oauth-service';
import { SettingsFieldComponentParams } from '~/settings/settings-field/settings-field.component';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.component.html'
})
export class SettingsComponent {
  PageNames = PageNames;
  settings: StylistSettings;

  constructor(
    private integrationsApi: IntegrationsApi,
    private navCtrl: NavController,
    private externalAppService: ExternalAppService,
    private profileData: ProfileDataStore,
    private stripe: StripeOAuthService,
    private stylistService: StylistServiceProvider
  ) {
  }

  async ionViewWillLoad(): Promise<void> {
    const { response: settings } = await this.stylistService.getStylistSettings().toPromise();
    this.settings = settings;
  }

  async navigateToAddPayout(): Promise<void> {
    const { response: profile } = await this.profileData.get();
    const code = await this.stripe.auth(this.settings.stripe_connect_client_id, profile);
    if (code) {
      const params: AddIntegrationRequest = {
        server_auth_code: code,
        integration_type: IntegrationTypes.stripe_connect
      };
      const { error } = await this.integrationsApi.addIntegration(params).toPromise();
      if (!error) {
        this.settings.can_checkout_with_made = true;
      }
    }
  }

  navigateToTaxRate(): void {
    const params: SettingsFieldComponentParams = {
      title: 'Tax Rate Percentage',
      name: StylistSettingsKeys.tax_percentage,
      inputType: InputTypes.number,
      value: [
        this.settings.tax_percentage,
        [
          Validators.required,
          Validators.pattern(/^(\d{1,2})(\.\d{1,3})?$/)
        ]
      ],
      onSave: async (val: number) => {
        this.settings.tax_percentage = val;
        await this.stylistService.setStylistSettings(this.settings).toPromise();
      }
    };
    this.navCtrl.push(PageNames.SettingsField, { params });
  }

  navigateTo(page: Page, params?: any): void {
    this.navCtrl.push(page, params);
  }

  async onContactByEmail(mailTo: string): Promise<void> {
    this.externalAppService.openMailApp(mailTo);
  }
}
