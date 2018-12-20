import { Component, ViewChild } from '@angular/core';
import { Page } from 'ionic-angular/navigation/nav-util';
import {
  Events,
  NavController,
  NavParams, Slides
} from 'ionic-angular';
import 'rxjs/add/operator/pluck';

import {
  ServiceItem,
  StylistProfile,
  StylistProfileCompleteness,
  StylistProfileStatus
} from '~/shared/api/stylist-app.models';
import { getProfileStatus, updateProfileStatus } from '~/shared/storage/token-utils';
import { getPhoneNumber } from '~/shared/utils/phone-numbers';
import { StylistServicesDataStore } from '~/services/services-list/services.data';
import { DayOffer } from '~/shared/api/price.models';

import { ENV } from '~/environments/environment.default';

import { loading } from '~/core/utils/loading';
import { PageNames } from '~/core/page-names';
import { ProfileDataStore } from '~/core/profile.data';
import { calcProfileCompleteness } from '~/core/utils/stylist-utils';
import { SetStylistProfileTabEventParams, StylistEventTypes } from '~/core/stylist-event-types';
import { MadeMenuComponent } from '~/core/components/made-menu/made-menu.component';
import { ClientsApi } from '~/core/api/clients-api';

import { StylistProfileApi } from '~/shared/api/stylist-profile.api';
import { StylistProfileRequestParams, StylistProfileResponse } from '~/shared/api/stylists.models';
import { UserRole } from '~/shared/api/auth.models';

export enum ProfileTabs {
  clientView,
  edit
}

export enum ProfileTabNames {
  clientView = 'Client View',
  edit = 'Edit'
}

export enum ProfileEditableFields {
  name,
  profile_photo_url,
  instagram,
  website_url,
  email,
  salon_address,
  salon_name,
  public_phone
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
  prices: DayOffer[];
  service: ServiceItem;
  stylistProfile: StylistProfileResponse;

  servicesPage: Page = PageNames.Services;
  refresherEnabled = true;
  ProfileTabNames = ProfileTabNames;
  ProfileEditableFields = ProfileEditableFields;
  ProfileTabs = ProfileTabs;
  PageNames = PageNames;
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
    private clientsApi: ClientsApi,
    private servicesData: StylistServicesDataStore,
    private events: Events,
    private stylistProfileApi: StylistProfileApi
  ) {
    this.activeTab = this.tabs[ProfileTabs.clientView].name;
  }

  @loading
  async ionViewWillEnter(): Promise<void> {
    // Allow to set active tab from outside the component
    this.events.subscribe(StylistEventTypes.setStylistProfileTab, (params: SetStylistProfileTabEventParams) => {
      this.onTabChange(params.profileTab);
    });

    await this.getProfile();

    await this.getStylistProfileStatus();

    await this.getServicesList();
  }

  async getProfile(): Promise<void> {
    const { response } = await this.profileData.get({refresh: true});
    if (response) {
      this.profile = response;
      this.profile.phone = getPhoneNumber(response.phone);
      this.profile.public_phone = getPhoneNumber(response.public_phone);
      this.stylistProfileCompleteness = calcProfileCompleteness(response);
    }
  }

  async getStylistProfileStatus(): Promise<void> {
    const profileStatus: StylistProfileStatus = await getProfileStatus() as StylistProfileStatus;
    if (profileStatus) {
      this.profileStatus = profileStatus;

      if (this.profileStatus.has_services_set) {
        // Set services page instead of services template page to skip filling in services
        this.servicesPage = PageNames.ServicesList;
      }
    }
  }

  async getServicesList(): Promise<void> {
    const params: StylistProfileRequestParams = {
      role: UserRole.stylist,
      stylistUuid: this.profile.uuid
    };
    const stylistProfileResponse = await this.stylistProfileApi.getStylistProfile(params).toPromise();
    if (stylistProfileResponse.response) {
      this.stylistProfile = stylistProfileResponse.response;
    }

    const services = await this.servicesData.getServicesList();
    if (services) {
      // we need just one random service for calendar preview
      this.service = services.length > 0 ? services[0] : undefined;
      // empty service === !has_services_set
      this.profileStatus.has_services_set = !!this.service;
      // update localstorage
      updateProfileStatus(this.profileStatus);

      if (this.profileStatus.has_services_set) {
        this.getPrice(this.service.uuid);
      } else {
        // Set services page to select category since we have no services:
        this.servicesPage = PageNames.Services;
      }
    }
  }

  async getPrice(serviceUuid: string): Promise<void> {
    const { response } = await this.clientsApi.getPricing(undefined, [serviceUuid]).toPromise();
    if (response) {
      this.prices = response.prices;
    }
  }

  ionViewWillLeave(): void {
    this.events.unsubscribe(StylistEventTypes.setStylistProfileTab);
  }

  onCalendarClick(): void {
    if (!this.service) {
      this.onSetAccountInfo(this.servicesPage);
    } else {
      this.navCtrl.setRoot(PageNames.ClientsCalendar, { params: { isRootPage: true }});
    }
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

  onFieldEdit(field: ProfileEditableFields): void {
    if (ENV.ffEnableInstagramLinking && field === ProfileEditableFields.instagram) {
      this.navCtrl.push(PageNames.ConnectInstagram, { params: { isRootPage: true }});
      return;
    }
    this.navCtrl.push(PageNames.RegisterSalon, { params: { isRootPage: true }});
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
