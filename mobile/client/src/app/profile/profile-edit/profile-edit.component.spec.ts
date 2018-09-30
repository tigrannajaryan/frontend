import { async, ComponentFixture } from '@angular/core/testing';

import { TestUtils } from '~/../test';

import { profileNotCompleate } from '~/core/api/profile-api.mock';
import { ProfileEditComponent } from '~/profile/profile-edit/profile-edit.component';
import { NavController, NavParams } from 'ionic-angular';

let fixture: ComponentFixture<ProfileEditComponent>;
let instance: ProfileEditComponent;

describe('Pages: Profile edit', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([ProfileEditComponent])
        .then(compiled => {
          // Common setup:
          fixture = compiled.fixture;
          instance = compiled.instance;

          const navParams = fixture.debugElement.injector.get(NavParams);
          navParams.data.profile = profileNotCompleate;
          instance.ionViewWillLoad();
        })
    )
  );

  it('should create the page', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should have filled all required fields', () => {
    fixture.detectChanges();

    const first_name = fixture.nativeElement.querySelector('[data-test-id=first_name] input');
    expect(first_name.value).toBe('First');

    const last_name = fixture.nativeElement.querySelector('[data-test-id=last_name] input');
    expect(last_name.value).toBe('Last');

    const zip_code = fixture.nativeElement.querySelector('[data-test-id=zip_code] input');
    expect(zip_code.value).toBe(instance.form.get('zip_code').value.toString());
  });

  it('should have error in zip code', () => {
    instance.form.get('zip_code').patchValue('0');

    fixture.detectChanges();

    const first_name = fixture.nativeElement.querySelector('[data-test-id=zip_code] input');
    expect(first_name.value).toBe('0');
    expect(instance.form.get('zip_code').status).toBe('INVALID');

    const zip_code_minlength_error = fixture.nativeElement.querySelector('[data-test-id=zip_code_minlength_error]');
    expect(zip_code_minlength_error).toBeDefined();
  });

  it('should be able to submit the form', done => {
    // change some value - to see submit button
    instance.form.get('first_name').patchValue('newName');
    instance.form.get('profile_photo_id').patchValue(undefined);
    fixture.detectChanges();

    const navCtrl = fixture.debugElement.injector.get(NavController);
    const submit = fixture.nativeElement.querySelector('[data-test-id=submit]');
    spyOn(instance.profileDataStore, 'set');
    spyOn(instance.form, 'patchValue');

    submit.click();

    setTimeout(async () => {
      expect(instance.profileDataStore.set).toHaveBeenCalledWith(instance.form.value);
      expect(instance.form.patchValue).toHaveBeenCalledWith(instance.form.value);
      expect(navCtrl.pop).toHaveBeenCalled();

      done();
    });
  });
});
