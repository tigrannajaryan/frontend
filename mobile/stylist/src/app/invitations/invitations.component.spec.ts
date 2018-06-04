import {
  async,
  ComponentFixture,
  getTestBed,
  TestBed
  } from '@angular/core/testing';
import { Contacts } from '@ionic-native/contacts';
import { HttpClient } from '@angular/common/http';
import { InvitationsApi } from './invitations.api';
import { InvitationsComponent } from './invitations.component';
import {
  IonicModule,
  ModalController,
  NavController,
  NavParams,
  ViewController
  } from 'ionic-angular';
import { CoreModule } from '~/core/core.module';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';

describe('Pages: InvitationsComponent', () => {
  let fixture;
  let component;

  prepareSharedObjectsForTests();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InvitationsComponent],
      imports: [
        IonicModule.forRoot(InvitationsComponent),
        CoreModule
      ],
      providers: [
        NavController,
        NavParams,
        ModalController,
        InvitationsApi,
        Contacts,
        { provide: HttpClient, useClass: class { httpClient = jasmine.createSpy('HttpClient'); } }
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvitationsComponent);
    component = fixture.componentInstance;
  });

  it('should create the page', async(() => {
    expect(component).toBeTruthy();
  }));

});
