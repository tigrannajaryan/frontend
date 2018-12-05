import { async, ComponentFixture } from '@angular/core/testing';

import { TestUtils } from '~/../test';

import { FirstLastNameComponent } from '~/profile/first-last-name/first-last-name.component';

let fixture: ComponentFixture<FirstLastNameComponent>;
let instance: FirstLastNameComponent;

describe('Pages: First Last Name', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([FirstLastNameComponent])
        .then(compiled => {
          // Common setup:
          fixture = compiled.fixture;
          instance = compiled.instance;
        })
    )
  );

  it('should create the page', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should have filled all required fields', () => {
    instance.form.get('first_name').patchValue('First');
    instance.form.get('last_name').patchValue('Last');

    fixture.detectChanges();

    const first_name = fixture.nativeElement.querySelector('[data-test-id=first_name] input');
    expect(first_name.value).toBe('First');

    const last_name = fixture.nativeElement.querySelector('[data-test-id=last_name] input');
    expect(last_name.value).toBe('Last');
  });

  it('should have error in required field', () => {
    instance.form.get('first_name').patchValue('');

    fixture.detectChanges();

    const first_name = fixture.nativeElement.querySelector('[data-test-id=first_name] input');
    expect(first_name.value).toBe('');
    expect(instance.form.get('first_name').status).toBe('INVALID');

    const first_name_required_error = fixture.nativeElement.querySelector('[data-test-id=first_name_required_error]');
    expect(first_name_required_error).toBeDefined();
  });

  it('should be able to press on onContinue button', () => {
    const onContinue = fixture.nativeElement.querySelector('[data-test-id=onContinue]');
    spyOn(instance.profileDataStore, 'set');

    onContinue.click();

    expect(instance.profileDataStore.set).toHaveBeenCalledWith(instance.form.value);
  });
});
