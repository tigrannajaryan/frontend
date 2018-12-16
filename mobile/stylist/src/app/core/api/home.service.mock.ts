import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { ApiRequestOptions } from '~/shared/api-errors';
import { ApiResponse } from '~/shared/api/base.models';

import {
  Appointment,
  AppointmentChangeRequest,
  AppointmentParams,
  AppointmentPreviewRequest,
  AppointmentPreviewResponse,
  AppointmentStatuses,
  DatesWithAppointmentsResponse,
  HomeData,
  NewAppointmentRequest
} from './home.models';

@Injectable()
export class HomeServiceMock {

  /**
   * Get home page data. The stylist must be already authenticated as a user.
   */
  getHome(query: string): Observable<ApiResponse<HomeData>> {
    return Observable.of({
      response: {
        appointments: [],
        today_visits_count: 0,
        upcoming_visits_count: 0,
        followers: 0,
        this_week_earning: 0,
        today_slots: 0
      }
    });
  }

  /**
   * Get all appointments. The stylist must be already authenticated as a user.
   */
  getAppointments(appointmentParams?: AppointmentParams): Observable<ApiResponse<Appointment[]>> {
    return Observable.of({ response: [] });
  }

  getDatesWithAppointments(appointmentParams?: AppointmentParams): Observable<ApiResponse<DatesWithAppointmentsResponse>> {
    return Observable.of({ response: { dates: [] } });
  }

  /**
   * Get appointment preview. The stylist must be already authenticated as a user.
   */
  getAppointmentPreview(data: AppointmentPreviewRequest): Observable<ApiResponse<AppointmentPreviewResponse>> {
    return Observable.of({
      response: {
        duration_minutes: 0,
        grand_total: 0,
        total_client_price_before_tax: 0,
        total_tax: 0,
        total_card_fee: 0,
        tax_percentage: 0,
        card_fee_percentage: 0,
        services: [
            {
                service_uuid: '',
                service_name: 'Color',
                client_price: 0,
                regular_price: 0,
                is_original: false,
                isChecked: false
            }
        ]
      }
    });
  }

  /**
   * Creates new appointment. The stylist must be already authenticated as a user.
   */
  createAppointment(data: NewAppointmentRequest, forced: boolean, options: ApiRequestOptions): Observable<ApiResponse<Appointment>> {
    return this.getAppointmentById('');
  }

  /**
   * Get appointment by id. The stylist must be already authenticated as a user.
   */
  getAppointmentById(appointmentUuid: string): Observable<ApiResponse<Appointment>> {
    return Observable.of({
      response: {
        uuid: 'string',
        client_first_name: 'string',
        client_last_name: 'string',
        client_phone: 'string',
        total_client_price_before_tax: 0,
        total_tax: 0,
        total_card_fee: 0,
        has_tax_included: false,
        has_card_fee_included: false,
        datetime_start_at: '2018-01-02T00:00:00+00:00',
        duration_minutes: 0,
        status: AppointmentStatuses.new,
        services: [],
        client_uuid: 'string',
        client_profile_photo_url: 'string',
        grand_total: 0,
        created_at: 'string'
      }
    });
  }

  /**
   * Change appointment by uuid.
   */
  changeAppointment(appointmentUuid: string, data: AppointmentChangeRequest): Observable<ApiResponse<Appointment>> {
    return this.getAppointmentById('');
  }
}
