import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController } from 'ionic-angular';

import { profileStatusToPage } from '../shared/functions';
import { AuthApiService, AuthCredentials, UserRole } from '../shared/auth-api-service/auth-api-service';
import { ServerFieldError } from '../shared/api-errors';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.component.html'
})
export class LoginComponent {

  formData = { email: '', password: '' };
  passwordType = 'password';

  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private authService: AuthApiService
  ) { }

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

  switchPasswordType(): void {
    this.passwordType = this.passwordType === 'password' ? 'type' : 'password';
  }

  reset(): void {
    // TODO: add api call when it will be ready
  }
}
