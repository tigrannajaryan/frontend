import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestUtils } from '~/../test';
import { PushPrimingScreenComponent } from '~/shared/components/push-priming-screen/push-priming-screen.component';

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
});
