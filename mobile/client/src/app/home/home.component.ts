import { Component, ElementRef, ViewChild } from '@angular/core';
import { App, Content, DomController, Events, Refresher, Slides } from 'ionic-angular';

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

export enum HomeTabName {
  Upcoming = 'Upcoming',
  Past = 'Past'
}

export interface HomeTab {
  name: HomeTabName;
  appointments?: ClientAppointmentModel[];
}

@Component({
  selector: 'page-home',
  templateUrl: 'home.component.html'
})
export class HomeComponent {
  HomeTabName = HomeTabName;

  tabs: HomeTab[] = [
    { name: HomeTabName.Upcoming },
    { name: HomeTabName.Past }
  ];
  stylists: PreferredStylistModel[];

  @ViewChild('carret') carret: ElementRef;
  @ViewChild(Content) content: Content;
  @ViewChild(Refresher) refresher: Refresher;
  @ViewChild(Slides) slides: Slides;

  isScrolling = false;
  isRefresherEnabled = true;

  constructor(
    private app: App,
    private appointmentsDataStore: AppointmentsDataStore,
    private domCtrl: DomController,
    private events: Events,
    private logger: Logger,
    private preferredStylistsData: PreferredStylistsData
  ) {
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadStylists();

    const firstTabIdx = 0;
    await this.loadTabData(firstTabIdx);

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
    await Promise.all([
      this.loadStylists(),
      this.loadTabData(this.slides.getActiveIndex())
    ]);
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
      // NOTE: we use 0-speed of sliding to slide without animation.
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
    this.app.getRootNav().push(PageNames.StylistProfile, { params });
  }

  onMyStylistsClick(): void {
    this.app.getRootNav().push(PageNames.MyStylists);
  }

  onSearchStylistsClick(): void {
    this.app.getRootNav().push(PageNames.StylistSearch);
  }

  onAppointmentClick(appointment: ClientAppointmentModel): void {
    const tab = this.tabs[this.slides.getActiveIndex()];
    if (tab) {
      const params: AppointmentPageParams = { appointment };
      if (appointment.status === AppointmentStatus.new) {
        params.onCancel = () => this.onAppointmentCancel();
      }
      if (tab.name === HomeTabName.Past) {
        params.hasRebook = true;
      }
      this.app.getRootNav().push(PageNames.Appointment, { params });
    }
  }

  async onRebookAppointmentClick(appointment: ClientAppointmentModel): Promise<void> {
    this.logger.info('onRebookClick', appointment);
    if (!this.stylists.some(stylist => stylist.uuid === appointment.stylist_uuid)) {
      const { response } = await this.preferredStylistsData.addStylist({ uuid: appointment.stylist_uuid });
      if (!response) {
        // Error should already be reported, just return
        return;
      }
    }
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

  private async loadStylists(): Promise<void> {
    const allStylists = await this.preferredStylistsData.get();
    this.stylists = allStylists.filter(stylist => stylist.is_profile_bookable);
  }

  private async loadTabData(tabIdx: number): Promise<void> {
    const tab = this.tabs[tabIdx];
    if (tab) {
      switch (tab.name) {
        case HomeTabName.Upcoming: {
          const { response: homeResponse } = await this.appointmentsDataStore.home.get({ refresh: true });
          tab.appointments = homeResponse.upcoming;
          break;
        }

        case HomeTabName.Past: {
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
