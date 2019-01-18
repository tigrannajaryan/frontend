import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { NavController } from 'ionic-angular';
import { Page } from 'ionic-angular/navigation/nav-util';

import { ExternalAppService } from '~/shared/utils/external-app-service';
import { InputTypes } from '~/shared/api/base.models';

import { PageNames } from '~/core/page-names';
import { StylistSettings, StylistSettingsKeys } from '~/shared/api/stylist-app.models';
import { StylistServiceProvider } from '~/core/api/stylist.service';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.component.html'
})
export class SettingsComponent {
  PageNames = PageNames;
  settings: StylistSettings;

  constructor(
    private navCtrl: NavController,
    private externalAppService: ExternalAppService,
    private stylistService: StylistServiceProvider
  ) {
  }

  async ionViewWillLoad(): Promise<void> {
    const { response } = await this.stylistService.getStylistSettings().toPromise();
    if (response) {
      this.settings = response;
    }
  }

  navigateToTaxRate(): void {
    const params: any = {
      title: 'Tax Rate Percentage',
      name: StylistSettingsKeys.tax_percentage,
      inputType: InputTypes.tel,
      value: [
        this.settings.tax_percentage,
        [Validators.required, Validators.max(99.99), Validators.pattern(/^[0-9]*$/)]
      ]
    };
    this.navCtrl.push(PageNames.SettingsField, { params });
  }

  navigateToCardFee(): void {
    const params: any = {
      title: 'Card Fee Percentage',
      name: StylistSettingsKeys.card_fee_percentage,
      inputType: InputTypes.tel,
      value: [
        this.settings.card_fee_percentage,
        [Validators.required, Validators.max(99.99), Validators.pattern(/^[0-9]*$/)]
      ]
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
