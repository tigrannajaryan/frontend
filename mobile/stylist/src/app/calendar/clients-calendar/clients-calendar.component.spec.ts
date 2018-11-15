import { async, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs/observable/of';

import { TestUtils } from '~/../test';

import { LoadProfileAction, ProfileState } from '~/core/components/made-menu-header/profile.reducer';
import { DataModule } from '~/core/data.module';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';

import { ClientsApi } from '~/core/api/clients-api';
import { myClientsMock } from '~/core/api/clients-api.mock';
import { StylistServiceProvider } from '~/core/api/stylist.service';
import { categoryMock } from '~/core/api/stylist.service.mock';

import { ClientsCalendarComponent } from './clients-calendar.component';

let fixture: ComponentFixture<ClientsCalendarComponent>;
let instance: ClientsCalendarComponent;
let store: Store<ProfileState>;

describe('Pages: Client’s Calendar ', () => {

  prepareSharedObjectsForTests();

  beforeEach(async(() => TestUtils.beforeEachCompiler([
    ClientsCalendarComponent
  ], [
    // no providers
  ], [
    HttpClientTestingModule,
    DataModule.forRoot()
  ]).then(compiled => {
    fixture = compiled.fixture;
    instance = compiled.instance;

    store = fixture.debugElement.injector.get(Store);
  })));

  it('should create the page', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should show proper header', async done => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent)
      .toContain('My Calendar');
    expect(fixture.nativeElement.textContent)
      .toContain('Calendar view of a new client');

    store.dispatch(new LoadProfileAction());

    // Using setTimeout to be sure that all async work inside profile effects is done:
    setTimeout(async () => {
      await instance.ionViewWillLoad();
      instance.client = myClientsMock[0];
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent)
        .not.toContain('My Calendar');
      expect(fixture.nativeElement.textContent)
        .not.toContain('Calendar view of a new client');

      expect(fixture.nativeElement.textContent)
        .toContain(`${myClientsMock[0].first_name}’s Calendar Preview`);

      done();
    });
  });

  it('should show services and regular price', async done => {
    const clientsApi = fixture.debugElement.injector.get(ClientsApi);
    const servicesApi = fixture.debugElement.injector.get(StylistServiceProvider);

    spyOn(servicesApi, 'getStylistServices').and.returnValue(
      of({response: { categories: [categoryMock] }})
    );

    const pricingResponseWithTheSameServices = clientsApi.getPricing().map(response => {
      response.response.service_uuids = categoryMock.services.map(service => service.uuid);
      return response;
    });

    spyOn(clientsApi, 'getPricing').and.returnValue(pricingResponseWithTheSameServices);

    await instance.ionViewWillLoad();
    fixture.detectChanges();

    const regularPrice = categoryMock.services.reduce((price, service) => {
      expect(fixture.nativeElement.textContent)
        .toContain(service.name);

      return price + service.base_price;
    }, 0);

    expect(fixture.nativeElement.textContent)
      .toContain('Regular price');
    expect(fixture.nativeElement.textContent)
      .toContain(`$${regularPrice}`);

    done();
  });
});
