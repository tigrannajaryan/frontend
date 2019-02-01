import { async, ComponentFixture } from '@angular/core/testing';
import { NavController } from 'ionic-angular';

import { TestUtils } from '~/../test';
import { PageNames } from '~/core/page-names';

import { ConfirmCheckoutComponent } from './confirm-checkout.component';

let fixture: ComponentFixture<ConfirmCheckoutComponent>;
let instance: ConfirmCheckoutComponent;

describe('Pages: Confirm Checkout', () => {
  beforeEach(
    async(() =>
      TestUtils.beforeEachCompiler([ConfirmCheckoutComponent])
        .then(compiled => {
          // Common setup:
          fixture = compiled.fixture;
          instance = compiled.instance;
        })
    )
  );

  it('should create the page', () => {
    expect(instance).toBeTruthy();
  });

  it('should have all the texts', () => {
    expect(fixture.nativeElement.textContent)
      .toContain('Congratulations, your check out is complete!');

    expect(fixture.nativeElement.textContent)
      .toContain('Return To Home Screen');
  });

  it('should navigate to home on ”Return To Home” click', () => {
    const navCtrl = fixture.debugElement.injector.get(NavController);

    fixture.nativeElement.querySelector('[data-test-id=backToHome]').click();

    expect(navCtrl.setRoot)
      .toHaveBeenCalledWith(PageNames.MainTabs);
  });

  it('should have made-thumbs component', () => {
    const made_thumbs = fixture.nativeElement.querySelector('[data-test-id=made_thumbs]');
    expect(made_thumbs).toBeDefined();
  });

});
