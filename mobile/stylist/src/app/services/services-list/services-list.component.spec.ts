import { async, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';

import { ServicesListComponent } from './services-list.component';
import { CoreModule } from '~/core/core.module';
import { StylistServiceProvider } from '~/shared/stylist-api/stylist-service';
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
});
