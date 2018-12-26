import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TextInput } from 'ionic-angular/components/input/input';

import { PageNames } from '~/core/page-names';

import {
  FormControls,
  RegistrationForm,
  RegistrationFormControl
} from '~/onboarding/registration.form';

export interface FieldEditComponentParams {
  control: RegistrationFormControl;
  isRootPage?: boolean;
}

@Component({
  selector: 'field-edit',
  templateUrl: 'field-edit.component.html'
})
export class FieldEditComponent implements OnInit {
  static supportedControls: RegistrationFormControl[] = [
    RegistrationFormControl.FirstName,
    RegistrationFormControl.LastName,
    RegistrationFormControl.SalonName,
    RegistrationFormControl.PublicPhone,
    RegistrationFormControl.Email,
    RegistrationFormControl.Website
  ];

  RegistrationFormControl = RegistrationFormControl;

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

    // The params are required but not mandatory in navCtrl.push().
    // Someone is not well familiar with the component can still omit them accidentally.
    if (this.params.control === undefined) {
      throw new Error('Control is not set in FieldEditComponentParams');
    }

    // We made this component to support editing of a set of fields.
    // It uses RegistrationFormControl which is a unified way to describe all the form fields present in registration.
    // A developer who is less familiar with it can try to pass e.g. salon_address to the component which is not supposed
    // to be edited by it. We need to indicate this situation properly.
    if (FieldEditComponent.supportedControls.indexOf(this.params.control) === -1) {
      throw new Error('Control is not supported');
    }

    this.registrationForm.init();
    this.controls = this.registrationForm.getFormControls();

    await this.loadFieldInitialData(this.params.control);
  }

  ionViewDidEnter(): void {
    if (!this.controls[this.params.control].value) {
      this.autofocus();
    }
  }

  isValid(): boolean {
    switch (this.params.control) {
      case RegistrationFormControl.FirstName:
      case RegistrationFormControl.LastName:
        // We are using one page to edit first and last names
        return this.registrationForm.isValid(
          RegistrationFormControl.FirstName,
          RegistrationFormControl.LastName
        );

      default:
        return this.registrationForm.isValid(this.params.control);
    }
  }

  onNavigateNext(): void {
    if (this.params.isRootPage) {
      this.navCtrl.popToRoot();
      return;
    }

    switch (this.params.control) {
      case RegistrationFormControl.FirstName:
      case RegistrationFormControl.LastName: {
        const params: FieldEditComponentParams = { control: RegistrationFormControl.SalonName };
        this.navCtrl.push(PageNames.FieldEdit, { params });
        break;
      }

      case RegistrationFormControl.SalonName:
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

  private autofocus(): void {
    // Using setTimeout is the only way to succeed
    // in programmatically setting focus on a real device.
    setTimeout(() => {
      this.firstInput.setFocus();
    });
  }

  /**
   * Loads only necessary data to prevent deleting of already inputted data.
   * This could happen in registration flow where we let user input data page by page
   * and then save the data only after address is set.
   */
  private loadFieldInitialData(control: RegistrationFormControl): Promise<void> {
    switch (control) {
      case RegistrationFormControl.FirstName:
      case RegistrationFormControl.LastName:
        return this.registrationForm.loadFormInitialData(
          RegistrationFormControl.FirstName,
          RegistrationFormControl.LastName
        );

      default:
        return this.registrationForm.loadFormInitialData(control);
    }
  }
}
