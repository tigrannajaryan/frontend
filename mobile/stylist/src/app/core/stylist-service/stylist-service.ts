import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BaseApiService } from '~/shared/base-api-service';
import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';

import {
  ServiceItem, ServiceTemplateSet, ServiceTemplateSetBase, StylistProfile,
  StylistServicesList, StylistSummary
} from './stylist-models';

export interface ServiceTemplateSetListResponse {
  service_template_sets: ServiceTemplateSetBase[];
}

export interface StylistServicesListResponse extends StylistServicesList {
  service_time_gap_minutes: number;
}

export interface ServiceTemplateSetResponse extends ServiceTemplateSet {
  service_time_gap_minutes: number;
}

/**
 * StylistServiceProvider provides authentication against server API.
 * The service requires the current user to be authenticated using
 * AuthServiceProvider.
 */
@Injectable()
export class StylistServiceProvider extends BaseApiService {

  constructor(
    public http: HttpClient,
    public logger: Logger,
    protected serverStatus: ServerStatusTracker) {
    super(http, logger, serverStatus);
  }

  /**
   * Set the profile of the stylist. The stylist must be already authenticated as a user.
   */
  async setProfile(data: StylistProfile): Promise<StylistProfile> {
    return this.post<StylistProfile>('stylist/profile', data);
  }

  /**
   * Get the profile of the stylist. The stylist must be already authenticated as a user.
   */
  async getProfile(): Promise<StylistProfile> {
    return this.get<StylistProfile>('stylist/profile');
  }

  /**
   * Get data for stylist settings screen. The stylist must be already authenticated as a user.
   */
  async getStylistSummary(): Promise<StylistSummary> {
    return this.get<StylistSummary>('stylist/settings');
  }

  /**
   * Get default service Templates. The stylist must be already authenticated as a user.
   */
  async getServiceTemplateSetsList(): Promise<ServiceTemplateSetListResponse> {
    return this.get<ServiceTemplateSetListResponse>('stylist/service-template-sets');
  }

  /**
   * Get default service Templates by Id. The stylist must be already authenticated as a user.
   */
  async getServiceTemplateSetByUuid(uuid: string): Promise<ServiceTemplateSetResponse> {
    return this.get<ServiceTemplateSetResponse>(`stylist/service-template-sets/${uuid}`);
  }

  /**
   * Get stylist services. The stylist must be already authenticated as a user.
   */
  async getStylistServices(): Promise<StylistServicesListResponse> {
    return this.get<StylistServicesListResponse>('stylist/services');
  }

  /**
   * Set service to stylist. The stylist must be already authenticated as a user.
   */
  async setStylistServices(data: any): Promise<ServiceItem> {
    return this.post<ServiceItem>('stylist/services', data);
  }

  /**
   * Deletes service of a stylist. The stylist must be already authenticated as a user.
   */
  async deleteStylistService(uuid: string): Promise<ServiceItem> {
    return this.delete<ServiceItem>(`stylist/services/${uuid}`);
  }
}
