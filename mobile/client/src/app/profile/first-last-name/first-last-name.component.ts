import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavParams } from 'ionic-angular';
import { ProfileDataStore } from '~/profile/profile.data';

export class FirstLastNameComponentParams {
  onContinue: () => void;
}

@Component({
  selector: 'first-last-name',
  templateUrl: 'first-last-name.component.html'
})
export class FirstLastNameComponent {
  params: FirstLastNameComponentParams;
  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
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
  }

  ionViewWillLoad(): void {
    this.params = this.navParams.get('data') as FirstLastNameComponentParams;
  }

  async onContinue(): Promise<void> {
    await this.profileDataStore.update(this.form.value);

    this.params.onContinue();
  }
}
