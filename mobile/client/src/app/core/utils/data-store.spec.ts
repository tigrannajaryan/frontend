import { Injector } from '@angular/core';
import { async, inject, TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';

import { ApiResponse } from '~/core/api/base.models';
import { AppModule } from '~/app.module';
import { DataStore } from './data-store';
import { StorageMock } from './storage-mock';

type ResponseType = string;

let counter = 0;
const fakeApi = {
  endpoint: (): Observable<ApiResponse<ResponseType>> => {
    return Observable.of({ response: `hello${counter++}` });
  }
};

describe('DataStore', () => {

  beforeEach(async(() => TestBed.configureTestingModule({
    providers: [
      { provide: Storage, useClass: StorageMock }
    ]
  })));

  beforeEach(
    inject([Injector], (injector: Injector) => {
      // Make AppModule.injector available in tested code
      AppModule.injector = injector;
    }));

  it('should initialize with undefined value', () => {
    const store = new DataStore('mykey', fakeApi.endpoint);
    expect(store.value()).toEqual(undefined);
  });

  it('should call endpoint on first get({ refresh: false })', async () => {

    counter = 0;
    const spy = spyOn(fakeApi, 'endpoint').and.callThrough();

    const store = new DataStore('mykey', fakeApi.endpoint);

    expect(spy.calls.count()).toEqual(0);

    // Ensure we can get the data from API
    expect(await (store.get({ refresh: false }))).toEqual({ response: 'hello0' });
    expect(store.value()).toEqual({ response: 'hello0' });

    // Ensure API was called once
    expect(spy).toHaveBeenCalled();
    expect(spy.calls.count()).toEqual(1);

    expect(await (store.get({ refresh: false }))).toEqual({ response: 'hello0' });
    expect(store.value()).toEqual({ response: 'hello0' });

    // Ensure second get({ refresh: false}) does not call the API again
    expect(spy.calls.count()).toEqual(1);
  });

  it('should refresh call endpoint on get({ refresh: true })', async () => {

    counter = 10;

    const spy = spyOn(fakeApi, 'endpoint').and.callThrough();

    const store = new DataStore('mykey', fakeApi.endpoint);

    expect(spy.calls.count()).toEqual(0);

    expect(await (store.get({ refresh: false }))).toEqual({ response: 'hello10' });
    expect(store.value()).toEqual({ response: 'hello10' });

    // Ensure get({ refresh: true}) calls the API again
    expect(await (store.get({ refresh: true }))).toEqual({ response: 'hello11' });
    expect(store.value()).toEqual({ response: 'hello11' });

    expect(spy.calls.count()).toEqual(2);
  });

  it('should set() data correctly', async () => {

    counter = 20;

    const spy = spyOn(fakeApi, 'endpoint').and.callThrough();

    const store = new DataStore('mykey', fakeApi.endpoint);
    await store.set('mydata');

    expect(await (store.get({ refresh: false }))).toEqual({ response: 'mydata' });

    // Now refresh and read again
    expect(await (store.get({ refresh: true }))).toEqual({ response: 'hello20' });
  });
});
