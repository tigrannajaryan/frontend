import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import * as moment from 'moment';

import { Logger } from '~/shared/logger';
import { formatTimeInZone } from '~/shared/utils/string-utils';
import { showAlert } from '~/core/utils/alert';
import { PageNames } from '~/core/page-names';
import { BookingData } from '~/core/api/booking.data';
import { ApiResponse } from '~/core/api/base.models';
import { BookingApi, CreateAppointmentRequest, TimeslotsResponse } from '~/core/api/booking.api';
import { AppointmentsDataStore } from '~/core/api/appointments.datastore';
import { ServiceModel } from '~/core/api/services.models';
import { AppointmentPageParams } from '~/appointment-page/appointment-page.component';
import { loading } from '~/core/utils/loading';

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

@IonicPage()
@Component({
  selector: 'page-select-time',
  templateUrl: 'select-time.component.html'
})
export class SelectTimeComponent {

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
    private appointmentsData: AppointmentsDataStore,
    private bookingApi: BookingApi,
    protected bookingData: BookingData,
    private logger: Logger,
    protected navCtrl: NavController) {
  }

  ionViewDidLoad(): void {
    this.logger.info('SelectTimeComponent.ionViewDidLoad');
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

  onSlotClick(slot: DisplayTimeslot): void {
    if (!slot.isBooked) {
      this.logger.info('SelectTimeComponent.onSlotClick', slot);
      this.bookingData.selectedTime = slot.startTime;
      this.performBooking();
    }
  }

  async performBooking(): Promise<void> {
    // Prepare appointment creation request
    const appointmentRequest: CreateAppointmentRequest = {
      stylist_uuid: this.bookingData.stylist.uuid,
      datetime_start_at: this.bookingData.selectedTime.format(),
      services: this.bookingData.selectedServices.map(s => ({
        service_uuid: s.uuid
      }))
    };

    // Preview the appointment
    const { response, error } = await this.bookingApi.previewAppointment(appointmentRequest).toPromise();
    if (!error) {
      const params: AppointmentPageParams = {
        appointment: response,
        onConfirmClick: () => this.createAppointment(appointmentRequest)
      };
      this.navCtrl.push(PageNames.Appointment, { params });
    }
  }

  async createAppointment(appointmentRequest: CreateAppointmentRequest): Promise<void> {
    const { error } = await this.bookingApi.createAppointment(appointmentRequest).toPromise();
    if (!error) {
      // Appointment succesfully created. Refresh Home screen.
      this.appointmentsData.home.refresh();

      // Show "booking complete" message.
      this.navCtrl.push(PageNames.BookingComplete);
    }
  }

  onDeleteService(service: ServiceModel): void {
    this.bookingData.deleteService(service);
  }

  onAddService(): void {
    // TODO: navigate to Add Service screen
  }
}
