import { async, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule, NavController, NavParams, ViewController } from 'ionic-angular';
import { CoreModule } from 'app/core/core.module';
import { StylistServiceProvider } from 'app/core/stylist-service/stylist-service';
import { NavMock } from '../../../services/services.component.spec';
import { prepareSharedObjectsForTests } from 'app/core/test-utils.spec';
import { ViewControllerMock } from 'app/shared/view-controller-mock';
import { AddServicesComponent } from 'app/core/popups/add-services/add-services.component';

describe('Pages: AddServicesComponent', () => {
  let fixture;
  let component;

  prepareSharedObjectsForTests();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddServicesComponent],
      imports: [
        IonicModule.forRoot(AddServicesComponent),
        CoreModule,
        HttpClientModule
      ],
      providers: [
        StylistServiceProvider,
        NavParams,
        { provide: NavController, useClass: NavMock },
        { provide: ViewController, useClass: ViewControllerMock }
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddServicesComponent);
    component = fixture.componentInstance;
  });

  // it('component should be created', () => {
  //   expect(component instanceof AddServicesComponent).toBe(true);
  // });
});
