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
import { AppointmentModel, AppointmentStatus } from '~/core/api/appointments.models';
import { AppointmentPageParams } from '~/appointment-page/appointment-page.component';
import { ServiceModel } from '~/core/api/services.models';

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
    private navCtrl: NavController) {
  }

  ionViewDidLoad(): void {
    this.logger.info('SelectTimeComponent.ionViewDidLoad');
  }

  async ionViewWillEnter(): Promise<void> {
    this.logger.info('SelectTimeComponent.ionViewWillEnter');
    if (this.bookingData.timeslots) {
      this.displayTimeslots(await this.bookingData.timeslots.get());
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
    // TODO: remove this code and call appointment preview API when
    // we have the real data for it.
    const appointment: AppointmentModel = {
      uuid: '',
      stylist_first_name: this.bookingData.stylist.first_name,
      stylist_last_name: this.bookingData.stylist.last_name,
      stylist_photo_url: this.bookingData.stylist.profile_photo_url,
      salon_name: this.bookingData.stylist.salon_name,
      total_price_before_tax: this.bookingData.totalClientPrice,
      total_card_fee: 0,
      total_tax: this.bookingData.totalClientPrice * 8.875 / 100,
      datetime_start_at: this.bookingData.selectedTime.format(),
      duration_minutes: 0,
      status: AppointmentStatus.new,
      services: this.bookingData.selectedServices.map(s => ({
        uuid: s.uuid,
        is_original: true,
        regular_price: s.base_price,
        client_price: this.bookingData.totalClientPrice,
        service_name: s.name
      }))
    };
    // End of debugging code. Remove code up to here.

    const params: AppointmentPageParams = {
      appointment,
      hasConfirmButton: true,
      onConfirmClick: () => this.createAppointment(appointment)
    };
    this.navCtrl.push(PageNames.Appointment, { params });
  }

  async createAppointment(appointment: AppointmentModel): Promise<void> {
    // Debugging code: Add fake appointment for now to help debug Home screen
    const homeData = await this.appointmentsData.home.get();
    homeData.response.upcoming.push();
    this.appointmentsData.home.set(homeData.response);
    // End of debugging code. Remove code up to here.

    // Create the appointment
    const appointmentRequest: CreateAppointmentRequest = {
      stylist_uuid: this.bookingData.stylist.uuid,
      datetime_start_at: this.bookingData.selectedTime.format(),
      services: this.bookingData.selectedServices.map(s => ({
        service_uuid: s.uuid
      }))
    };

    const { error } = await this.bookingApi.createAppointment(appointmentRequest).toPromise();
    if (!error) {
      // Appointment created, refresh appointments for Home screen
      this.appointmentsData.home.get({ refresh: true });

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
