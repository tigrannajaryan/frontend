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

import { loading } from '~/core/utils/loading';
import { PageNames } from '~/core/page-names';
import { ProfileDataStore } from '~/core/profile.data';
import { calcProfileCompleteness } from '~/core/utils/stylist-utils';
import { SetStylistProfileTabEventParams, StylistEventTypes } from '~/core/stylist-event-types';
import { MadeMenuComponent } from '~/core/components/made-menu/made-menu.component';
import { ClientsApi } from '~/core/api/clients-api';

import { FieldEditComponentParams } from '~/onboarding/field-edit/field-edit.component';
import { RegistrationForm, RegistrationFormControl } from '~/onboarding/registration.form';
import { StylistProfileApi } from '~/shared/api/stylist-profile.api';
import { StylistProfileRequestParams, StylistProfileResponse } from '~/shared/api/stylists.models';
import { UserRole } from '~/shared/api/auth.models';
import { VisualWeekCard } from '~/shared/utils/worktime-utils';

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
  prices: DayOffer[];
  service: ServiceItem;
  stylistProfile: StylistProfileResponse;

  cards: VisualWeekCard[] = [];
  servicesPage: Page = PageNames.Services;
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
    private clientsApi: ClientsApi,
    private events: Events,
    private registrationForm: RegistrationForm,
    private servicesData: StylistServicesDataStore,
    private stylistProfileApi: StylistProfileApi
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

    await this.getProfile();

    await this.getStylistProfile();

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

  async getStylistProfile(): Promise<void> {
    const params: StylistProfileRequestParams = {
      role: UserRole.stylist,
      stylistUuid: this.profile.uuid
    };
    const stylistProfileResponse = await this.stylistProfileApi.getStylistProfile(params).toPromise();
    if (stylistProfileResponse.response) {
      this.stylistProfile = stylistProfileResponse.response;

      if (this.stylistProfile.working_hours && this.stylistProfile.working_hours.weekdays) {
        this.cards = VisualWeekCard.worktime2presentation(this.stylistProfile.working_hours);
      }
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
    const services = await this.servicesData.getServicesList();
    // empty service === !has_services_set
    this.profileStatus.has_services_set = services && services.length > 0;
    // update localstorage
    updateProfileStatus(this.profileStatus);

    if (services) {
      // we need just one random service for calendar preview
      this.service = services.length > 0 ? services[0] : undefined;

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

  onMyHoursClick(): void {
    const params = {
      isRootPage: false
    };

    this.navCtrl.push(PageNames.WorkHours, { params });
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
