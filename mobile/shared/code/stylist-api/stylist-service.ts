import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Events } from 'ionic-angular';

import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { BaseService } from '~/shared/api/base-service';
import { SharedEventTypes } from '~/shared/events/event-types';
import { ApiResponse } from '~/shared/api/base.models';

import {
  ServiceItem, ServiceTemplateSet, ServiceTemplateSetBase, StylistProfile,
  StylistServicesList, StylistSummary
} from './stylist-models';
import { AppointmentDateOffer } from './home.models';

export interface ServiceTemplateSetListResponse {
  service_template_sets: ServiceTemplateSetBase[];
}

export interface StylistServicesListResponse extends StylistServicesList {
  service_time_gap_minutes: number;
}

export interface ServiceTemplateSetResponse extends ServiceTemplateSet {
  service_time_gap_minutes: number;
}

export interface ServicesPricesParams {
  service_uuid: string;
  client_uuid?: string;
}

export interface ServicesPricesResponse {
  service_uuid: string;
  service_name: string;
  prices: AppointmentDateOffer[];
}

/**
 * StylistServiceProvider provides authentication against server API.
 * The service requires the current user to be authenticated using
 * AuthServiceProvider.
 */
@Injectable()
export class StylistServiceProvider extends BaseService {

  constructor(
    private events: Events,
    http: HttpClient,
    logger: Logger,
    serverStatus: ServerStatusTracker) {
    super(http, logger, serverStatus);
  }

  /**
   * Set the profile of the stylist. The stylist must be already authenticated as a user.
   */
  setProfile(data: StylistProfile): Observable<ApiResponse<StylistProfile>> {
    return this.post<StylistProfile>('stylist/profile', data);
  }

  /**
   * Get the profile of the stylist. The stylist must be already authenticated as a user.
   */
  getProfile(): Observable<ApiResponse<StylistProfile>> {
    return this.get<StylistProfile>('stylist/profile')
      .map(response => {
        // Publish event to update gmap key.
        if (response.response) {
          this.events.publish(SharedEventTypes.UPDATE_GMAP_KEY, response.response.google_api_key);
        }
        return response;
      });
  }

  /**
   * Get data for stylist settings screen. The stylist must be already authenticated as a user.
   */
  getStylistSummary(): Observable<ApiResponse<StylistSummary>> {
    return this.get<StylistSummary>('stylist/settings');
  }

  /**
   * Get default service Templates. The stylist must be already authenticated as a user.
   */
  getServiceTemplateSetsList(): Observable<ApiResponse<ServiceTemplateSetListResponse>> {
    return this.get<ServiceTemplateSetListResponse>('stylist/service-template-sets');
  }

  /**
   * Get default service Templates by Id. The stylist must be already authenticated as a user.
   */
  getServiceTemplateSetByUuid(uuid: string): Observable<ApiResponse<ServiceTemplateSetResponse>> {
    return this.get<ServiceTemplateSetResponse>(`stylist/service-template-sets/${uuid}`);
  }

  /**
   * Get stylist services. The stylist must be already authenticated as a user.
   */
  getStylistServices(): Observable<ApiResponse<StylistServicesListResponse>> {
    return this.get<StylistServicesListResponse>('stylist/services');
  }

  /**
   * Set service to stylist. The stylist must be already authenticated as a user.
   */
  setStylistServices(data: any): Observable<ApiResponse<ServiceItem>> {
    return this.post<ServiceItem>('stylist/services', data);
  }

  /**
   * Deletes service of a stylist. The stylist must be already authenticated as a user.
   */
  deleteStylistService(uuid: string): Observable<ApiResponse<ServiceItem>> {
    return this.delete<ServiceItem>(`stylist/services/${uuid}`);
  }

  /**
   * Get prices for a dates period from now. The stylist must be already authenticated as a user.
   */
  getServicesPricesByDate(data: ServicesPricesParams): Observable<ApiResponse<ServicesPricesResponse>> {
    return this.post<ServicesPricesResponse>('stylist/services/pricing', data);
  }
}
