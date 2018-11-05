import {
  async,
  TestBed
} from '@angular/core/testing';

import {
  IonicModule,
  ModalController,
  NavController,
  NavParams
} from 'ionic-angular';

import { Contacts } from '@ionic-native/contacts';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';
import { SMS } from '@ionic-native/sms';
import { HttpClient } from '@angular/common/http';

import { StylistServiceProvider } from '~/core/api/stylist.service';
import { DiscountsApi } from '~/core/api/discounts.api';
import { InvitationsApi } from '~/core/api/invitations.api';
import { InvitationStatus } from '~/shared/api/invitations.models';
import { ProfileDataStore } from '~/core/profile.data';

import { CoreModule } from '~/core/core.module';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';
import { DisplayContact, InvitationsComponent } from './invitations.component';

describe('Pages: InvitationsComponent', () => {
  let fixture;
  let component: InvitationsComponent;

  const c1 = {
    displayName: 'John',
    phoneNumber: '+1234567890',
    selected: false,
    status: InvitationStatus.New
  };
  const c2 = {
    displayName: 'Jared',
    phoneNumber: '+2345678901',
    selected: false,
    status: InvitationStatus.New
  };
  const c3 = {
    displayName: 'Michael Jackson',
    phoneNumber: '+34567890',
    selected: false,
    status: InvitationStatus.New
  };

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
        DiscountsApi,
        StylistServiceProvider,
        ProfileDataStore,
        Contacts,
        OpenNativeSettings,
        SMS,
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

  it('should group contacts to sections', async(() => {
    let r = InvitationsComponent.groupContactsToSections([]);
    expect(r).toEqual([]);

    r = InvitationsComponent.groupContactsToSections([c1, c2, c3]);

    expect(r).toEqual([
      {
        sectionName: 'J',
        items: [{
          item: c2,
          matches: []
        },
        {
          item: c1,
          matches: []
        }]
      },

      {
        sectionName: 'M',
        items: [{
          item: c3,
          matches: []
        }]
      }
    ]);
  }));

  it('should format fields', async(() => {

    const dc1 = {
      item: c1,
      matches: []
    };

    const f1 = InvitationsComponent.formatField(dc1, 'displayName');
    expect(f1).toEqual('John');

    const dc2: DisplayContact = {
      item: c1,
      matches: [{
        indices: [[0, 0], [2, 3]],
        key: 'displayName'
      },
      {
        indices: [[5, 6]],
        key: 'phoneNumber'
      }
      ]
    };

    const f2 = InvitationsComponent.formatField(dc2, 'displayName');
    expect(f2).toEqual('<b>J</b>o<b>hn</b>');

    const f3 = InvitationsComponent.formatField(dc2, 'phoneNumber');
    expect(f3).toEqual('+1234<b>56</b>7890');

  }));
});
