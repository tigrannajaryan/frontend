/**
 * Simple Ionic Storage mock for tests.
 */
export class StorageMock {
  private data = {};
  async get(key: string): Promise<any> {
    return this.data[key];
  }
  async set(key: string, value: any): Promise<void> {
    this.data[key] = value;
  }
}
