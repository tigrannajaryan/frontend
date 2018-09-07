import { Component } from '@angular/core';
import { AlertController, App, IonicPage, LoadingController, NavController } from 'ionic-angular';
import { Clipboard } from '@ionic-native/clipboard';
import { EmailComposer } from '@ionic-native/email-composer';
import { Store } from '@ngrx/store';

import { PageNames } from '~/core/page-names';
import { composeRequest, loading } from '~/core/utils/request-utils';
import { showAlert } from '~/core/utils/alert';
import { DefaultImage } from '~/core/core.module';
import { ProfileCompleteness, ProfileModel } from '~/core/api/profile.models';
import { checkProfileCompleteness } from '~/core/utils/user-utils';

import { ProfileDataStore } from '~/profile/profile.data';
import { LogoutAction } from '~/auth/auth.reducer';

@IonicPage()
@Component({
  selector: 'profile-summary',
  templateUrl: 'profile-summary.component.html'
})
export class ProfileSummaryComponent {
  profile: ProfileModel;

  PageNames = PageNames;

  isLoading = false;

  readonly DEFAULT_IMAGE = DefaultImage.User;

  profileCompleteness: ProfileCompleteness;

  constructor(
    private app: App,
    private alertCtrl: AlertController,
    private clipboard: Clipboard,
    private emailComposer: EmailComposer,
    private loadingCntrl: LoadingController,
    private navCtrl: NavController,
    private profileDataStore: ProfileDataStore,
    private store: Store<{}>
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    const { response } = await composeRequest<ProfileModel>(
      loading(isLoading => this.isLoading = isLoading),
      this.profileDataStore.get()
    );
    if (response) {
      this.profile = response;
      this.profileCompleteness = checkProfileCompleteness(this.profile);
    }
  }

  isProfileCompleted(): boolean {
    return Boolean(this.profile && this.profile.first_name);
  }

  onEdit(): void {
    this.navCtrl.push(PageNames.ProfileEdit, { profile: this.profile });
  }

  goTo(page: PageNames, params: any): void {
    this.app.getRootNav().push(page, params);
  }

  async onContactByEmail(mailTo: string): Promise<void> {
    const loader = this.loadingCntrl.create();
    loader.present();
    try {
      const hasPermission = await this.emailComposer.hasPermission();
      if (!hasPermission) {
        await this.emailComposer.requestPermission();
      }
      await this.emailComposer.open({ to: mailTo });
    } catch {
      this.clipboard.copy(mailTo);
      showAlert('Email copied', 'Email successfully copied to the clipboard.');
    } finally {
      loader.dismiss();
    }
  }

  async onLogout(): Promise<void> {
    const prompt = this.alertCtrl.create({
      title: '',
      subTitle: 'Do you want to logout?',
      buttons: [{
        text: 'Logout now',
        handler: () => this.store.dispatch(new LogoutAction())
      }, {
        text: 'Cancel',
        role: 'cancel'
      }]
    });
    prompt.present();
  }
}
