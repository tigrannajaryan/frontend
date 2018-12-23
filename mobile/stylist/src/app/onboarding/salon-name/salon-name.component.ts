import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';

import { RegistrationForm } from '~/onboarding/registration.form';

@Component({
  selector: 'salon-name',
  templateUrl: 'salon-name.component.html'
})
export class SalonNameComponent implements OnInit {

  salonName: FormControl;

  constructor(
    private navCtrl: NavController,
    private registrationForm: RegistrationForm
  ) {
  }

  async ngOnInit(): Promise<void> {
    const { salon_name } = this.registrationForm.getFormControls();

    this.salonName = salon_name;
  }

  isValid(): boolean {
    return this.salonName.valid;
  }

  onNavigateNext(): void {
    this.navCtrl.push(PageNames.AddressInput);
  }

  onContinue(): void {
    if (this.isValid()) {
      this.onNavigateNext();
    }
  }
}
