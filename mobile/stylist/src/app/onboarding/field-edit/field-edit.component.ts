import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TextInput } from 'ionic-angular/components/input/input';

import { PageNames } from '~/core/page-names';

import {
  FormControls,
  RegistrationForm,
  RegistrationFormControlName
} from '~/onboarding/registration.form';

export interface FieldEditComponentParams {
  control: RegistrationFormControlName;
  isRootPage?: boolean;
}

@Component({
  selector: 'field-edit',
  templateUrl: 'field-edit.component.html'
})
export class FieldEditComponent implements OnInit {
  static supportedControls: RegistrationFormControlName[] = [
    'first_name',
    'last_name',
    'salon_name',
    'public_phone',
    'email',
    'website_url'
  ];

  params: FieldEditComponentParams;
  controls: FormControls;

  @ViewChild(TextInput) firstInput;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private registrationForm: RegistrationForm
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.params = (this.navParams.get('params') || {}) as FieldEditComponentParams;

    if (this.params.control === undefined) {
      throw new Error('Control is not set in FieldEditComponentParams');
    }

    if (FieldEditComponent.supportedControls.indexOf(this.params.control) === -1) {
      throw new Error('Control is not supported');
    }

    this.registrationForm.init();
    this.controls = this.registrationForm.getFormControls();

    await this.registrationForm.loadFormInitialData();
  }

  ionViewDidEnter(): void {
    if (!this.controls[this.params.control].value) {
      this.autofocus();
    }
  }

  isValid(): boolean {
    const controls: RegistrationFormControlName[] = [];

    switch (this.params.control) {
      case 'first_name':
      case 'last_name':
        // We are using one page to edit first and last names
        controls.push('first_name', 'last_name');
        break;

      default:
        controls.push(this.params.control);
        break;
    }

    return this.registrationForm.isValid(...controls);
  }

  onNavigateNext(): void {
    if (this.params.isRootPage) {
      this.navCtrl.popToRoot();
      return;
    }

    switch (this.params.control) {
      case 'first_name':
      case 'last_name': {
        const params: FieldEditComponentParams = { control: 'salon_name' };
        this.navCtrl.push(PageNames.FieldEdit, { params });
        break;
      }

      case 'salon_name':
        this.navCtrl.push(PageNames.SalonAddress);
        break;

      default:
        break;
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
