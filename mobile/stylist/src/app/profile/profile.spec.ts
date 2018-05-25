import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, NavController, NavParams, ViewController } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';

import { NavMock } from '../services/services.component.spec';
import { ViewControllerMock } from '../shared/view-controller-mock';
import { SharedModule } from '../shared/shared.module';
import { prepareSharedObjectsForTests } from '../shared/test-utils.spec';
import { TestUtils } from '../../test';

import { StylistServiceProvider } from '../shared/stylist-service/stylist-service';
import { ProfileComponent } from './profile';

let fixture: ComponentFixture<ProfileComponent>;
let component: ProfileComponent;

describe('Pages: Stylist Profile / Settings', () => {

  prepareSharedObjectsForTests();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [
        IonicModule.forRoot(ProfileComponent),
        SharedModule,
        HttpClientModule,
        // ReactiveFormsModule,
        // FormsModule
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
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create the page', async(() => {
    expect(component)
      .toBeTruthy();
  }));
});
