import { Component } from '@angular/core';
import { AlertController, App } from 'ionic-angular';
import { Page } from 'ionic-angular/navigation/nav-util';
import { Store } from '@ngrx/store';

import { componentUnloaded } from '~/shared/component-unloaded';
import { ExternalAppService } from '~/shared/utils/external-app-service';
import { ApiResponse } from '~/shared/api/base.models';

import { PageNames } from '~/core/page-names';
import { loading } from '~/shared/utils/request-utils';
import { DefaultImage } from '~/core/core.module';
import { ProfileCompleteness, ProfileModel } from '~/core/api/profile.models';
import { checkProfileCompleteness } from '~/core/utils/user-utils';

import { LogoutAction } from '~/app.reducers';
import { ProfileDataStore } from '~/profile/profile.data';
import { MadeDisableOnClick } from '~/shared/utils/loading';

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
      .subscribe((apiRes: ApiResponse<ProfileModel>) => {
        const profile: ProfileModel = apiRes.response;
        if (profile) {
          this.profile = profile;
          this.profileCompleteness = checkProfileCompleteness(this.profile);
        }
      });
  }

  isProfileCompleted(): boolean {
    return Boolean(this.profile && this.profile.first_name);
  }

  @MadeDisableOnClick
  async onEdit(): Promise<void> {
    await this.app.getRootNav().push(PageNames.ProfileEdit);
  }

  @MadeDisableOnClick
  async goTo(page: Page, params: any): Promise<void> {
    await this.app.getRootNav().push(page, params);
  }

  @MadeDisableOnClick
  async onContactByEmail(mailTo: string): Promise<void> {
    await this.externalAppService.openMailApp(mailTo);
  }

  @MadeDisableOnClick
  async onLogout(): Promise<void> {
    const prompt = this.alertCtrl.create({
      title: '',
      subTitle: 'Are you sure you want to Logout?',
      buttons: [
        {
          text: 'Yes, Logout',
          handler: () => this.store.dispatch(new LogoutAction())
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    });
    await prompt.present();
  }
}
