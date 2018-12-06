import { async, ComponentFixture } from '@angular/core/testing';
import { formatNumber } from 'libphonenumber-js';

import { TestUtils } from '~/../test';

import { NumberFormat } from '~/shared/directives/phone-input.directive';
import { getPhoneNumber } from '~/shared/utils/phone-numbers';

import { ProfileApiMock, profileNotCompleate } from '~/core/api/profile-api.mock';
import { ProfileApi } from '~/core/api/profile-api';
import { ProfileModel } from '~/core/api/profile.models';
import { checkProfileCompleteness } from '~/core/utils/user-utils';

import { ApiResponse, ISODate } from '~/shared/api/base.models';
import { BookingCompleteComponent } from '~/booking/booking-complete/booking-complete.component';
import { BookingData } from '~/core/api/booking.data';
import { offerMock, stylistsMock } from '~/core/api/stylists.service.mock';
import { DiscountType } from '~/shared/api/price.models';
import * as faker from "faker";

let fixture: ComponentFixture<BookingCompleteComponent>;
let instance: BookingCompleteComponent;


describe('Pages: Profile summary', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([BookingCompleteComponent])
        .then(compiled => {
          // Common setup:
          fixture = compiled.fixture;
          instance = compiled.instance;
        }).then(() => {
        const bookingData = fixture.debugElement.injector.get(BookingData);
        bookingData.start(stylistsMock[0]);
        bookingData.setSelectedServices([{
          uuid: faker.random.uuid(),
          name: faker.commerce.productName(),
          base_price: faker.random.number()
        }]);
        bookingData.setOffer(offerMock);

        instance.ionViewWillEnter();
        fixture.detectChanges();
      })
    )
  );

  it('should create the page', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should have proper title', async(() => {
    const bookingCompleteTitle = fixture.nativeElement.querySelector('[data-test-id=bookingCompleteTitle]');
    expect(bookingCompleteTitle.innerText.replace(/\n/, '')).toContain(`Congratulations, your booking is complete!`);
  }));

  it('should have price and totalRegularPrice', async(() => {
    const totalRegularPrice = fixture.nativeElement.querySelector('[data-test-id=totalRegularPrice]');
    expect(totalRegularPrice.innerText).toContain(instance.bookingData.offer.totalRegularPrice);

    const price = fixture.nativeElement.querySelector('[data-test-id=price]');
    expect(price.innerText).toContain(instance.bookingData.offer.price);
  }));

  it('should have two buttons', async(() => {
    const returnHome = fixture.nativeElement.querySelector('[data-test-id=returnHome]');
    expect(returnHome).toBeDefined();

    const addToCalendar = fixture.nativeElement.querySelector('[data-test-id=addToCalendar]');
    expect(addToCalendar).toBeDefined();
  }));
});
