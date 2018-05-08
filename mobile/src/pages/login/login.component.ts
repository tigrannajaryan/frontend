import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthServiceProvider, StylistProfileStatus } from '../../providers/auth-service/auth-service';
import { PageNames } from '../page-names';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.component.html'
})
export class LoginComponent {

  formData = { email: '', password: '' };

  /**
   * Determines what page to show after auth based on the completeness
   * of the profile of the user.
   * @param profileStatus as returned by auth.
   */
  static profileStatusToPage(profileStatus: StylistProfileStatus): string {
    if (!profileStatus) {
      // No profile at all, start from beginning.
      return PageNames.RegisterSalon;
    }

    if (!profileStatus.has_personal_data || !profileStatus.has_picture_set) {
      return PageNames.RegisterSalon;
    }

    if (!profileStatus.has_services_set) {
      return PageNames.RegisterServices;
    }

    if (!profileStatus.has_business_hours_set) {
      return PageNames.Worktime;
    }

    // TODO: check the remaining has_ flags and return the appropriate
    // page name once the pages are implemented.

    // Everything is complete, go to Today screen.
    /**
     * with this approach (PageNames.Today) we have = 'TodayComponent'
     * if TodayComponent wrapped with quotes then its lazy loadint and we need to add module for this component
     * otherwise we will get an error
     */
    return PageNames.Today;
  }

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public authService: AuthServiceProvider,
              private alertCtrl: AlertController) {
  }

  async login(): Promise<void> {
    try {
      const authResponse = await this.authService.doAuth(this.formData);

      // Auth successfull. Remember token in local storage.
      localStorage.setItem('authToken', JSON.stringify(authResponse.token));

      // Erase all previous navigation history and go the next
      // page that must be shown to this user.
      this.navCtrl.setRoot(LoginComponent.profileStatusToPage(
        authResponse.stylist_profile_status));

    } catch (e) {
      // Show an error message
      const alert = this.alertCtrl.create({
        title: 'Login failed',
        subTitle: 'Invalid email or password',
        buttons: ['Dismiss']
      });
      alert.present();
    }
  }
}
