import { async, ComponentFixture } from '@angular/core/testing';

import { ClientDetailsComponent } from './client-details.component';
import { TestUtils } from '../../test';
import { NavParams } from 'ionic-angular';
import { clientDetailsMock } from '~/shared/stylist-api/client-details.api.mock';

let fixture: ComponentFixture<ClientDetailsComponent>;
let instance: ClientDetailsComponent;

describe('Pages: ClientDetailsComponent', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([ClientDetailsComponent])
        .then(compiled => {
          // Common setup:
          fixture = compiled.fixture;
          instance = compiled.instance;

          const navParams = fixture.debugElement.injector.get(NavParams);
          navParams.data.client = clientDetailsMock;

          instance.ionViewWillLoad();
          fixture.detectChanges();
        })
    )
  );

  it('should create the page', async(() => {
    expect(instance)
      .toBeTruthy();
  }));

  it('should have client data', async () => {
    fixture.detectChanges();

    const clientDetails = instance.clientDetails;

    expect(clientDetails).toBeDefined();

    const clientAva = fixture.nativeElement.querySelector('[data-test-id=clientAva]');
    const clientName = fixture.nativeElement.querySelector('[data-test-id=clientName]');
    const clientPhone = fixture.nativeElement.querySelector('[data-test-id=clientPhone]');
    const clientEmail = fixture.nativeElement.querySelector('[data-test-id=clientEmail]');
    const clientAddress = fixture.nativeElement.querySelector('[data-test-id=clientAddress]');

    expect(clientAva).toBeDefined();
    expect(clientName.textContent).toContain(`${clientDetails.first_name} ${clientDetails.last_name}`);
    expect(clientPhone.textContent).toContain(clientDetails.phone);
    expect(clientEmail.textContent).toContain(clientDetails.email);
    expect(clientAddress.textContent).toContain(clientDetails.city);
  });

  it('should have last visit', () => {
    const lastVisit = fixture.nativeElement.querySelector('[data-test-id=lastVisit]');
    expect(lastVisit).toBeDefined();
  });

  it('should have last service', () => {
    const lastService = fixture.nativeElement.querySelector('[data-test-id=lastService]');
    expect(lastService).toBeDefined();
  });

  // Note: hide “View Client's Calendar” link for now since we don’t yet have this page.
  // it('should have calendar link', () => {
  //   const calendarLink = fixture.nativeElement.querySelector('[data-test-id=calendarLink]');
  //   expect(calendarLink).toBeDefined();
  // });
});
