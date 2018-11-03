import { async, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TestUtils } from '~/../test';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';

import { DataModule } from '~/core/data.module';
import { allClientsMock } from '~/core/api/clients-api.mock';

import { AllClientsComponent } from './all-clients.component';

let fixture: ComponentFixture<AllClientsComponent>;
let instance: AllClientsComponent;

describe('Pages: All Clients', () => {

  prepareSharedObjectsForTests();

  beforeEach(async(() => TestUtils.beforeEachCompiler([
    AllClientsComponent
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

  it('should show All Clients header', () => {
    expect(fixture.nativeElement.textContent)
      .toContain('All MADE Clients');
  });

  it('should show clients names and surnames', async done => {
    await instance.ionViewWillLoad();
    await instance.onRefresh();

    fixture.detectChanges();

    allClientsMock.forEach(client => {
      expect(fixture.nativeElement.textContent)
        .toContain(`${client.first_name} ${client.last_name}`);
    });

    done();
  });
});
