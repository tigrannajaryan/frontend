import { async, ComponentFixture } from '@angular/core/testing';
import { NavController } from 'ionic-angular';

import { AppStoreWebPage } from '~/shared/constants';
import { ExternalAppService } from '~/shared/utils/external-app-service';

import { PageNames } from '~/core/page-names';

import { TestUtils } from '../../test';
import { FirstScreenComponent } from './first-screen';

let fixture: ComponentFixture<FirstScreenComponent>;
let instance: FirstScreenComponent;

describe('Pages: FirstScreenComponent', () => {

  beforeEach(async(() =>
    TestUtils
      .beforeEachCompiler([FirstScreenComponent])
      .then(compiled => {
        fixture = compiled.fixture;
        instance = compiled.instance;
      })
  ));

  it('should create the page', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should go to Auth on login', () => {
    const nav = fixture.debugElement.injector.get(NavController);

    fixture.nativeElement.querySelector('[data-test-id=getStartedBtn]').click();

    expect(nav.push)
      .toHaveBeenCalledWith(PageNames.Auth);
  });

  it('should go to app in store on ”I am Client” click', () => {
    const external = fixture.debugElement.injector.get(ExternalAppService);
    spyOn(external, 'openWebPage');

    fixture.nativeElement.querySelector('[data-test-id=clientAppBtn]').click();

    expect(external.openWebPage)
      .toHaveBeenCalledWith(AppStoreWebPage.iOSClient);
  });
});
