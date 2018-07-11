import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { IonicPage, NavController } from 'ionic-angular';
import { Store } from '@ngrx/store';

import { PageNames } from '~/core/page-names';
import {
  AuthState,
  ConfirmCodeAction,
  RequestCodeErrorAction,
  selectConfirmCodeLoading
} from '~/core/reducers/auth.reducer';
import { AuthEffects } from '~/core/effects/auth.effects';

export const CODE_LENGTH = 6;

@IonicPage()
@Component({
  selector: 'page-auth-confirm',
  templateUrl: 'auth-confirm-page.component.html'
})
export class AuthConfirmPageComponent {
  digits = Array(CODE_LENGTH).fill(undefined);

  code: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(CODE_LENGTH),
    Validators.maxLength(CODE_LENGTH)
  ]);

  isLoading = false;

  constructor(
    private authEffects: AuthEffects,
    private navCtrl: NavController,
    private store: Store<AuthState>
  ) {
  }

  ionViewDidEnter(): void {
    this.codeSubscription = this.code.statusChanges.subscribe(() => {
      if (this.code.valid) {
        this.store.dispatch(new ConfirmCodeAction(this.code.value));
      }
    });

    this.saveTokenSubscription = this.authEffects.saveToken
      .subscribe((isTokenSaved: boolean) => {
        if (isTokenSaved) {
          // navigate when token done saving
          this.navCtrl.setRoot(PageNames.Services);
        }
      });

    this.loadingSubscription = this.store
      .select(selectConfirmCodeLoading)
      .subscribe((isLoading: boolean) => {
        this.isLoading = isLoading;
      });
  }

  ionViewWillLeave(): void {
    this.codeSubscription.unsubscribe();
    this.saveTokenSubscription.unsubscribe();
    this.loadingSubscription.unsubscribe();
  }

  verifyCode(event: Event): void {
    const code: number = event.which || Number(event.code);
    const key: string = event.key || String.fromCharCode(code);

    if (!isNaN(parseInt(key, 10)) && event.target.value.length === CODE_LENGTH - 1) {
      event.target.selectionStart = event.target.selectionEnd = 0;
      event.target.scrollLeft = 0;
      event.target.blur();
      setTimeout(() => {
        this.code.patchValue(event.target.value + key);
      });
    }
  }
}
