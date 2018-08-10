import { Injectable } from '@angular/core';

import { ApiDataStore } from '~/core/utils/api-data-store';
import { PageNames } from '~/core/page-names';
import { AppointmentsResponse } from '~/core/api/appointments.models';
import { AppointmentsHistoryApi } from './appointments-history.api';

/**
 * Singleton that stores History data.
 */
@Injectable()
export class AppointmentsHistoryDataStore extends ApiDataStore<AppointmentsResponse> {
  constructor(historyApi: AppointmentsHistoryApi) {
    super(PageNames.AppointmentsHistory, () => historyApi.getHistory());
  }
}
