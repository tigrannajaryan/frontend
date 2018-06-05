import {
  async,
  ComponentFixture,
  getTestBed,
  TestBed
} from '@angular/core/testing';

import {
  IonicModule,
  ModalController,
  NavController,
  NavParams,
  ViewController
} from 'ionic-angular';

import { Contacts } from '@ionic-native/contacts';
import { HttpClient } from '@angular/common/http';

import { CoreModule } from '~/core/core.module';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';
import { InvitationsComponent } from './invitations.component';
import { InvitationsApi } from './invitations.api';

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

  it('should create an empty invitation list', async(() => {
    expect(component.invitations).toBeDefined();
    expect(component.invitations.length).toEqual(0);
  }));

  it('should not add empty phone numbers', async(() => {
    component.addContact();
    expect(component.invitations.length).toEqual(0);
  }));

  it('should add non-empty phone numbers', async(() => {
    component.phoneNumber = '+1 123 456 7890';
    component.addContact();
    expect(component.invitations.length).toEqual(1);
  }));

});
