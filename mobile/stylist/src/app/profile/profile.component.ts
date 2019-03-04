import { FormControl } from '@angular/forms';
import { Component, ViewChild } from '@angular/core';
import { Page } from 'ionic-angular/navigation/nav-util';
import {
  Events,
  ModalController,
  NavController,
  NavParams,
  Slides
} from 'ionic-angular';
import 'rxjs/add/operator/pluck';

import {
  ProfileIncompleteField,
  ServiceItem,
  StylistProfile,
  StylistProfileCompleteness,
  StylistSettings
} from '~/shared/api/stylist-app.models';
import { getPhoneNumber } from '~/shared/utils/phone-numbers';
import { StylistServicesDataStore } from '~/services/services-list/services.data';
import { DayOffer } from '~/shared/api/price.models';
import { StylistProfileApi } from '~/shared/api/stylist-profile.api';
import { Rating, StylistProfileRequestParams, StylistProfileResponse } from '~/shared/api/stylists.models';
import { UserRole } from '~/shared/api/auth.models';
import { VisualWeekCard } from '~/shared/utils/worktime-utils';

import { loading } from '~/core/utils/loading';
import { PageNames } from '~/core/page-names';
import { ProfileDataStore } from '~/core/profile.data';
import { calcProfileCompleteness } from '~/core/utils/stylist-utils';
import { SetStylistProfileTabEventParams, StylistEventTypes } from '~/core/stylist-event-types';
import { MadeMenuComponent } from '~/core/components/made-menu/made-menu.component';
import { ClientsApi } from '~/core/api/clients-api';

import { FieldEditComponentParams } from '~/onboarding/field-edit/field-edit.component';
import { RegistrationForm, RegistrationFormControl } from '~/onboarding/registration.form';
import { WorkHoursComponentParams } from '~/workhours/workhours.component';
import { ClientsCalendarComponentParams } from '~/calendar/clients-calendar/clients-calendar.component';
import { StylistServiceProvider } from '~/core/api/stylist.service';
import { StylistAppStorage } from '~/core/stylist-app-storage';

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
  activeTab: ProfileTabNames;
  stylistProfileCompleteness: StylistProfileCompleteness;
  prices: DayOffer[];
  service: ServiceItem;
  stylistProfile: StylistProfileResponse;
  settings: StylistSettings;

  cards: VisualWeekCard[] = [];
  servicesPage: Page = PageNames.Services;
  refresherEnabled = true;
  ProfileTabNames = ProfileTabNames;
  ProfileTabs = ProfileTabs;
  PageNames = PageNames;
  RegistrationFormControl = RegistrationFormControl;
  stylistRating: Rating[];
  tabs = [
    {
      name: ProfileTabNames.clientView
    },
    {
      name: ProfileTabNames.edit
    }
  ];

  private photoId: FormControl;
  private photoUrl: FormControl;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public profileData: ProfileDataStore,
    private storage: StylistAppStorage,
    private clientsApi: ClientsApi,
    private events: Events,
    private registrationForm: RegistrationForm,
    private servicesData: StylistServicesDataStore,
    private stylistProfileApi: StylistProfileApi,
    private modalCtrl: ModalController,
    private stylistService: StylistServiceProvider
  ) {
    this.activeTab = this.tabs[ProfileTabs.clientView].name;
  }

  async ionViewWillLoad(): Promise<void> {
    this.registrationForm.init();

    const { response: settings } = await this.stylistService.getStylistSettings().toPromise();
    if (settings) {
      this.settings = settings;
    }
  }

  @loading
  async ionViewWillEnter(): Promise<void> {
    // Allow to set active tab from outside the component
    this.events.subscribe(StylistEventTypes.setStylistProfileTab, (params: SetStylistProfileTabEventParams) => {
      this.onTabChange(params.profileTab);
    });

    await this.getProfile();

    await this.getClientsFeedBack();

    await this.getStylistProfile();

    await this.getServicesList();
  }

  async getProfile(): Promise<void> {
    const { profile_photo_id, profile_photo_url } = this.registrationForm.getFormControls();

    this.photoId = profile_photo_id;
    this.photoUrl = profile_photo_url;

    await this.registrationForm.loadFormInitialData();

    const { response } = await this.profileData.get({refresh: true});
    if (response) {
      this.profile = response;
      this.profile.phone = getPhoneNumber(response.phone);
      this.profile.public_phone = getPhoneNumber(response.public_phone);

      this.photoUrl.setValue(response.profile_photo_url);
      this.photoId.setValue(response.profile_photo_id);

      if (this.profile.profile_status && this.profile.profile_status.has_services_set) {
        // Set services page instead of services template page to skip filling in services
        this.servicesPage = PageNames.ServicesList;
      }

      this.stylistProfileCompleteness = calcProfileCompleteness(this.profile);

      // if old user already has
      // [services, hours, invited_clients, deal_of_week, discounts_set]
      // then we can skip educational popup
      if (
        this.stylistProfileCompleteness.profileIncomplete[ProfileIncompleteField.has_services_set].isComplete
        &&
        this.stylistProfileCompleteness.profileIncomplete[ProfileIncompleteField.has_business_hours_set].isComplete
        &&
        this.stylistProfileCompleteness.profileIncomplete[ProfileIncompleteField.has_invited_clients].isComplete
        &&
        this.stylistProfileCompleteness.profileIncomplete[ProfileIncompleteField.has_deal_of_week].isComplete
        &&
        this.stylistProfileCompleteness.profileIncomplete[ProfileIncompleteField.has_weekday_discounts_set].isComplete
      ) {
        this.storage.set('hasSeenEducationalPopups', true);
      }

      if (!this.storage.get('hasSeenEducationalPopups')) {
        this.showEducationalPopup();
      }
    }
  }

  async getClientsFeedBack(): Promise<void> {
    const { rating } = (await this.stylistProfileApi.getClientsFeedBack(this.profile.uuid).get()).response;
    if (rating) {
      this.stylistRating = rating;
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

  async getServicesList(): Promise<void> {
    const services = await this.servicesData.getServicesList();

    if (services) {
      // we need just one random service for calendar preview
      this.service = services.length > 0 ? services[0] : undefined;

      if (this.profile && this.profile.profile_status && this.profile.profile_status.has_services_set) {
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

  showEducationalPopup(): void {
    const modal = this.modalCtrl.create(PageNames.Educational);
    modal.present();
  }

  ionViewWillLeave(): void {
    this.events.unsubscribe(StylistEventTypes.setStylistProfileTab);
  }

  onCalendarClick(): void {
    if (!this.service) {
      this.onSetAccountInfo(this.servicesPage);
    } else {
      const params: ClientsCalendarComponentParams = {
        isRootPage: true
      };

      this.navCtrl.setRoot(PageNames.ClientsCalendar, { params });
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
    const params: WorkHoursComponentParams = {
      isRootPage: false
    };

    this.navCtrl.push(PageNames.WorkHours, { params });
  }

  onFieldEdit(control: RegistrationFormControl): void {
    switch (control) {
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
    if (!this.profile) {
      return false;
    }

    return MadeMenuComponent.showNotice(page, this.profile);
  }

  onAddPhoto(): void {
    this.registrationForm.processPhoto();

    this.updateProfile();
  }

  onIncompleteClick(): void {
    this.navCtrl.push(PageNames.ProfileIncomplete);
  }

  private async updateProfile(): Promise<void> {
    const { response: profile } = await this.profileData.get();
    if (profile) {
      this.stylistProfileCompleteness = calcProfileCompleteness(profile);
    }
  }
}
