import { async, TestBed } from '@angular/core/testing';
import { ServicesComponent } from './services.component';
import { IonicModule, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CoreModule } from '~/core/core.module';
import { StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';

export class NavMock {
  push(): any {
    return new Promise((resolve: Function) => {
      resolve();
    });
  }
}

describe('Pages: ServicesComponent', () => {
  let fixture;
  let component;

  prepareSharedObjectsForTests();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServicesComponent],
      imports: [
        IonicModule.forRoot(ServicesComponent),
        CoreModule
      ],
      providers: [
        StylistServiceProvider,
        NavParams,
        { provide: NavController, useClass: NavMock },
        { provide: HttpClient, useClass: class { httpClient = jasmine.createSpy('HttpClient'); } }
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicesComponent);
    component = fixture.componentInstance;
  });

  // TODO: uncomment after base-service fix
  // it('should be created', () => {
  //   expect(component instanceof ServicesComponent).toBe(true);
  // });

  // it('should not have serviceTemplateSets after construction', () => {
  //   expect(component.serviceTemplateSets).toBeUndefined();
  // });
  //
  // it('should have serviceTemplateSets after init', () => {
  //   // create `getServiceTemplateSetsList` spy on an object representing the StylistServiceProvider
  //   const stylistServiceProvider = jasmine.createSpyObj('StylistServiceProvider', ['getServiceTemplateSetsList']);
  //
  //   // set the value to return when the `getServiceTemplateSetsList` spy is called.
  //   const serviceTemplatesResponse: ServiceTemplateSetListResponse = {
  //     service_template_sets: [
  //       {
  //         uuid: 'string',
  //         name: '',
  //         description: '',
  //         image_url: '',
  //         services: []
  //       }
  //     ]
  //   };
  //   stylistServiceProvider.getServiceTemplateSetsList.and.returnValue(serviceTemplatesResponse);
  //
  //
  //   expect(stylistServiceProvider.getServiceTemplateSetsList())
  //     .toBe(serviceTemplatesResponse, 'ServiceTemplateSetListResponse');
  //
  //   // component.init();
  //   // expect(component.serviceTemplateSets).toBeDefined();
  // });
  //
  // it('the openService() function should push the RegisterServicesItem page onto the navigation stack with params uuid', () => {
  //   let navCtrl = fixture.debugElement.injector.get(NavController);
  //   spyOn(navCtrl, 'push');
  //   const serviceItem: ServicesTemplate = {
  //     uuid: 'string',
  //     name: '',
  //     description: '',
  //     image_url: '',
  //     services: []
  //   };
  //   component.openService(serviceItem);
  //   expect(navCtrl.push).toHaveBeenCalledWith('ServicesListComponent', { uuid: serviceItem.uuid });
  // });
});
