import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NavParams } from 'ionic-angular';

import { TestUtils } from '~/../test';
import { PushPrimingScreenComponent } from '~/shared/components/push-priming-screen/push-priming-screen.component';
import { PrimingScreenParams } from '~/shared/push/push-notification';

let fixture: ComponentFixture<PushPrimingScreenComponent>;
let instance: PushPrimingScreenComponent;

// These tests are disabled because they cause other tests to fail.
// TODO: understand what's going on and fit it.
xdescribe('PushPrimingScreenComponent', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([PushPrimingScreenComponent])
        .then(compiled => {
          // Common setup:
          fixture = compiled.fixture;
          instance = compiled.instance;
        })
        .then(() => {
          // Current spec setup:
          const navParams = fixture.debugElement.injector.get(NavParams);
          const params: PrimingScreenParams = {
            onAllowClick: () => { },
            onNotNowClick: () => { },
            onBackClick: () => { }
          }
          navParams.data.params = params;
          instance.params = params;

          instance.ionViewDidLoad();
        })
    )
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(PushPrimingScreenComponent);
    instance = fixture.componentInstance;
  });

  it('should create the page', () => {
    expect(instance).toBeTruthy();
  });

  it('should callback when Allow button is clicked', () => {
    spyOn(instance.params, 'onAllowClick');

    fixture.nativeElement.querySelector('[data-test-id=allowBtn]').click();

    expect(instance.params.onAllowClick).toHaveBeenCalled();
  });

  it('should callback when Not Now link is clicked', () => {
    spyOn(instance.params, 'onNotNowClick');

    fixture.nativeElement.querySelector('[data-test-id=notNowBtn]').click();

    expect(instance.params.onNotNowClick).toHaveBeenCalled();
  });
});
