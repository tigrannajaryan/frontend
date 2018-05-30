import { async, ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { DiscountsComponent } from './discounts.component';
import { TestUtils } from '../../test';
import { ModalController } from 'ionic-angular';
import { CoreModule } from '~/core/core.module';
import { DiscountsApi } from './discounts.api';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

let injector: TestBed;
let fixture: ComponentFixture<DiscountsComponent>;
let instance: DiscountsComponent;
let discountsApi: DiscountsApi;
let httpMock: HttpTestingController;

describe('Pages: DiscountsComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule,
        HttpClientTestingModule
      ],
      providers: [
        ModalController,
        DiscountsApi
      ]
    });
  }));

  beforeEach(async(() => TestUtils.beforeEachCompiler([DiscountsComponent])
    .then(compiled => {
      fixture = compiled.fixture;
      instance = compiled.instance;

      injector = getTestBed();
      discountsApi = injector.get(DiscountsApi);
      httpMock = injector.get(HttpTestingController);
    })));

  // TODO: finish tests
  // it('should create the page', async(() => {
  //   expect(instance)
  //     .toBeTruthy();
  // }));

  // it('should get discounts on init', async(() => {
  //   instance.init();
  //
  //   const dummyDiscounts: Discounts = {
  //     weekdays: [{
  //       weekday: 0,
  //       discount_percent: 0
  //     }],
  //     first_booking: 0,
  //     rebook_within_1_week: 0,
  //     rebook_within_2_weeks: 0
  //   };
  //
  //   discountsApi.getDiscounts().then((red: Discounts) => {
  //     expect(red.weekdays.length).toBe(1);
  //     expect(red).toEqual(dummyDiscounts);
  //   });
  //
  //
  //   const req = httpMock.expectOne(`${ENV.apiUrl}stylist/discounts`);
  //   expect(req.request.responseType).toEqual('json');
  //   req.flush(dummyDiscounts);
  //
  //   httpMock.verify();
  // }));

  // it('should check if we have discounts', async(() => {
  // }));

  // it('should open modal on discount change', async(() => {
  //   let modalCtrl = fixture.debugElement.injector.get(ModalController);
  //   spyOn(modalCtrl, 'create');
  //   instance.onDiscountChange('weekdays', 0);
  //   expect(modalCtrl.create).toHaveBeenCalledWith('ServicesListComponent', { data: '' });
  // }));

  // it('should save discounts', async(() => {
  // }));
});
