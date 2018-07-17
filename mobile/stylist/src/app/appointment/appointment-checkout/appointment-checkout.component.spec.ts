import { async, ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TestUtils } from '../../../test';
import { ActionSheetController, Haptic, PopoverController, ViewController } from 'ionic-angular';
import { HomeService } from 'app/home/home.service';
import { HomeState } from 'app/home/home.reducer';
import { Store } from '@ngrx/store';
import { AppointmentCheckoutComponent } from './appointment-checkout.component';
import { prepareSharedObjectsForTests } from 'app/core/test-utils.spec';
import { CoreModule } from 'app/core/core.module';
import { ViewControllerMock } from '~/shared/view-controller-mock';
import { PopoverControllerMock } from 'ionic-mocks';

let fixture: ComponentFixture<AppointmentCheckoutComponent>;
let instance: AppointmentCheckoutComponent;

let injector: TestBed;
let store: Store<HomeState>;

describe('Pages: AppointmentCheckoutComponent', () => {

  prepareSharedObjectsForTests();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
      ],
      imports: [
        HttpClientTestingModule,
        CoreModule
      ],
      providers: [
        ActionSheetController,
        HomeService,
        Haptic,
        { provide: ViewController, useClass: ViewControllerMock },
        { provide: PopoverController, useClass: PopoverControllerMock },
        { provide: HttpClient, useClass: class { httpClient = jasmine.createSpy('HttpClient'); } }
      ]
    });
  }));

  beforeEach(async(() => TestUtils.beforeEachCompiler([AppointmentCheckoutComponent])
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
  // it('should get appointmentUuid from AppointmentCheckout through nav params');
  //
  // it('should get services from AppointmentCheckout through nav params');
  //
  // it('should call getAppointmentById');
  //
  // it('should update preview');
  //
  // it('should open ConfirmCheckoutComponent modal');
  //
  // it('should calculate total price');
  //
  // it('should remove service item');
  //
  // it('should open AddServicesComponent modal');
  //
  // it('should open edit service actionSheet');
  //
  // it('should open edit service price prompt');
});
