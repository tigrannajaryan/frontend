import { Injectable } from '@angular/core';

import { AppStorageMock } from '~/shared/storage/app-storage.mock';
import { StylistAppPersistentData } from './stylist-app-storage';

/**
 * A mock class to get or set persistent App data.
 */
@Injectable()
export class StylistAppStorageMock extends AppStorageMock<StylistAppPersistentData> {
  constructor() {
    const initialMockData = {
      pushNotificationParams: {
        isPermissionGranted: false,
        isPermissionDenied: false,
        lastPrimingScreenShown: undefined
      }
    };
    super(initialMockData);
  }
}
