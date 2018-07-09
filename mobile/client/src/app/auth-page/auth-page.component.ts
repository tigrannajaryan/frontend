import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { IonicPage, NavController } from 'ionic-angular';
import { Store } from '@ngrx/store';

import { PageNames } from '~/core/page-names';
import { AuthState, RequestCodeAction } from '~/core/reducers/auth.reducer';
import { phoneValidator } from '~/core/validators/phone.validator';

@IonicPage()
@Component({
  selector: 'page-auth',
  templateUrl: 'auth-page.component.html'
})
export class AuthPageComponent {
  // TODO:
  // 1. extract to phone input directive
  // 2. use asYouType formatter to format the phone
  // 3. highlight error when 10 digits or on submit
  phone: FormControl = new FormControl('', [Validators.required, phoneValidator()]);

  constructor(
    private navCtrl: NavController,
    private store: Store<AuthState>
  ) {
  }

  submit(): void {
    this.store.dispatch(new RequestCodeAction(this.phone.value));

    this.navCtrl.push(PageNames.AuthConfirm);
  }
}
