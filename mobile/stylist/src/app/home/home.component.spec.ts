import { async, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActionSheetController } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';
import { StoreModule } from '@ngrx/store';

import { TestUtils } from '../../test';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';
import { HomeComponent } from '~/home/home.component';
import { HomeService } from '~/core/api/home/home.service';
import { profileReducer, profileStatePath } from '~/core/reducers/profile.reducer';
import { homeReducer } from '~/core/reducers/home.reducer';
import { GAWrapper } from '~/shared/google-analytics';

let fixture: ComponentFixture<HomeComponent>;
let instance: HomeComponent;

describe('Pages: HomeComponent', () => {

  prepareSharedObjectsForTests();

  beforeEach(async () => TestUtils.beforeEachCompiler([
    HomeComponent
  ], [
    HomeService,
    ActionSheetController,
    GAWrapper,
    AppVersion
  ], [
    HttpClientTestingModule,
    StoreModule.forFeature('home', homeReducer),
    StoreModule.forFeature(profileStatePath, profileReducer)
  ]).then(compiled => {
    fixture = compiled.fixture;
    instance = compiled.instance;

    // subscribe to store
    instance.ionViewWillEnter();
  }));

  it('should create the page', async(() => {
    expect(instance)
      .toBeTruthy();
  }));
});
