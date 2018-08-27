import { Injectable } from '@angular/core';

import { ApiResponse } from '~/core/api/base.models';
import { DataStore } from '~/core/utils/data-store';
import { StylistsService } from '~/core/api/stylists-service';
import {
  PreferredStylistModel,
  PreferredStylistsListResponse,
  SetPreferredStylistResponse,
  StylistModel
} from '~/core/api/stylists.models';

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

    this.data = new DataStore('preferred-stylists', () => api.getPreferredStylists());
  }

  /**
   * Almost the same as DataSet.get.
   */
  async get(...args): Promise<PreferredStylistModel[]> {
    const { response } = await this.data.get(...args);
    return response.stylists || [];
  }

  /**
   * Set a stylist as a preferred stylist of the client:
   * - perform request only when a stylist is not in the list,
   * - update corresponding DataStore.
   */
  async set(newStylist: StylistModel): Promise<ApiResponse<SetPreferredStylistResponse>> {
    const stylists = await this.get();
    const preferredStylist = stylists.find(stylist => stylist.uuid === newStylist.uuid);

    // Already preferred stylist, return:
    if (preferredStylist) {
      return {
        response: {
          preference_uuid: preferredStylist.preference_uuid
        }
      };
    }

    // TODO: remove next when work with multiple preferred stylists
    await this.clearAll();

    return this.api.setPreferredStylist(newStylist.uuid)
      .map(({ response }) => {
        this.data.set({
          stylists: [
            ...stylists,
            {
              ...newStylist,
              preference_uuid: response.preference_uuid
            }
          ]
        });
        return { response };
      })
      .first()
      .toPromise();
  }

  /**
   * In V1 implementation we should have only one preferred stylist and would like to clear all before adding a new one.
   */
  private async clearAll(): Promise<void> {
    const preferredStylists = await this.get();
    await Promise.all(
      preferredStylists.map(stylist => this.api.deletePreferredStylist(stylist.preference_uuid).first().toPromise())
    );
    this.data.set({ stylists: [] });
  }
}
