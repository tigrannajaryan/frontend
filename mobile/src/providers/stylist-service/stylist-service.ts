import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseServiceProvider } from '../base-service';
import { Services, ServicesTemplate, ServiceTemplateSet, StylistProfile } from './stylist-models';
import { StoreServiceHelper } from '../store/store-helper';
import { ServicesResponse, ServiceTemplateSetResponse, ServiceTemplatesResponse } from '../store/store-model';

/**
 * StylistServiceProvider provides authentication against server API.
 * The service requires the current user to be authenticated using
 * AuthServiceProvider.
 */
@Injectable()
export class StylistServiceProvider extends BaseServiceProvider {

  constructor(public http: HttpClient, private storeHelper: StoreServiceHelper) {
    super(http);
  }

  /**
   * Set the profile of the stylist. The stylist must be already authenticated as a user.
   */
  async setProfile(data: StylistProfile): Promise<StylistProfile> {
    return this.post('stylist/profile', data)
    .then<StylistProfile>((profile: StylistProfile) => new Promise(() => {
      this.storeHelper.update('styleProfile', profile);
    }));
  }

  /**
   * Get the profile of the stylist. The stylist must be already authenticated as a user.
   */
  async getProfile(): Promise<StylistProfile> {
    return this.get('stylist/profile')
      .then<StylistProfile>((profile: StylistProfile) => new Promise(() => {
        this.storeHelper.update('styleProfile', profile);
      }));
  }

  /**
   * Get default service Templates. The stylist must be already authenticated as a user.
   */
  async getServiceTemplateSets(): Promise<ServiceTemplatesResponse> {
    return this.get('stylist/service-template-sets')
      .then<ServiceTemplatesResponse>((res: ServiceTemplatesResponse) => new Promise(() => {
        this.storeHelper.update('service_templates', res.service_templates as ServicesTemplate[]);
      }));
  }

  /**
   * Get default service Templates by Id. The stylist must be already authenticated as a user.
   */
  async getServiceTemplateSetById(uuid: string): Promise<ServiceTemplateSetResponse> {
    return this.get(`stylist/service-template-sets/${uuid}`)
      .then<ServiceTemplateSetResponse>((res: ServiceTemplateSetResponse) => new Promise(() => {
        this.storeHelper.update('template_set', res.template_set as ServiceTemplateSet);
      }));
  }

  /**
   * Get stylist services. The stylist must be already authenticated as a user.
   */
  async getStylistServices(): Promise<ServicesResponse> {
    return this.get('stylist/services')
      .then<ServicesResponse>((res: ServicesResponse) =>  new Promise(() => {
        this.storeHelper.update('services', res.services as Services[]);
      }));
  }

  /**
   * Set service to stylist. The stylist must be already authenticated as a user.
   */
  async setStylistServices(data: any): Promise<Services> {
    return this.post<Services>('stylist/services', data);
  }
}
