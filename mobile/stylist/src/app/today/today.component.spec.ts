import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TestUtils } from '../../test';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';
import { TodayComponent } from '~/today/today.component';
import { ActionSheetController } from 'ionic-angular';
import { TodayService } from '~/today/today.service';
import { TodayState } from '~/today/today.reducer';
import { Store } from '@ngrx/store';
import { UserFooterComponent } from '~/today/user-footer/user-footer.component';
import { UserHeaderComponent } from '~/today/user-header/user-header.component';

let fixture: ComponentFixture<TodayComponent>;
let instance: TodayComponent;

let injector: TestBed;
let store: Store<TodayState>;

describe('Pages: TodayComponent', () => {

  prepareSharedObjectsForTests();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        UserHeaderComponent,
        UserFooterComponent
      ],
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        ActionSheetController,
        TodayService,
        { provide: HttpClient, useClass: class { httpClient = jasmine.createSpy('HttpClient'); } }
      ]
    });
  }));

  beforeEach(async(() => TestUtils.beforeEachCompiler([TodayComponent])
    .then(compiled => {
      fixture = compiled.fixture;
      instance = compiled.instance;

      injector = getTestBed();
      store = injector.get(Store);
    })));

  it('should create the page', async(() => {
    expect(instance)
      .toBeTruthy();
  }));

  // TODO: fix errors and finish test
  // it('should get today data on ionViewDidEnter', async(() => {
  //   instance.ionViewDidEnter();
  //
  //   store.select(selectTodayState)
  //     .subscribe(todayState => {
  //       expect(todayState.today).toBeDefined();
  //     });
  // }));

  // it('should open modal on openModal', async(() => {
  //   const appointmentUuid = 'some string';
  //   const modalParams = {
  //     title: 'NOT PAID',
  //     buttons: [
  //       {
  //         text: 'Checkout',
  //         handler: () => {
  //           instance.checkOutAppointment(appointmentUuid);
  //         }
  //       },
  //       {
  //         text: 'Cancel',
  //         role: 'destructive',
  //         handler: () => {
  //           instance.cancelAppointment(appointmentUuid);
  //         }
  //       }
  //     ]
  //   };
  //
  //   const actionSheet = TestBed.get(ActionSheetController);
  //   actionSheet.present();
  //
  //
  //   expect(actionSheet.create.present()).toHaveBeenCalled();
  // }));

  // it('should check out appointment', async(() => {
  //   const appointmentUuid = 'some string';
  //   instance.checkOutAppointment(appointmentUuid);
  //
  //   const todayService = TestBed.get(TodayService);
  //
  //   expect(todayService.setAppointment).toHaveBeenCalledWith(appointmentUuid, { status: AppointmentStatuses.checked_out });
  // }));
  //
  // it('should cancel appointment', async(() => {
  //   const appointmentUuid = 'some string';
  //   instance.checkOutAppointment(appointmentUuid);
  //
  //   const todayService = TestBed.get(TodayService);
  //
  //   expect(todayService.setAppointment).toHaveBeenCalledWith(appointmentUuid, { status: AppointmentStatuses.cancelled_by_stylist });
  // }));
});
