import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { IonicPage, NavController } from 'ionic-angular';
import { Store } from '@ngrx/store';

import { PageNames } from '~/core/page-names';
import {
  AuthState,
  ConfirmCodeAction,
  RequestCodeErrorAction
} from '~/core/reducers/auth.reducer';
import { AuthEffects } from '~/core/effects/auth.effects';

@IonicPage()
@Component({
  selector: 'page-auth-confirm',
  templateUrl: 'auth-confirm-page.component.html'
})
export class AuthConfirmPageComponent {
  static CODE_LENGTH = 6;

  code: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(AuthConfirmPageComponent.CODE_LENGTH),
    Validators.maxLength(AuthConfirmPageComponent.CODE_LENGTH)
  ]);

  constructor(
    private authEffects: AuthEffects,
    private navCtrl: NavController,
    private store: Store<AuthState>
  ) {
  }

  ionViewWillEnter(): void {
    this.subscription = this.authEffects.saveToken
      .subscribe((isTokenSaved: boolean) => {
        if (isTokenSaved) {
          // navigate when token done saving
          this.navCtrl.setRoot(PageNames.Services);
        }
      });
  }

  ionViewWillLeave(): void {
    this.subscription.unsubscribe();
  }

  submit(): void {
    this.store.dispatch(new ConfirmCodeAction(this.code.value));
  }
}
