import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { ProfileDataStore } from '~/core/profile.data';

export type RegistrationFormControlName =
  | 'first_name'
  | 'last_name'
  | 'salon_name'
  | 'salon_address'
  | 'profile_photo_id'
  | 'profile_photo_url';

export interface FormControls {
  [key: string]: FormControl;
}

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

  init(): void {
    if (this.form) {
      return;
    }

    this.form = this.form = this.formBuilder.group({
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
      // tslint:disable-next-line:no-null-keyword
      profile_photo_id: null,
      profile_photo_url: ''
    });
  }

  async loadFormInitialData(): Promise<void> {
    const { response } = await this.profileData.get();
    if (!response) {
      return;
    }

    const {
      first_name,
      last_name,
      salon_name,
      salon_address,
      profile_photo_id,
      profile_photo_url,
      phone
    } = response;

    this.phone = phone;

    this.form.patchValue({
      first_name,
      last_name,
      salon_name,
      salon_address,
      profile_photo_id,
      profile_photo_url
    });
  }

  getFormControls(): FormControls {
    return this.form.controls as FormControls;
  }

  isValid(...controlNames: RegistrationFormControlName[]): boolean {
    if (!this.form) {
      return false;
    }
    if (controlNames.length === 0) {
      return this.form.valid;
    }
    return controlNames.every(controlName => this.form.controls[controlName].valid);
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
