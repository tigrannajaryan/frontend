import { Component, ViewChild } from '@angular/core';
import { Page } from 'ionic-angular/navigation/nav-util';
import {
  Events,
  NavController,
  NavParams, Slides
} from 'ionic-angular';
import 'rxjs/add/operator/pluck';

import { StylistProfile, StylistProfileCompleteness, StylistProfileStatus } from '~/shared/api/stylist-app.models';
import { getProfileStatus } from '~/shared/storage/token-utils';
import { getPhoneNumber } from '~/shared/utils/phone-numbers';

import { loading } from '~/core/utils/loading';
import { PageNames } from '~/core/page-names';
import { ProfileDataStore } from '~/core/profile.data';
import { calcProfileCompleteness } from '~/core/utils/stylist-utils';
import { SetStylistProfileTabEventParams, StylistEventTypes } from '~/core/stylist-event-types';
import { MadeMenuComponent } from '~/core/components/made-menu/made-menu.component';

import { FieldEditComponentParams } from '~/onboarding/field-edit/field-edit.component';
import { RegistrationForm, RegistrationFormControl } from '~/onboarding/registration.form';

export enum ProfileTabs {
  clientView,
  edit
}

export enum ProfileTabNames {
  clientView = 'Client View',
  edit = 'Edit'
}

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.component.html'
})
export class ProfileComponent {
  @ViewChild(Slides) slides: Slides;
  profile: StylistProfile;
  profileStatus: StylistProfileStatus;
  activeTab: ProfileTabNames;
  stylistProfileCompleteness: StylistProfileCompleteness;

  servicesPage: Page = PageNames.Services;
  calendar = false;
  refresherEnabled = true;
  ProfileTabNames = ProfileTabNames;
  ProfileTabs = ProfileTabs;
  PageNames = PageNames;
  RegistrationFormControl = RegistrationFormControl;
  tabs = [
    {
      name: ProfileTabNames.clientView
    },
    {
      name: ProfileTabNames.edit
    }
  ];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public profileData: ProfileDataStore,
    private events: Events,
    private registrationForm: RegistrationForm
  ) {
    this.activeTab = this.tabs[ProfileTabs.clientView].name;
  }

  async ionViewWillLoad(): Promise<void> {
    this.registrationForm.init();
    await this.registrationForm.loadFormInitialData();
  }

  @loading
  async ionViewWillEnter(): Promise<void> {
    // Allow to set active tab from outside the component
    this.events.subscribe(StylistEventTypes.setStylistProfileTab, (params: SetStylistProfileTabEventParams) => {
      this.onTabChange(params.profileTab);
    });

    const { response } = await this.profileData.get({refresh: true});
    if (response) {
      this.profile = response;
      this.profile.phone = getPhoneNumber(response.phone);
      this.profile.public_phone = getPhoneNumber(response.public_phone);
      this.stylistProfileCompleteness = calcProfileCompleteness(response);
    }

    const profileStatus: StylistProfileStatus = await getProfileStatus() as StylistProfileStatus;
    if (profileStatus) {
      this.profileStatus = profileStatus;

      // Set services page or services template page based on `has_services_set`:
      if (this.profileStatus.has_services_set) {
        this.servicesPage = PageNames.ServicesList;
      }
    }
  }

  ionViewWillLeave(): void {
    this.events.unsubscribe(StylistEventTypes.setStylistProfileTab);
  }

  onTabChange(tabIndex: ProfileTabs): void {
    this.slides.slideTo(tabIndex);
    this.activeTab = this.tabs[tabIndex].name;
  }

  onTabSwipe(): void {
    // if index more or equal to tabs length we got an error
    if (this.slides.getActiveIndex() >= this.tabs.length) {
      return;
    }
    this.activeTab = this.tabs[this.slides.getActiveIndex()].name;
  }

  onEnableRefresher(isEnabled: boolean): void {
    this.refresherEnabled = isEnabled;
  }

  onMyClientsClick(): void {
    this.navCtrl.push(PageNames.MyClients);
  }

  onFieldEdit(control: RegistrationFormControl): void {
    switch (control) {
      case RegistrationFormControl.PhotoId:
      case RegistrationFormControl.PhotoUrl:
        this.navCtrl.push(PageNames.StylistPhoto, { params: { isRootPage: true }});
        return;

      case RegistrationFormControl.SalonAddress:
        this.navCtrl.push(PageNames.SalonAddress, { params: { isRootPage: true }});
        return;

      case RegistrationFormControl.Instagram:
        this.navCtrl.push(PageNames.ConnectInstagram, { params: { isRootPage: true }});
        return;

      default:
        const params: FieldEditComponentParams = { isRootPage: true, control };
        this.navCtrl.push(PageNames.FieldEdit, { params });
        return;
    }
  }

  onSetAccountInfo(page: Page): void {
    const params = {
      isRootPage: false
    };

    this.navCtrl.push(page, { params });
  }

  shouldShowNotice(page: Page): boolean {
    if (!this.profileStatus) {
      return false;
    }

    return MadeMenuComponent.showNotice(page, this.profileStatus);
  }
}
