import { Injectable } from '@angular/core';
import { BaseApiService } from '../base-api-service';
import { ServiceItem, ServicesTemplate, ServiceTemplateSet, StylistProfile } from './stylist-models';
import { HttpClient } from '@angular/common/http';
import { Logger } from '../logger';
import { ServerStatusTracker } from '../server-status-tracker';

export interface ServicesResponse {
  services: ServiceItem[];
}

export interface ServiceTemplatesResponse {
  service_templates: ServicesTemplate[];
}

export interface ServiceTemplateSetResponse {
  template_set: ServiceTemplateSet;
}

/**
 * StylistServiceProvider provides authentication against server API.
 * The service requires the current user to be authenticated using
 * AuthServiceProvider.
 */
@Injectable()
export class StylistServiceProvider extends BaseApiService {

  constructor(
    protected http: HttpClient,
    protected logger: Logger,
    protected serverStatus: ServerStatusTracker
  ) {
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
   * Get default service Templates. The stylist must be already authenticated as a user.
   */
  async getServiceTemplateSets(): Promise<ServiceTemplatesResponse> {
    return this.get<ServiceTemplatesResponse>('stylist/service-template-sets');
  }

  /**
   * Get default service Templates by Id. The stylist must be already authenticated as a user.
   */
  async getServiceTemplateSetById(uuid: string): Promise<ServiceTemplateSetResponse> {
    return this.get<ServiceTemplateSetResponse>(`stylist/service-template-sets/${uuid}`);
  }

  /**
   * Get stylist services. The stylist must be already authenticated as a user.
   */
  async getStylistServices(): Promise<ServicesResponse> {
    return this.get<ServicesResponse>('stylist/services');
  }

  /**
   * Set service to stylist. The stylist must be already authenticated as a user.
   */
  async setStylistServices(data: any): Promise<ServiceItem> {
    return this.post<ServiceItem>('stylist/services', data);
  }
}
