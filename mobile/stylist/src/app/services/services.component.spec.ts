import { async, TestBed } from '@angular/core/testing';
import { ServicesComponent } from './services.component';
import { IonicModule, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CoreModule } from '~/core/core.module';
import { ServiceTemplatesResponse, StylistServiceProvider } from '~/core/stylist-service/stylist-service';
import { ServicesTemplate } from '~/core/stylist-service/stylist-models';
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

  // it('should not have serviceTemplates after construction', () => {
  //   expect(component.serviceTemplates).toBeUndefined();
  // });
  //
  // it('should have serviceTemplates after init', () => {
  //   // create `getServiceTemplateSets` spy on an object representing the StylistServiceProvider
  //   const stylistServiceProvider = jasmine.createSpyObj('StylistServiceProvider', ['getServiceTemplateSets']);
  //
  //   // set the value to return when the `getServiceTemplateSets` spy is called.
  //   const serviceTemplatesResponse: ServiceTemplatesResponse = {
  //     service_templates: [
  //       {
  //         uuid: 'string',
  //         name: '',
  //         description: '',
  //         image_url: '',
  //         services: []
  //       }
  //     ]
  //   };
  //   stylistServiceProvider.getServiceTemplateSets.and.returnValue(serviceTemplatesResponse);
  //
  //
  //   expect(stylistServiceProvider.getServiceTemplateSets())
  //     .toBe(serviceTemplatesResponse, 'ServiceTemplatesResponse');
  //
  //   // component.init();
  //   // expect(component.serviceTemplates).toBeDefined();
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
