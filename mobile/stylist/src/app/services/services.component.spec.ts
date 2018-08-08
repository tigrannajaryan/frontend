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
});
