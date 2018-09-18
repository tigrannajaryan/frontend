import { async, ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TestUtils } from '../../../test';
import { ActionSheetController, Haptic, PopoverController, ViewController } from 'ionic-angular';
import { HomeService } from '~/shared/stylist-api/home.service';
import { AppointmentCheckoutComponent } from './appointment-checkout.component';
import { prepareSharedObjectsForTests } from 'app/core/test-utils.spec';
import { CoreModule } from 'app/core/core.module';
import { ViewControllerMock } from '~/shared/view-controller-mock';
import { PopoverControllerMock } from 'ionic-mocks';

let fixture: ComponentFixture<AppointmentCheckoutComponent>;
let instance: AppointmentCheckoutComponent;

let injector: TestBed;

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
    })));

  it('should create the page', async(() => {
    expect(instance)
      .toBeTruthy();
  }));
});
