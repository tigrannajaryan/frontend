import { async, ComponentFixture } from '@angular/core/testing';
import { prepareSharedObjectsForTests } from 'app/core/test-utils.spec';
import { ConfirmCheckoutComponent } from '~/core/popups/confirm-checkout/confirm-checkout.component';
import { CheckOut } from '~/today/today.models';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestUtils } from '../../../../test';
import { ProfileComponent } from '~/profile/profile';
import { ProfileInfoComponent } from '~/profile/profile-info/profile-info';
import { AlertController, LoadingController, NavParams } from 'ionic-angular';
import { TodayService } from '~/today/today.service';

let fixture: ComponentFixture<ConfirmCheckoutComponent>;
let instance: ConfirmCheckoutComponent;
describe('Pages: ConfirmCheckoutComponent', () => {

  prepareSharedObjectsForTests();

  // TestBed.createComponent(ProfileComponent) inside
  // see https://angular.io/guide/testing#component-class-testing for more info
  beforeEach(async(() => TestUtils.beforeEachCompiler([
    ProfileComponent,
    ProfileInfoComponent
  ], [DatePipe, TodayService], [HttpClientTestingModule]).then(compiled => {
    fixture = compiled.fixture; // https://angular.io/api/core/testing/ComponentFixture
    instance = compiled.instance;
  })));

  it('component should be created', () => {
    expect(instance)
      .toBeTruthy();
  });

  // TODO: fix errors and finish test
  // it('should get CheckOut data from AppointmentCheckout through nav params', () => {
  //   const navParams = fixture.debugElement.injector.get(NavParams);
  //   const checkOut: CheckOut = {
  //     appointmentUuid: '',
  //     status: 'checked_out',
  //     services: []
  //   };
  //   navParams.get = jasmine.createSpy('get').and.returnValue(checkOut);
  //
  //   instance.ionViewDidEnter();
  //
  //   expect(instance.checkOut.status).toEqual('checked_out');
  // });
  //
  // it('should create loader when data is loading', async(async () => {
  //   const loadingControl = fixture.debugElement.injector.get(LoadingController);
  //
  //   await instance.onFinalizeCheckout();
  //
  //   expect(loadingControl.create)
  //     .toHaveBeenCalledTimes(1);
  // }));
  //
  // it('should create alert when data failed to load', async(async () => {
  //   const data = [
  //     '6f843595-297e-4d84-ac44-4316668788d7',
  //     {
  //       status: 'checked_out',
  //       services: [
  //         {
  //           service_uuid: '6f843595-297e-4d84-ac44-4316668788d7'
  //         }
  //       ]
  //     }
  //   ];
  //   const todayService = fixture.debugElement.injector.get(TodayService);
  //   spyOn(todayService, 'setAppointment');
  //   // enables submit
  //   fixture.detectChanges();
  //   fixture.nativeElement.querySelector('[type="submit"]').click();
  //   expect(todayService.setAppointment)
  //     .toHaveBeenCalledWith(...data);
  // }));
  //
  // it('should create alert when data failed to load', async(async () => {
  //   const alertControl = fixture.debugElement.injector.get(AlertController);
  //
  //   const todayService = fixture.debugElement.injector.get(TodayService);
  //   spyOn(todayService, 'setAppointment').and.returnValue(() => {
  //     throw new Error();
  //   });
  //
  //   await instance.onFinalizeCheckout();
  //
  //   expect(alertControl.create)
  //     .toHaveBeenCalledTimes(1);
  // }));
});
