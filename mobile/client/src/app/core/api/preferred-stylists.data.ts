import { Injectable } from '@angular/core';

import { ApiResponse } from '~/shared/api/base.models';
import { DataStore, GetOptions } from '~/shared/storage/data-store';
import { StylistsService } from '~/core/api/stylists.service';
import {
  AddPreferredStylistResponse,
  PreferredStylistModel,
  PreferredStylistsListResponse,
  StylistUuidModel
} from '~/shared/api/stylists.models';
import { getAuthLocalData, saveAuthLocalData } from '~/shared/storage/token-utils';
import { ClientProfileStatus } from '~/shared/api/auth.models';

@Injectable()
export class PreferredStylistsData {
  private static guardInitilization = false;

  data: DataStore<PreferredStylistsListResponse>;

  /**
   * Update local profile status according to the selected stylists.
   * When we save preferred stylists we also update local profile status
   * to match it. This ensures the profile status is always up to date.
   */
  static async updateLocalProfileStatus(preferredStylists: PreferredStylistModel[]): Promise<void> {
    const authLocalData = await getAuthLocalData();
    const profileStatus: ClientProfileStatus = authLocalData.profileStatus;
    profileStatus.has_preferred_stylist_set = preferredStylists.length > 0;
    await saveAuthLocalData(authLocalData);
  }

  constructor(
    private api: StylistsService
  ) {
    if (PreferredStylistsData.guardInitilization) {
      console.error('PreferredStylistsData initialized twice. Only include it in providers array of DataModule.');
    }
    PreferredStylistsData.guardInitilization = true;

    this.data = new DataStore('preferred-stylists', () => api.getPreferredStylists(),
      { cacheTtlMilliseconds: 0 });  // 0 cache ttl for data that can be externally modified
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
    const stylists = await this.get({ refresh: true });
    await PreferredStylistsData.updateLocalProfileStatus(stylists);

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
  async removeStylist(stylistUuid: string): Promise<boolean> {
    try {
      await this.api.deletePreferredStylist(stylistUuid).get();
      const stylists = await this.get({ refresh: true });
      await PreferredStylistsData.updateLocalProfileStatus(stylists);
      return true;
    } catch (e) {
      return false;
    }
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
