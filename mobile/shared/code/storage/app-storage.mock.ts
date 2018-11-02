/**
 * A class to get or set persistent App data.
 */
export class AppStorageMock<AppPersistentData> {
  private data: AppPersistentData;

  constructor(initialMockData: AppPersistentData) {
    this.data = initialMockData;
  }

  /**
   * Reads the persistent data from external storage. If there no data stored yet
   * then creates the default state of data.
   */
  async init(): Promise<void> {
    //
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
    return Promise.resolve();
  }
}
