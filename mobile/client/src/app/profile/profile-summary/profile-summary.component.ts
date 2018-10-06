import { Component } from '@angular/core';
import { AlertController, App } from 'ionic-angular';
import { Page } from 'ionic-angular/navigation/nav-util';
import { Store } from '@ngrx/store';

import { componentUnloaded } from '~/shared/component-unloaded';
import { ExternalAppService } from '~/shared/utils/external-app-service';

import { PageNames } from '~/core/page-names';
import { loading } from '~/shared/utils/request-utils';
import { DefaultImage } from '~/core/core.module';
import { ProfileCompleteness, ProfileModel } from '~/core/api/profile.models';
import { checkProfileCompleteness } from '~/core/utils/user-utils';

import { ProfileDataStore } from '~/profile/profile.data';
import { LogoutAction } from '~/shared/storage/auth.reducer';

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
    public profileDataStore: ProfileDataStore,
    private app: App,
    private alertCtrl: AlertController,
    private externalAppService: ExternalAppService,
    private store: Store<{}>
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    const attachLoader = loading(isLoading => this.isLoading = isLoading);

    attachLoader(this.profileDataStore.asObservable())
      .takeUntil(componentUnloaded(this))
      .subscribe(({ response }: { response?: ProfileModel }) => { // ApiResponse<ProfileModel>
        if (response) {
          this.profile = response;
          this.profileCompleteness = checkProfileCompleteness(this.profile);
        }
      });
  }

  isProfileCompleted(): boolean {
    return Boolean(this.profile && this.profile.first_name);
  }

  onEdit(): void {
    this.app.getRootNav().push(PageNames.ProfileEdit, { profile: this.profile });
  }

  goTo(page: Page, params: any): void {
    this.app.getRootNav().push(page, params);
  }

  async onContactByEmail(mailTo: string): Promise<void> {
    this.externalAppService.openMailApp(mailTo);
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
