import { async, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TestUtils } from '../../test';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';
import { HomeComponent } from '~/home/home.component';
import { Store, StoreModule } from '@ngrx/store';
import { HomeService } from '~/home/home.service';
import { profileReducer, profileStatePath } from '~/core/components/user-header/profile.reducer';
import { ActionSheetController } from 'ionic-angular';
import { homeReducer, HomeState } from '~/home/home.reducer';

let fixture: ComponentFixture<HomeComponent>;
let instance: HomeComponent;
let store: Store<HomeState>;

describe('Pages: HomeComponent', () => {

  prepareSharedObjectsForTests();

  beforeEach(async () => TestUtils.beforeEachCompiler([
    HomeComponent
  ], [
    HomeService,
    ActionSheetController
  ], [
    HttpClientTestingModule,
    StoreModule.forFeature('home', homeReducer),
    StoreModule.forFeature(profileStatePath, profileReducer)
  ]).then(compiled => {
    fixture = compiled.fixture;
    instance = compiled.instance;

    store = fixture.debugElement.injector.get(Store);

    // subscribe to store
    instance.ionViewDidEnter();
  }));

  it('should create the page', async(() => {
    expect(instance)
      .toBeTruthy();
  }));
});
