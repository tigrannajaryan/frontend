import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseServiceProvider } from '../base-service';
import {Services, ServiceTemplate, ServiceTemplateSet, StylistProfile} from './stylist-models';
import { StoreServiceHelper } from '../store/store-helper';
import { Store } from '../store/store-model';

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
  async setProfile(data: StylistProfile): Promise<any> {
    return this.post<StylistProfile>('stylist/profile', data)
      .then((profile: StylistProfile) => this.storeHelper.update('styleProfile', profile));
  }

  /**
   * Get the profile of the stylist. The stylist must be already authenticated as a user.
   */
  async getProfile(): Promise<any> {
    return this.get<StylistProfile>('stylist/profile')
      .then((profile: StylistProfile) => this.storeHelper.update('styleProfile', profile));
  }

  /**
   * Get default service Templates. The stylist must be already authenticated as a user.
   */
  async getServiceTemplates(): Promise<any> {
    return this.get<Store>('stylist/service-template-sets')
      .then((res: Store) => this.storeHelper.update('service_templates', res.service_templates as ServiceTemplate[]));
  }

  /**
   * Get default service Templates by Id. The stylist must be already authenticated as a user.
   */
  async getServiceTemplateById(uuid: number): Promise<any> {
    return this.get<Store>(`stylist/service-template-sets/${uuid}`)
      .then((res: Store) => this.storeHelper.update('template_set', res.template_set as ServiceTemplateSet));
  }

  /**
   * Get stylist services. The stylist must be already authenticated as a user.
   */
  async getStylistServices(): Promise<any> {
    return this.get<Store>('stylist/services')
      .then((res: Store) => this.storeHelper.update('services', res.services as Services[]));
  }

  /**
   * Set service to stylist. The stylist must be already authenticated as a user.
   */
  async setStylistServices(data: any): Promise<any> {
    return this.post<Store>('stylist/services', data);
  }
}
