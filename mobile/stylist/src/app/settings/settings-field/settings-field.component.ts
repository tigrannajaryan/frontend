import { Component } from '@angular/core';
import { FormControl, ValidatorFn } from '@angular/forms';
import { AbstractControlOptions } from '@angular/forms/src/model';
import { NavController, NavParams } from 'ionic-angular';

import { StylistServiceProvider } from '~/core/api/stylist.service';
import { StylistSettings, StylistSettingsKeys } from '~/shared/api/stylist-app.models';

export interface SettingsFieldComponentParams {
  title: string;
  name: StylistSettingsKeys;
  inputType: string;
  value: [any, ValidatorFn | ValidatorFn[] | AbstractControlOptions | null];
}

@Component({
  selector: 'settings-field',
  templateUrl: 'settings-field.component.html'
})
export class SettingsFieldComponent {
  params: SettingsFieldComponentParams;
  control: FormControl;

  constructor(
    private navCtrl: NavController,
    private stylistService: StylistServiceProvider,
    private navParams: NavParams
  ) {
  }

  ionViewDidEnter(): void {
    this.params = this.navParams.get('params') as SettingsFieldComponentParams;

    if (this.params && this.params.value) {
      this.control = new FormControl(...this.params.value);
    } else {
      throw new Error('SettingsField should have params');
    }
  }

  async onSave(): Promise<void> {
    if (this.control.valid) {
      const data: StylistSettings = {
        [this.params.name]: this.control.value
      };

      await this.stylistService.setStylistSettings(data);

      this.navCtrl.pop();
    } else {
      throw new Error('Please enter valid value');
    }
  }
}
