import { async, ComponentFixture } from '@angular/core/testing';
import { NavParams } from 'ionic-angular';
import * as faker from 'faker';

import { TestUtils } from '~/../test';

import { appointmentMock } from '~/core/api/appointments.api.mock';
import { BookingData } from '~/core/api/booking.data';
import { offerMock, stylistsMock } from '~/core/api/stylists.service.mock';

import { BookingCompleteComponent, BookingCompleteComponentParams } from '~/booking/booking-complete/booking-complete.component';

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

        const navParams = fixture.debugElement.injector.get(NavParams);
        const params: BookingCompleteComponentParams = {
          appointment: appointmentMock
        };
        navParams.data = { params };

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
    // NOTE: we use replace(',', '') to remove commas added by currency pipe to numbers bigger than 999
    expect(totalRegularPrice.innerText.replace(',', '')).toContain(instance.bookingData.offer.totalRegularPrice);

    const price = fixture.nativeElement.querySelector('[data-test-id=price]');
    expect(price.innerText.replace(',', '')).toContain(appointmentMock.grand_total.toFixed());
  }));

  it('should have two buttons', async(() => {
    const returnHome = fixture.nativeElement.querySelector('[data-test-id=returnHome]');
    expect(returnHome).toBeDefined();

    const addToCalendar = fixture.nativeElement.querySelector('[data-test-id=addToCalendar]');
    expect(addToCalendar).toBeDefined();
  }));
});
