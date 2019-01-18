import { Component, ElementRef, ViewChild } from '@angular/core';
import { Content, DomController, Events, NavController, Refresher, Slides } from 'ionic-angular';

import { AppointmentStatus, ClientAppointmentModel } from '~/shared/api/appointments.models';
import { PreferredStylistModel } from '~/shared/api/stylists.models';
import { componentUnloaded } from '~/shared/component-unloaded';
import { Logger } from '~/shared/logger';

import { AppointmentsDataStore } from '~/core/api/appointments.datastore';
import { PreferredStylistsData } from '~/core/api/preferred-stylists.data';
import { ClientEventTypes } from '~/core/client-event-types';
import { PageNames } from '~/core/page-names';

import { AppointmentPageParams } from '~/appointment-page/appointment-page.component';
import { startRebooking } from '~/booking/booking-utils';
import { StylistProfileParams } from '~/stylists/stylist-profile/stylist-profile.component';

export type HomeTabName = 'Upcoming' | 'Past';

export interface HomeTab {
  name: HomeTabName;
  appointments?: ClientAppointmentModel[];
}

@Component({
  selector: 'home-page',
  templateUrl: 'home.component.html'
})
export class HomeComponent {
  tabs: HomeTab[] = [
    { name: 'Upcoming' },
    { name: 'Past' }
  ];
  stylists: PreferredStylistModel[];

  @ViewChild('carret') carret: ElementRef;
  @ViewChild(Content) content: Content;
  @ViewChild(Refresher) refresher: Refresher;
  @ViewChild(Slides) slides: Slides;

  isScrolling = false;
  isRefresherEnabled = true;

  constructor(
    private appointmentsDataStore: AppointmentsDataStore,
    private domCtrl: DomController,
    private events: Events,
    private logger: Logger,
    private navCtrl: NavController,
    private preferredStylistsData: PreferredStylistsData
  ) {
  }

  async ionViewWillLoad(): Promise<void> {
    const allStylists = await this.preferredStylistsData.get();
    this.stylists = allStylists.filter(stylist => stylist.is_profile_bookable);
  }

  ionViewWillEnter(): void {
    this.loadTabData(0);

    this.slides.ionSlideProgress
      .takeUntil(componentUnloaded(this))
      .subscribe(progress => this.moveNavCarret(progress));
  }

  isActiveTab(tabIdx): boolean {
    if (this.slides.getActiveIndex() === this.tabs.length && tabIdx === this.tabs.length - 1) {
      // Scrolled beyond the right bound. Get back to the last slide.
      // Bug: https://github.com/ionic-team/ionic/issues/12297.
      return true;
    }
    return tabIdx === this.slides.getActiveIndex();
  }

  async onRefresh(refresher: Refresher): Promise<void> {
    await this.loadTabData(this.slides.getActiveIndex());
    refresher.complete();
  }

  /**
   * Allows to disable refresher on slide drag and enable it back
   * again when draggin is over.
   */
  onEnableRefresher(isRefresherEnabled: boolean): void {
    this.isRefresherEnabled = isRefresherEnabled;
  }

  /**
   * Listen ionSlideDidChange and call onTabChange to activate
   * a tab and load all it’s data.
   */
  onTabChange(): void {
    const tabIdx = this.slides.getActiveIndex();

    if (this.tabs[tabIdx]) {
      this.scrollToTop();
      this.loadTabData(tabIdx);
    } else {
      // Scrolled beyond the right bound. Get back to the last slide.
      // Bug: https://github.com/ionic-team/ionic/issues/12297.
      this.slides.slidePrev(0);
    }
  }

  /**
   * Slide to the selected tab. Used in top navbar.
   */
  onSelectTab(tabIdx: number): void {
    const tab = this.tabs[tabIdx];
    if (tab && this.slides.getActiveIndex() !== tabIdx) {
      this.scrollToTop();
      this.slides.slideTo(tabIdx);
    }
  }

  onBookClick(): void {
    this.logger.info('onBookClick');
    this.events.publish(ClientEventTypes.startBooking);
  }

  onStylistClick(stylist: PreferredStylistModel): void {
    const params: StylistProfileParams = { stylist };
    this.navCtrl.push(PageNames.StylistProfile, { params });
  }

  onSearchStylistsClick(): void {
    this.navCtrl.push(PageNames.StylistSearch);
  }

  onAppointmentClick(appointment: ClientAppointmentModel): void {
    const tab = this.tabs[this.slides.getActiveIndex()];
    if (tab) {
      const params: AppointmentPageParams = { appointment };
      if (appointment.status === AppointmentStatus.new) {
        params.onCancel = () => this.onAppointmentCancel();
      }
      if (tab.name === 'Past') {
        params.hasRebook = true;
      }
      this.navCtrl.push(PageNames.Appointment, { params });
    }
  }

  onRebookAppointmentClick(appointment: ClientAppointmentModel): void {
    this.logger.info('onRebookClick', appointment);
    startRebooking(appointment);
  }

  private onAppointmentCancel(): void {
    this.appointmentsDataStore.home.refresh();
  }

  private moveNavCarret(progress: number): void {
    this.domCtrl.write(() => {
      this.carret.nativeElement.style.transform = `translateX(${progress * 100}%)`;
    });
  }

  private async scrollToTop(): Promise<void> {
    if (!this.isScrolling) {
      this.isScrolling = true;
      await this.content.scrollToTop(300);
      this.isScrolling = false;
    }
  }

  private async loadTabData(tabIdx: number): Promise<void> {
    const tab = this.tabs[tabIdx];
    if (tab) {
      switch (tab.name) {
        case 'Upcoming': {
          const { response: homeResponse } = await this.appointmentsDataStore.home.get({ refresh: true });
          tab.appointments = homeResponse.upcoming;
          break;
        }

        case 'Past': {
          const { response: historyResponse } = await this.appointmentsDataStore.history.get({ refresh: true });
          tab.appointments = historyResponse.appointments;
          break;
        }

        default:
          break;
      }
    }
  }
}
