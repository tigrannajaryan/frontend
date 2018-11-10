import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { AppStorage } from '~/shared/storage/app-storage';
import { Logger } from '~/shared/logger';
import { PushPersistentData } from '~/shared/push/push-notification';

/**
 * The list of persistently stored app data. Add any property below that you
 * want to be able to store in persistent storage and access via ClientAppStorage class.
 */
export interface ClientAppPersistentData {
  pushNotificationParams: PushPersistentData;
}

/**
 * A class to get or set persistent App data.
 */
@Injectable()
export class ClientAppStorage extends AppStorage<ClientAppPersistentData> {
  constructor(
    storage: Storage,
    logger: Logger
  ) {
    // Define default state of data if the storage does not exist, e.g
    // we run the app the first time or storage was deleted.
    const defaultData: ClientAppPersistentData = {
      pushNotificationParams: {
        isPermissionGranted: false,
        isPermissionDenied: false,
        lastPrimingScreenShown: undefined
      }
    };

    super(storage, logger, defaultData);
  }
}
