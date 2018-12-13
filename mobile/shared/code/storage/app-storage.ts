import { Storage } from '@ionic/storage';

import { Logger } from '~/shared/logger';

const storageKey = 'app-storage';

/**
 * A class to get or set persistent App data.
 */
export class AppStorage<AppPersistentData> {
  private data: AppPersistentData;
  private dataPromise: Promise<any>;

  constructor(
    private storage: Storage,
    private logger: Logger,
    private defaultData: AppPersistentData
  ) {
    this.dataPromise = this.storage.get(storageKey);
  }

  ready(): Promise<any> {
    return this.dataPromise;
  }

  /**
   * Reads the persistent data from external storage. If there no data stored yet
   * then creates the default state of data.
   */
  async init(): Promise<void> {
    this.logger.info('AppStorage: Reading data from external storage...', new Date().toISOString());

    try {
      this.data = await this.dataPromise;
    } catch (e) {
      this.logger.error('AppStorage: Failed to initialize', e);
    }

    if (this.data) {
      this.logger.info('AppStorage: Successfully read data from external storage.', new Date().toISOString());
    } else {
      this.logger.info('AppStorage: data does not exists, probably the first run, set default values.');

      this.data = this.defaultData;
    }
  }

  /**
   * Get the value of a stored data
   * @param key a string name equal to one of properties of AppPersistentData.
   */
  get<K extends keyof AppPersistentData>(key: K): AppPersistentData[K] {
    return this.data[key];
  }

  /**
   * Set the value of an stored data and saved in persistent storage
   * @param key a string name equal to one of properties of AppData
   * @param value the value to store. The type of this value is as declared in AppPersistentData.
   */
  set<K extends keyof AppPersistentData>(key: K, value: AppPersistentData[K]): Promise<void> {
    this.data[key] = value;
    return this.storage.set(storageKey, this.data);
  }

  /**
   * Removes all data from the storage.
   */
  async clearAll(): Promise<void> {
    for (const key of Object.keys(this.data)) {
      await this.storage.remove(key);
    }
  }
}
