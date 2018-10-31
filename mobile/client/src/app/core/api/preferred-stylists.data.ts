import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { ApiResponse } from '~/shared/api/base.models';
import { DataStore, GetOptions } from '~/shared/storage/data-store';
import { StylistsService } from '~/core/api/stylists-service';
import {
  PreferredStylistModel,
  PreferredStylistsListResponse,
  SetPreferredStylistResponse,
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
   * Set a stylist as a preferred stylist of the client:
   * - perform request only when a stylist is not in the list,
   * - update corresponding DataStore.
   */
  async set(newStylist: StylistUuidModel): Promise<ApiResponse<SetPreferredStylistResponse>> {
    // TODO: remove next line when work with multiple preferred stylists
    await this.clearAll();

    const { response: setResponse } = await this.api.setPreferredStylist(newStylist.uuid).get();
    const { response: getResponse } = await this.api.getPreferredStylists().get();

    if (setResponse && getResponse) {
      const stylist = getResponse.stylists.find(s => s.uuid === newStylist.uuid);
      if (stylist) {
        this.data.set({
          stylists: [
            // TODO: use concat here instead when work with multiple preferred stylists
            {
              ...stylist,
              preference_uuid: setResponse.preference_uuid
            }
          ]
        });
      }
    }

    return { response: setResponse };
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
