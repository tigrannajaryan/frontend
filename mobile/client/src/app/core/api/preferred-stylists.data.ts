import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { ApiResponse } from '~/shared/api/base.models';
import { DataStore, GetOptions } from '~/shared/storage/data-store';
import { StylistsService } from '~/core/api/stylists-service';
import {
  AddPreferredStylistResponse,
  PreferredStylistModel,
  PreferredStylistsListResponse,
  StylistUuidModel
} from '~/shared/api/stylists.models';

@Injectable()
export class PreferredStylistsData {
  private static guardInitilization = false;

  data: DataStore<PreferredStylistsListResponse>;

  constructor(
    private api: StylistsService
  ) {
    if (PreferredStylistsData.guardInitilization) {
      console.error('PreferredStylistsData initialized twice. Only include it in providers array of DataModule.');
    }
    PreferredStylistsData.guardInitilization = true;

    // Amazon requires to update an image URL after one hour.
    const ttl1hour = moment.duration(1, 'hour').asMilliseconds();

    this.data = new DataStore('preferred-stylists', () => api.getPreferredStylists(),
      { cacheTtlMilliseconds: ttl1hour });
  }

  /**
   * Almost the same as DataSet.get.
   */
  async get(options?: GetOptions): Promise<PreferredStylistModel[]> {
    const { response } = await this.data.get(options);

    return response.stylists || [];
  }

  /**
   * Add selected stylist to my stylists
   * and update corresponding DataStore.
   */
  async addStylist(newStylist: StylistUuidModel): Promise<ApiResponse<AddPreferredStylistResponse>> {
    const { response: addResponse } = await this.api.addPreferredStylist(newStylist.uuid).get();
    await this.get({ refresh: true });

    return { response: addResponse };
  }

  /**
   * Check if a stylist is already a preferred one
   */
  async hasStylist(stylistToSearch: StylistUuidModel): Promise<boolean> {
    const stylists = await this.get();
    return stylists.some((stylist: StylistUuidModel) => stylist.uuid === stylistToSearch.uuid);
  }

  /**
   * Remove Preferred stylist
   */
  async removeStylist(stylistUuid: string): Promise<void> {
    await this.api.deletePreferredStylist(stylistUuid).get();
    await this.get({ refresh: true });
  }

  /**
   * In V1 implementation we should have only one preferred stylist and would like to clear all before adding a new one.
   */
  // private async clearAll(): Promise<void> {
  async clearAll(): Promise<void> {
    const preferredStylists = await this.get({ refresh: true });
    await Promise.all(
      preferredStylists.map(stylist => this.api.deletePreferredStylist(stylist.preference_uuid).get())
    );
    this.data.set({ stylists: [] });
  }
}
