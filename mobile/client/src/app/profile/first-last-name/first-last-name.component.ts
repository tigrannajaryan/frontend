import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, NavParams } from 'ionic-angular';

import { ProfileDataStore } from '~/profile/profile.data';
import { ClientStartupNavigation } from '~/core/client-startup-navigation';
import { StylistModel } from '~/shared/api/stylists.models';

export interface FirstLastNamePageParams {
  pendingInvitation?: StylistModel;
}

@Component({
  selector: 'first-last-name',
  templateUrl: 'first-last-name.component.html'
})
export class FirstLastNameComponent {
  form: FormGroup;
  params: FirstLastNamePageParams;

  constructor(
    private clientNavigation: ClientStartupNavigation,
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private navParams: NavParams,
    public profileDataStore: ProfileDataStore
  ) {
    this.form = this.formBuilder.group({
      first_name: ['', [
        Validators.required,
        Validators.maxLength(30)
      ]],
      last_name: ['', [
        Validators.required,
        Validators.maxLength(150)
      ]]
    });

    this.params = this.navParams.get('data') || {};
  }

  async onContinue(): Promise<void> {
    await this.profileDataStore.set(this.form.value);
    this.clientNavigation.showNextByProfileStatus(this.navCtrl, this.params.pendingInvitation);
  }
}
