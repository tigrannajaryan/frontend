import { async, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController, NavController, NavParams, ViewController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { ServicesListComponent } from './services-list.component';
import { CoreModule } from '~/core/core.module';
import { StylistServiceProvider } from '~/core/api/stylist-service/stylist.api';
import { ServiceItemComponentData } from '../services-item/services-item.component';
import { ServiceCategory, ServiceTemplateItem } from '~/core/api/stylist-service/stylist.models';
import { PageNames } from '~/core/page-names';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';

describe('Pages: ServicesListComponent', () => {
  let fixture;
  let component;

  prepareSharedObjectsForTests();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServicesListComponent],
      imports: [
        IonicModule.forRoot(ServicesListComponent),
        CoreModule
      ],
      providers: [
        StylistServiceProvider,
        NavController,
        NavParams,
        ModalController,
        { provide: HttpClient, useClass: class { httpClient = jasmine.createSpy('HttpClient'); } }
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicesListComponent);
    component = fixture.componentInstance;
  });

  it('should convert minutes to hours with minutes', () => {
    const mins = 120;

    expect(component.convertMinsToHrsMins(mins))
      .toEqual('2h 00m');
  });

  // TODO: uncomment after base-service fix
  // it('should be created', () => {
  //   expect(component instanceof ServicesListComponent).toBe(true);
  // });

  // it('should set up uuid from the passed it from ServicesComponent', () => {
  //   const navParams = fixture.debugElement.injector.get(NavParams);
  //   navParams.get = jasmine.createSpy('get').and.returnValue({
  //     uuid: 'string'
  //   });
  //
  //   component.init();
  //
  //   expect(component.uuid).toBeDefined();
  // });

  // it('should get list using uuid', () => {
  //   const stylistServiceProvider = TestBed.get(StylistServiceProvider);
  //   const uuid = 'string';
  //
  //   expect(stylistServiceProvider.getServiceTemplateSetByUuid(uuid)).toBeDefined();
  // });

  // it('should openServiceModal', () => {
  //   const service: ServiceTemplateItem = {
  //     categoryUuid: '',
  //     id: 0,
  //     name: '',
  //     description: '',
  //     base_price: 0,
  //     duration_minutes: 0
  //   };
  //   const category: ServiceCategory = {
  //     uuid: '',
  //     name: '',
  //     services: [{
  //       categoryUuid: '',
  //       id: 0,
  //       name: '',
  //       description: '',
  //       base_price:  0,
  //       duration_minutes:  0
  //     }]
  //   };
  //
  //   const itemToEdit: ServiceItemComponentData = {
  //     categories: [category],
  //     service,
  //     categoryUuid: ''
  //   };
  //
  //   const profileModal = this.modalCtrl.create(PageNames.RegisterServicesItemAdd,
  //     {
  //       data: itemToEdit
  //     });
  //   profileModal.onDidDismiss(editedItem => {
  //     this.updateServiceItem(itemToEdit, editedItem);
  //   });
  //   profileModal.present();
  //
  //   const modalCtrl = fixture.debugElement.injector.get(ModalController);
  //   spyOn(modalCtrl, 'create');
  //
  //   component.openServiceModal(category, service);
  //
  //   expect(modalCtrl.create).toHaveBeenCalledWith(itemToEdit);
  // });

  // it('should save changes to server', () => {
  // });

  // it('should reset the list', () => {
  // });

  // it('should update service item', () => {
  // });
});
