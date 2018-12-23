import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NavController, NavParams } from 'ionic-angular';

import { PageNames } from '~/core/page-names';

import { RegistrationForm } from '~/onboarding/registration.form';

export interface SalonNameComponentParams {
  isRootPage?: boolean;
}

@Component({
  selector: 'salon-name',
  templateUrl: 'salon-name.component.html'
})
export class SalonNameComponent implements OnInit {
  params: SalonNameComponentParams;

  salonName: FormControl;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private registrationForm: RegistrationForm
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.params = this.navParams.get('params') || {};

    const { salon_name } = this.registrationForm.getFormControls();

    this.salonName = salon_name;
  }

  isValid(): boolean {
    return this.salonName.valid;
  }

  onNavigateNext(): void {
    if (!this.params.isRootPage) {
      this.navCtrl.push(PageNames.AddressInput);
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
