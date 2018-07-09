import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { IonicPage, NavController } from 'ionic-angular';
import { Store } from '@ngrx/store';

import { componentUnloaded } from '~/shared/component-unloaded';

import { PageNames } from '~/core/page-names';
import {
  AuthState,
  ConfirmCodeAction,
  RequestCodeErrorAction,
  selectRequestCodeFailed
} from '~/core/reducers/auth.reducer';
import { AuthEffects } from '~/core/effects/auth.effects';

@IonicPage()
@Component({
  selector: 'page-auth-confirm',
  templateUrl: 'auth-confirm-page.component.html'
})
export class AuthConfirmPageComponent {
  static CODE_LENGTH = 4;

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

  ionViewDidEnter(): void {
    this.store
      .select(selectRequestCodeFailed)
      .takeUntil(componentUnloaded(this))
      .subscribe((isFailed: boolean) => {
        if (
          isFailed &&
          this.navCtrl.canGoBack() &&
          this.navCtrl.getPrevious().id === PageNames.Auth
        ) {
          // go back to show error
          this.navCtrl.pop();
        }
      });

    this.authEffects.saveToken
      .takeUntil(componentUnloaded(this))
      .subscribe((isTokenSaved: boolean) => {
        if (isTokenSaved) {
          // navigate when token done saving
          this.navCtrl.setRoot(PageNames.Services);
        }
      });
  }

  submit(): void {
    this.store.dispatch(new ConfirmCodeAction(this.code.value));
  }
}
