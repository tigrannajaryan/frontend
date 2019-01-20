import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { emptyOr, instagramValidator } from '~/shared/validators';

import { ProfileDataStore } from '~/core/profile.data';

/**
 * This enum is used to store all the fields editable in registration process.
 */
export enum RegistrationFormControl {
  FirstName = 'first_name',
  LastName = 'last_name',
  SalonName = 'salon_name',
  SalonAddress = 'salon_address',
  PublicPhone = 'public_phone',
  Email = 'email',
  Instagram = 'instagram_url',
  Website = 'website_url'
}

export interface FormControls {
  [key: string]: FormControl;
}

/**
 * This is an abstraction that encapsulates all the form-relative logic:
 * - initializing and loading initial data,
 * - validating its controls,
 * - saving (updating) the form.
 *
 * This abstraction makes it easier to split the form between many components:
 * - get a FormControl (or controls) by name (names);
 * - validate all or some of the controls;
 * - trigger save (update) of the form values on the server.
 */
@Injectable()
export class RegistrationForm {
  private static guardInitilization = false;

  private form: FormGroup;
  private phone: string;

  constructor(
    private formBuilder: FormBuilder,
    private profileData: ProfileDataStore
  ) {
    if (RegistrationForm.guardInitilization) {
      console.error('RegistrationForm initialized twice. Only include it in providers array of DataModule.');
    }
    RegistrationForm.guardInitilization = true;
  }

  init(forced = false): void {
    if (this.form && !forced) {
      return;
    }

    this.form = this.formBuilder.group({
      first_name: ['', [
        Validators.required,
        Validators.maxLength(30)
      ]],
      last_name: ['', [
        Validators.required,
        Validators.maxLength(150)
      ]],
      salon_name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(25)
      ]],
      salon_address: ['', [
        Validators.required,
        Validators.minLength(10)
      ]],
      public_phone: ['', [
        Validators.minLength(5),
        Validators.maxLength(17)
      ]],
      email: ['', [
        emptyOr(Validators.email)
      ]],
      website_url: [''],
      instagram_url: ['', [
        instagramValidator
      ]],
      // tslint:disable-next-line:no-null-keyword
      profile_photo_id: null,
      profile_photo_url: ''
    });
  }

  async loadFormInitialData(...controls: RegistrationFormControl[]): Promise<void> {
    const { response } = await this.profileData.get();
    if (!response) {
      return;
    }

    if (controls.length === 0) {
      // If no controls load the data of all controls
      controls = Object.keys(RegistrationFormControl).map(k => RegistrationFormControl[k]);
    }

    this.phone = response.phone;

    const values = {};

    for (const control of controls) {
      values[control] = response[control];
    }

    this.form.patchValue(values);
  }

  getFormControls(): FormControls {
    return this.form.controls as FormControls;
  }

  isValid(...controls: RegistrationFormControl[]): boolean {
    if (!this.form) {
      return false;
    }
    if (controls.length === 0) {
      return this.form.valid;
    }
    return controls.every(control => this.form.controls[control].valid);
  }

  async save(): Promise<void> {
    const { ...profile } = this.form.value;

    const data = {
      ...profile,
      // use raw phone number (required field, cannot omit):
      phone: this.phone,
      // the API requires null if empty salon_name
      // tslint:disable-next-line:no-null-keyword
      salon_name: profile.salon_name || null,
      // Add photo id only if it has been changed
      ...this.getProfilePhotoData()
    };
    await this.profileData.set(data);
  }

  private getProfilePhotoData(): { profile_photo_id: string } {
    const { profile_photo_url, profile_photo_id } = this.form.value;

    if (profile_photo_url && !profile_photo_id) {
      // Old photo used, nothing to be saved
      return { profile_photo_id: undefined };
    }

    if (!profile_photo_url) {
      // Photo removed, save null to indicate photo should be cleared out
      // tslint:disable-next-line:no-null-keyword
      return { profile_photo_id: null };
    }

    // New photo added, save
    return { profile_photo_id };
  }
}
