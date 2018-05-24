import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';

import { profileStatusToPage } from '~/shared/functions';
import { AuthApiService, AuthCredentials, UserRole } from '~/shared/auth-api-service/auth-api-service';
import { ServerFieldError } from '~/shared/api-errors';
import { PageNames } from '~/shared/page-names';

export enum LoginOrRegisterType {
  login = 'login',
  register = 'register'
}

@IonicPage({
  segment: 'logreg'
})
@Component({
  selector: 'page-login',
  templateUrl: 'login-register.component.html'
})
export class LoginRegisterComponent {
  LoginOrRegisterType = LoginOrRegisterType;

  pageType: LoginOrRegisterType;
  formData = { email: '', password: '' };
  passwordType = 'password';

  constructor(
    public navParams: NavParams,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private authService: AuthApiService
  ) {
    this.pageType = this.navParams.get('pageType') as LoginOrRegisterType;
  }

  async login(): Promise<void> {
    const loading = this.loadingCtrl.create();
    try {
      loading.present();

      // Call auth API
      const authCredentials: AuthCredentials = {
        email: this.formData.email,
        password: this.formData.password,
        role: UserRole.stylist
      };
      const authResponse = await this.authService.doAuth(authCredentials);

      // process authResponse and move to needed page
      this.navCtrl.setRoot(profileStatusToPage(authResponse.profile_status));

    } catch (e) {
      if (e instanceof ServerFieldError) {
        // TODO: Iterate over e.errors Map and show all errors on the form.
      }
      throw e;
    } finally {
      loading.dismiss();
    }
  }

  async register(): Promise<void> {
    const loading = this.loadingCtrl.create();
    try {
      loading.present();

      const authCredentialsRecord: AuthCredentials = {
        email: this.formData.email,
        password: this.formData.password,
        role: UserRole.stylist
      };
      await this.authService.registerByEmail(authCredentialsRecord);

      this.navCtrl.push(PageNames.RegisterSalon, {}, { animate: false });
    } finally {
      loading.dismiss();
    }
  }

  onLoginOrRegister(): void {
    if (this.pageType === LoginOrRegisterType.login) {
      this.login();
    } else if (this.pageType === LoginOrRegisterType.register) {
      this.register();
    }
  }

  switchPasswordType(): void {
    this.passwordType = this.passwordType === 'password' ? 'type' : 'password';
  }

  resetPassword(): void {
    // TODO: add api call when it will be ready
  }
}
