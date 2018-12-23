import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NavController } from 'ionic-angular';

import { PageNames } from '~/core/page-names';

import { RegistrationForm } from '~/onboarding/registration.form';

@Component({
  selector: 'name-surname',
  templateUrl: 'name-surname.component.html'
})
export class NameSurnameComponent implements OnInit {

  firstName: FormControl;
  lastName: FormControl;

  constructor(
    private navCtrl: NavController,
    private registrationForm: RegistrationForm
  ) {
  }

  async ngOnInit(): Promise<void> {
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
    this.navCtrl.push(PageNames.SalonName);
  }

  onContinue(): void {
    if (this.isValid()) {
      this.onNavigateNext();
    }
  }
}
