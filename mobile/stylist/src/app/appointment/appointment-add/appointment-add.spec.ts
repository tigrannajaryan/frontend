import { ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';
import { TestUtils } from '~/../test';

import { TodayService } from '~/today/today.service';

import { AppointmentAddComponent } from './appointment-add';

let fixture: ComponentFixture<AppointmentAddComponent>;
let instance: AppointmentAddComponent;

describe('Pages: Add Appointment', () => {

  prepareSharedObjectsForTests();

  beforeEach(async () => TestUtils.beforeEachCompiler([
    AppointmentAddComponent
  ], [TodayService], [HttpClientTestingModule]).then(compiled => {
    fixture = compiled.fixture;
    instance = compiled.instance;
  }));

  it('should create the page', async () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should have input to search for customers');

  it('should start searching when at least 2 characters typed');

  it('should show searching results in a list');

  it('should choose customer by tapping on it in the list');
});
