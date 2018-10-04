import 'rxjs/add/observable/from';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { of } from 'rxjs/observable/of';

import { async, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TestUtils } from '~/../test';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';

import { DataModule } from '~/core/data.module';
import { ClientsApi } from '~/shared/stylist-api/clients-api';
import { clientsMock } from '~/shared/stylist-api/clients-api.mock';

import { MyClientsComponent } from './my-clients.component';

let fixture: ComponentFixture<MyClientsComponent>;
let instance: MyClientsComponent;

describe('Pages: My Clients', () => {

  prepareSharedObjectsForTests();

  beforeEach(async(() => TestUtils.beforeEachCompiler([
    MyClientsComponent
  ], [
    // no providers
  ], [
    HttpClientTestingModule,
    DataModule.forRoot()
  ]).then(compiled => {
    fixture = compiled.fixture;
    instance = compiled.instance;
  })));

  it('should create the page', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should show My Clients header', () => {
    expect(fixture.nativeElement.textContent)
      .toContain('My Clients');
  });

  it('should show clients', async done => {
    await instance.ionViewWillLoad();
    await instance.onRefresh();

    fixture.detectChanges();

    clientsMock.forEach(client => {
      expect(fixture.nativeElement.textContent)
        .toContain(`${client.first_name} ${client.last_name}`);
      expect(fixture.nativeElement.textContent)
        .toContain(
          `${client.phone.slice(0, 2)} ${client.phone.slice(2, 5)} ${client.phone.slice(5, 8)} ${client.phone.slice(8, 11)}`
        );
      expect(fixture.nativeElement.textContent)
        .toContain(client.city);
      expect(fixture.nativeElement.textContent)
        .toContain(client.state);
    });

    done();
  });

  it('should show invite btn when empty clients', async done => {
    const api = fixture.debugElement.injector.get(ClientsApi);

    spyOn(api, 'getMyClients').and.returnValue(
      of({ response: [] })
    );

    await instance.ionViewWillLoad();
    await instance.onRefresh();

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent)
      .toContain('There are no clients to show. 😢');

    const inviteClientsBtn = fixture.nativeElement.querySelector('[data-test-id=inviteClientsBtn]');

    expect(inviteClientsBtn)
      .toBeTruthy();

    expect(inviteClientsBtn.textContent)
      .toContain('Invite Clients');

    done();
  });
});
