import { Component, ViewChild } from '@angular/core';
import { Content, NavController, NavParams } from 'ionic-angular';
import * as moment from 'moment';

import { Logger } from '~/shared/logger';
import { formatTimeInZone } from '~/shared/utils/string-utils';
import { loading, MadeDisableOnClick } from '~/shared/utils/loading';
import { ApiResponse } from '~/shared/api/base.models';

import { showAlert } from '~/shared/utils/alert';
import { PageNames } from '~/core/page-names';
import { BookingData } from '~/core/api/booking.data';
import { BookingApi, CreateAppointmentRequest, TimeslotsResponse } from '~/core/api/booking.api';
import { AppointmentPageParams } from '~/appointment-page/appointment-page.component';
import { BookServicesHeaderComponent } from '../book-services-header/book-services-header';

interface DisplayTimeslot {
  displayTime: string;
  startTime: moment.Moment;
  isBooked: boolean;
}

const enum TimeslotSectionName {
  morning = 'Morning',
  day = 'Day',
  evening = 'Evening'
}

interface TimeslotSection {
  sectionName: TimeslotSectionName;
  slots: DisplayTimeslot[];
}

export interface SelectTimeComponentParams {
  isRescheduling?: boolean;
}

@Component({
  selector: 'page-select-time',
  templateUrl: 'select-time.component.html'
})
export class SelectTimeComponent {
  @ViewChild(Content) content: Content;
  @ViewChild(BookServicesHeaderComponent) servicesHeader: BookServicesHeaderComponent;

  params: SelectTimeComponentParams;
  slotSections: TimeslotSection[];
  isLoading: boolean;

  static groupTimeslotsBySections(timeslots: TimeslotsResponse): TimeslotSection[] {

    const morning: TimeslotSection = {
      sectionName: TimeslotSectionName.morning,
      slots: []
    };

    const day: TimeslotSection = {
      sectionName: TimeslotSectionName.day,
      slots: []
    };

    const evening: TimeslotSection = {
      sectionName: TimeslotSectionName.evening,
      slots: []
    };

    const daySectionStartHour = 12;
    const eveningSectionStartHour = 17;

    for (const slot of timeslots.time_slots) {
      // parse provided time and preserve supplied timezone.
      const startTime = moment.parseZone(slot.start, moment.ISO_8601);
      const hour = startTime.hour();

      const displaySlot: DisplayTimeslot = {
        startTime,
        displayTime: formatTimeInZone(startTime),
        isBooked: slot.is_booked
      };

      // add the slot to correct section
      if (hour < daySectionStartHour) {
        morning.slots.push(displaySlot);
      } else if (hour < eveningSectionStartHour) {
        day.slots.push(displaySlot);
      } else {
        evening.slots.push(displaySlot);
      }
    }

    // Return sections which have at least one slot
    return [morning, day, evening].filter(section => section.slots.length > 0);
  }

  constructor(
    private bookingApi: BookingApi,
    protected bookingData: BookingData,
    private logger: Logger,
    protected navCtrl: NavController,
    private navParams: NavParams) {
  }

  ionViewDidLoad(): void {
    this.logger.info('SelectTimeComponent.ionViewDidLoad');

    this.params = this.navParams.get('params') as SelectTimeComponentParams;
  }

  async ionViewWillEnter(): Promise<void> {
    this.logger.info('SelectTimeComponent.ionViewWillEnter');

    if (this.bookingData.timeslots) {
      this.displayTimeslots(await loading(this, this.bookingData.timeslots.get()));
    } else {
      this.logger.error('Must call bookingData.setDate() before accessing timeslots');
    }
  }

  ionViewWillLeave(): void {
    this.logger.info('SelectTimeComponent.ionViewWillLeave');
  }

  displayTimeslots(apiResponse: ApiResponse<TimeslotsResponse>): void {
    if (apiResponse.response) {
      this.slotSections = SelectTimeComponent.groupTimeslotsBySections(apiResponse.response);
    }

    if (apiResponse.error) {
      showAlert('', apiResponse.error.getMessage());
    }
  }

  @MadeDisableOnClick
  async onSlotClick(slot: DisplayTimeslot): Promise<void> {
    if (!slot.isBooked) {
      this.logger.info('SelectTimeComponent.onSlotClick', slot);
      this.bookingData.selectedTime = slot.startTime;
      await this.performBooking();
    }
  }

  onServiceChange(): void {
    // Tell the content to recalculate its dimensions. According to Ionic docs this
    // should be called after dynamically adding/removing headers, footers, or tabs.
    // See https://ionicframework.com/docs/api/components/content/Content/#resize
    if (this.content) {
      this.content.resize();
    }
  }

  async performBooking(): Promise<void> {
    // Prepare appointment creation request
    const appointmentRequest: CreateAppointmentRequest = {
      stylist_uuid: this.bookingData.stylist.uuid,
      datetime_start_at: this.bookingData.selectedTime.format(),
      services: this.bookingData.selectedServices.map(s => ({
        service_uuid: s.uuid
      })),
      has_card_fee_included: false,
      has_tax_included: true
    };

    // Preview the appointment
    const { response: appointment } = await this.bookingApi.previewAppointment(appointmentRequest).get();
    if (appointment) {
      if (this.bookingData.appointmentUuid && this.params.isRescheduling) {
        // we need uuid for rescheduling
        appointment.uuid = this.bookingData.appointmentUuid;
      }

      const params: AppointmentPageParams = {
        isRescheduling: this.params && this.params.isRescheduling,
        appointment
      };
      this.navCtrl.push(PageNames.Appointment, { params });
    }
  }

  onAddService(): void {
    this.servicesHeader.onAdd();
  }
}
