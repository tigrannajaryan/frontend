import { async, ComponentFixture } from '@angular/core/testing';
import * as faker from 'faker';

import { TestUtils } from '../../../test';

import { BookingData } from '~/core/api/booking.data';
import { SelectDateComponent } from './select-date.component';
import { stylistsMock } from '~/core/api/stylists.service.mock';
import { loading } from '~/shared/utils/loading';

let fixture: ComponentFixture<SelectDateComponent>;
let instance: SelectDateComponent;

describe('Pages: Select Date', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([SelectDateComponent])
        .then(compiled => {
          // Common setup:
          fixture = compiled.fixture;
          instance = compiled.instance;
        })
        .then(() => {
          const bookingData = fixture.debugElement.injector.get(BookingData);
          bookingData.start(stylistsMock[0]);

          instance.ionViewWillEnter();
          fixture.detectChanges();
        })
    )
  );

  it('should create the page', () => {
    expect(instance).toBeTruthy();
  });

  it('should suggest to select service when no services are selected', async () => {
    // Initially we have no service defined, so NoServiceSelected should be visible
    let noServiceSelected = fixture.nativeElement.querySelector('.NoServiceSelected');
    expect(noServiceSelected).not.toBeNull();

    // Add a service
    const bookingData = fixture.debugElement.injector.get(BookingData);
    await bookingData.setSelectedServices([{
      uuid: faker.random.uuid(),
      name: faker.commerce.productName(),
      base_price: faker.random.number()
    }]);
    fixture.detectChanges();

    // Now NoServiceSelected should not be visible
    noServiceSelected = fixture.nativeElement.querySelector('.NoServiceSelected');
    expect(noServiceSelected).toBeNull();

    // There must be a visible price
    expect(instance.prices[0].price).toBeGreaterThan(0);

    // Remove the service again
    await bookingData.setSelectedServices([]);
    fixture.detectChanges();

    // Now NoServiceSelected should become visible again
    noServiceSelected = fixture.nativeElement.querySelector('.NoServiceSelected');
    expect(noServiceSelected).not.toBeNull();

    // There must be an undefined price in the pricelist, so that the price is not shown
    expect(instance.prices[0].price).toBeUndefined();
  });

  it('should have working selectServiceBigBtn', async () => {
    const selectServiceBigBtn = fixture.nativeElement.querySelector('[data-test-id=selectServiceBigBtn]');
    expect(selectServiceBigBtn).not.toBeNull();

    spyOn(instance.servicesHeader, 'onAdd');
    selectServiceBigBtn.click();

    expect(instance.servicesHeader.onAdd).toHaveBeenCalled();
  });

  it('should have `user-name-photo` component with correct data', async () => {
    const bookingData = fixture.debugElement.injector.get(BookingData);
    const userFullName = fixture.nativeElement.querySelector('[data-test-id=userFullName]');
    expect(userFullName.innerHTML).toContain(bookingData.stylist.first_name);
  });

  it('should have pricing hints', async () => {
    const pricingHints = fixture.nativeElement.querySelector('[data-test-id=pricingHints]');
    expect(pricingHints).toBeDefined();
  });
});
