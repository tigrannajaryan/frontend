import { async, TestBed } from '@angular/core/testing';
import { IonicModule, NavController, NavParams, ViewController } from 'ionic-angular';
import { CoreModule } from '~/core/core.module';
import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { ServiceItemComponent, ServiceItemComponentData } from './services-item.component';
import { NavMock } from '../services.component.spec';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';
import { ViewControllerMock } from '~/shared/view-controller-mock';

describe('Pages: ServiceItemComponent', () => {
  let fixture;
  let component;

  prepareSharedObjectsForTests();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServiceItemComponent],
      imports: [
        IonicModule.forRoot(ServiceItemComponent),
        CoreModule,
        ReactiveFormsModule,
        FormsModule
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
    fixture = TestBed.createComponent(ServiceItemComponent);
    component = fixture.componentInstance;
  });

  it('component should be created', () => {
    expect(component instanceof ServiceItemComponent).toBe(true);
  });

  it('form should be created', () => {
    component.createForm();
    expect(component.form).toBeDefined();
  });

  it('should set form control', () => {
    component.createForm();
    component.setFormControl('id', 0);
    expect(component.form.get('id').value).toEqual(0);
  });

  it('should set up data from the passed it from ServicesListComponent', () => {
    const navParams = fixture.debugElement.injector.get(NavParams);
    navParams.get = jasmine.createSpy('get').and.returnValue({
      categories: '',
      categoryUuid: '',
      service: ''
    });

    component.init();

    expect(component.data).toBeDefined();
  });

  it('should set form data', () => {
    const data: ServiceItemComponentData = {
      categoryUuid: 'string'
    };

    component.setFormData(data);
    expect(component.form.get('categoryUuid').value).toEqual('string');
  });

  it('should dismiss modal on service delete', () => {
    const loadingCtrl = fixture.debugElement.injector.get(ViewController);
    spyOn(loadingCtrl, 'dismiss');

    component.onServiceDelete();

    expect(loadingCtrl.dismiss).toHaveBeenCalled();
  });

  it('should send data and dismiss modal', () => {
    const viewController = fixture.debugElement.injector.get(ViewController);
    viewController.dismiss = jasmine.createSpy('dismiss').and.returnValue({
      service: [],
      categoryUuid: ''
    });

    component.submit();

    expect(viewController.dismiss).toHaveBeenCalled();
  });
});
