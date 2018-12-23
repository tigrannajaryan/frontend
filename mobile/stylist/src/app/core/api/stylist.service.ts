import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Events } from 'ionic-angular';

import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { BaseService } from '~/shared/api/base.service';
import { SharedEventTypes } from '~/shared/events/shared-event-types';
import { ApiResponse } from '~/shared/api/base.models';

import {
  ServiceCategory,
  ServiceItem, ServiceTemplateSet, ServiceTemplateSetBase,
  SetStylistServicesParams, StylistProfile, StylistServicesListResponse
} from '~/shared/api/stylist-app.models';
import { AppointmentDateOffer } from './home.models';

export interface ServiceTemplateSetListResponse {
  service_template_sets: ServiceTemplateSetBase[];
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
          this.events.publish(SharedEventTypes.update_gmap_key, response.response.google_api_key);
        }
        return response;
      });
  }

  /**
   * Load and populate Google Maps API key from the server.
   * NOTE: this key is returned in the request for stylist’s profile.
   */
  loadGoogleMapsApiKey(): Observable<ApiResponse<string>> {
    return this.get<StylistProfile>('stylist/profile')
      .map(({response, error}) => {
        // Publish event to update gmap key.
        if (response) {
          this.events.publish(SharedEventTypes.update_gmap_key, response.google_api_key);
          return { response: response.google_api_key };
        }
        return { response: undefined, error };
      });
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
  setStylistServices(data: SetStylistServicesParams): Observable<ApiResponse<StylistServicesListResponse>> {
    return this.post<StylistServicesListResponse>('stylist/services', data);
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

  /**
   * Converts groupped services from this.categores into a flat
   * array of ServiceItem.
   */
  getFlatServiceList(categories: ServiceCategory[]): ServiceItem[] | undefined {
    return categories.reduce((services, category) => (
      services.concat(
        category.services.map(service => ({
          ...service,
          is_enabled: true,
          category_uuid: category.uuid
        }))
      )
    ), []);
  }

  /**
   * Patch stylist’s profile providing only instagram_access_token.
   */
  setInstagramAccessToken(token: string): Observable<ApiResponse<StylistProfile>> {
    return this.patch('stylist/profile', { instagram_access_token: token });
  }
}
