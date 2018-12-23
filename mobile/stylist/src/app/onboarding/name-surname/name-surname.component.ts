import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NavController, NavParams } from 'ionic-angular';

import { PageNames } from '~/core/page-names';

import { RegistrationForm } from '~/onboarding/registration.form';

export interface NameSurnameComponentParams {
  isRootPage?: boolean;
}

@Component({
  selector: 'name-surname',
  templateUrl: 'name-surname.component.html'
})
export class NameSurnameComponent implements OnInit {
  params: NameSurnameComponentParams;

  firstName: FormControl;
  lastName: FormControl;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private registrationForm: RegistrationForm
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.params = this.navParams.get('params') || {};

    this.registrationForm.init();

    const { first_name, last_name } = this.registrationForm.getFormControls();

    this.firstName = first_name;
    this.lastName = last_name;

    await this.registrationForm.loadFormInitialData();
  }

  isValid(): boolean {
    return this.firstName.valid && this.lastName.valid;
  }

  onNavigateNext(): void {
    if (!this.params.isRootPage) {
      this.navCtrl.push(PageNames.SalonName);
    } else {
      this.navCtrl.popToRoot();
    }
  }

  async onContinue(): Promise<void> {
    if (this.isValid()) {
      if (this.params.isRootPage) {
        await this.registrationForm.save();
      }
      this.onNavigateNext();
    }
  }
}
