import { ComponentFixture } from '@angular/core/testing';

import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';
import { TestUtils } from '~/../test';

import { AppointmentServicesComponent } from './appointment-services';

let fixture: ComponentFixture<AppointmentServicesComponent>;
let instance: AppointmentServicesComponent;

describe('Pages: Choose date and time of the Appointment', () => {

  prepareSharedObjectsForTests();

  beforeEach(async () => TestUtils.beforeEachCompiler([
    AppointmentServicesComponent
  ]).then(compiled => {
    fixture = compiled.fixture;
    instance = compiled.instance;
  }));

  it('should create the page', async () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should show stylist services');

  it('should allow to select some of the services');
});
