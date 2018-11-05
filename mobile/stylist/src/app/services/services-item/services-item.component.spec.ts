import { async, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule, NavController, NavParams, ViewController } from 'ionic-angular';

import { CoreModule } from '~/core/core.module';
import { StylistServiceProvider } from '~/core/api/stylist.service';
import { ServiceItemComponent, ServiceItemComponentData } from './services-item.component';
import { NavMock } from '../services.component.spec';
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
    component.setFormControl('uuid', 'uuid');
    expect(component.form.get('uuid').value).toEqual('uuid');
  });

  it('should set up data from the passed it from ServicesListComponent', () => {
    const navParams = fixture.debugElement.injector.get(NavParams);
    navParams.get = jasmine.createSpy('get').and.returnValue({
      categories: '',
      categoryUuid: '',
      service: ''
    });

    component.ionViewWillLoad();

    expect(component.data).toBeDefined();
  });

  it('should set form data', () => {
    const data: ServiceItemComponentData = {
      category: {
        uuid: 'string',
        name: 'string',
        services: [],
        category_code: 'string'
      }
    };

    component.createForm();

    component.setFormData(data);
    expect(component.form.get('category').value).toEqual(data.category);
  });

  it('should dismiss loading on service delete', () => {
    const loadingCtrl = fixture.debugElement.injector.get(ViewController);
    spyOn(loadingCtrl, 'dismiss');

    const navParams = fixture.debugElement.injector.get(NavParams);
    navParams.get = jasmine.createSpy('get').and.returnValue({id: 1});

    component.ionViewWillLoad();

    component.onServiceDelete();

    expect(loadingCtrl.dismiss).toHaveBeenCalled();
  });

  it('should send data and dismiss modal', () => {
    const viewController = fixture.debugElement.injector.get(ViewController);
    viewController.dismiss = jasmine.createSpy('dismiss').and.returnValue({
      service: [],
      categoryUuid: ''
    });

    component.createForm();

    component.save();

    expect(viewController.dismiss).toHaveBeenCalled();
  });
});
