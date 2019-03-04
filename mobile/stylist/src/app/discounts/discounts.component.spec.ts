import { async, ComponentFixture } from '@angular/core/testing';
import { ModalController, NavController, NavParams } from 'ionic-angular';
import { ActionSheetButton } from 'ionic-angular/components/action-sheet/action-sheet-options';
import * as moment from 'moment';

import { AppointmentStatus, StylistAppointmentModel } from '~/shared/api/appointments.models';
import { getPhoneNumber } from '~/shared/utils/phone-numbers';
import { WeekdayIso } from '~/shared/weekday';

import { PageNames } from '~/core/page-names';
import { ProfileDataStore } from '~/core/profile.data';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';

import { DiscountsComponent } from '~/discounts/discounts.component';
import { TestUtils } from '../../test';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { discounts, DiscountsApiMock, maximumDiscounts } from '~/core/api/discounts.api.mock';
import { of } from 'rxjs/observable/of';

let fixture: ComponentFixture<DiscountsComponent>;
let instance: DiscountsComponent;

describe('Pages: DiscountsComponent', () => {

  prepareSharedObjectsForTests();

  beforeEach(async(() =>
    TestUtils.beforeEachCompiler(
      [DiscountsComponent],
      [
        DiscountsApiMock,
        HttpClient,
        HttpHandler
      ]
    )
      .then(compiled => {
        fixture = compiled.fixture;
        instance = compiled.instance;

        const navParams = fixture.debugElement.injector.get(NavParams);
        navParams.data.params = {
          isRootPage: true
        };
        instance.params = navParams.data.params;

        const discountsApiMock = fixture.debugElement.injector.get(DiscountsApiMock);
        spyOn(discountsApiMock, 'getDiscounts').and.returnValue(of({
          response: discounts
        }));
        spyOn(discountsApiMock, 'setDiscounts').and.returnValue(of({
          response: discounts
        }));
        spyOn(discountsApiMock, 'getMaximumDiscounts').and.returnValue(of({
          response: maximumDiscounts
        }));
        spyOn(discountsApiMock, 'setMaximumDiscounts').and.returnValue(of({
          response: maximumDiscounts
        }));

        instance.ionViewWillEnter();
        fixture.detectChanges();
      })
  ));

  afterEach(() => {
    fixture.destroy();
  });

  it('should create the page', () => {
    expect(instance).toBeTruthy();
  });

  it('should have 5 links', () => {
    const discounts_daily = fixture.nativeElement.querySelector('[data-test-id=discounts_daily]');
    expect(discounts_daily).toBeDefined();

    const discounts_deal = fixture.nativeElement.querySelector('[data-test-id=discounts_deal]');
    expect(discounts_deal).toBeDefined();

    const discounts_loyalty = fixture.nativeElement.querySelector('[data-test-id=discounts_loyalty]');
    expect(discounts_loyalty).toBeDefined();

    const discounts_firstVisit = fixture.nativeElement.querySelector('[data-test-id=discounts_firstVisit]');
    expect(discounts_firstVisit).toBeDefined();

    const discounts_maximum = fixture.nativeElement.querySelector('[data-test-id=discounts_maximum]');
    expect(discounts_maximum).toBeDefined();
  });

  it('should redirect to daily page', () => {
    const discounts_daily = fixture.nativeElement.querySelector('[data-test-id=discounts_daily]');
    expect(discounts_daily).toBeDefined();

    discounts_daily.click();

    const navCtrl = fixture.debugElement.injector.get(NavController);

    expect(navCtrl.push)
      .toHaveBeenCalledWith(PageNames.DiscountsDaily);
  });

  it('should redirect to deal page', () => {
    const discounts_deal = fixture.nativeElement.querySelector('[data-test-id=discounts_deal]');
    expect(discounts_deal).toBeDefined();

    discounts_deal.click();

    const navCtrl = fixture.debugElement.injector.get(NavController);

    expect(navCtrl.push)
      .toHaveBeenCalledWith(PageNames.DiscountsDeal);
  });

  it('should redirect to loyalty page', () => {
    const discounts_loyalty = fixture.nativeElement.querySelector('[data-test-id=discounts_loyalty]');
    expect(discounts_loyalty).toBeDefined();

    discounts_loyalty.click();

    const navCtrl = fixture.debugElement.injector.get(NavController);

    expect(navCtrl.push)
      .toHaveBeenCalledWith(PageNames.DiscountsLoyalty);
  });

  it('should redirect to firstVisit page', () => {
    const discounts_firstVisit = fixture.nativeElement.querySelector('[data-test-id=discounts_firstVisit]');
    expect(discounts_firstVisit).toBeDefined();

    discounts_firstVisit.click();

    const navCtrl = fixture.debugElement.injector.get(NavController);

    expect(navCtrl.push)
      .toHaveBeenCalledWith(PageNames.DiscountsFirstVisit);
  });

  it('should redirect to maximum page', () => {
    const discounts_maximum = fixture.nativeElement.querySelector('[data-test-id=discounts_maximum]');
    expect(discounts_maximum).toBeDefined();

    discounts_maximum.click();

    const navCtrl = fixture.debugElement.injector.get(NavController);

    expect(navCtrl.push)
      .toHaveBeenCalledWith(PageNames.DiscountsMaximum);
  });

  it('should show correct value for deal of the week', () => {
    const discounts_deal = fixture.nativeElement.querySelector('[data-test-id=discounts_deal]');
    expect(discounts_deal).toBeDefined();
    fixture.detectChanges();
    expect(discounts_deal.innerText).toContain(instance.selectedWeekDay.discount_percent);
  });

  it('should show correct value for first visit', () => {
    const discounts_firstVisit = fixture.nativeElement.querySelector('[data-test-id=discounts_firstVisit]');
    expect(discounts_firstVisit).toBeDefined();
    fixture.detectChanges();
    expect(discounts_firstVisit.innerText).toContain(instance.firstVisit);
  });

  it('should show correct value for max discount', () => {
    const discounts_maximum = fixture.nativeElement.querySelector('[data-test-id=discounts_maximum]');
    expect(discounts_maximum).toBeDefined();
    fixture.detectChanges();
    expect(discounts_maximum.innerText).toContain(instance.maximumDiscounts.maximum_discount);
  });
});
