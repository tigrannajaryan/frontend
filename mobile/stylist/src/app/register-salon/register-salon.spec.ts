import { async, ComponentFixture } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { Camera } from '@ionic-native/camera';
import { ActionSheetController } from 'ionic-angular';
import { MapsAPILoader } from '@agm/core';

import { Logger } from '~/shared/logger';
import { ServerStatusTracker } from '~/shared/server-status-tracker';
import { ProfileDataStore } from '~/core/profile.data';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';
import { TestUtils } from '../../test';
import { RegisterSalonComponent } from './register-salon';

let fixture: ComponentFixture<RegisterSalonComponent>;
let instance: RegisterSalonComponent;

describe('Pages: RegisterSalonComponent', () => {

  prepareSharedObjectsForTests();

  // TestBed.createComponent(ProfileComponent) inside
  // see https://angular.io/guide/testing#component-class-testing for more info
  beforeEach(async(() => TestUtils.beforeEachCompiler(
    [
      RegisterSalonComponent
    ], [
      MapsAPILoader,
      HttpClient,
      HttpHandler,
      Logger,
      ServerStatusTracker,
      Camera,
      ActionSheetController,
      ProfileDataStore
    ]).then(compiled => {
      fixture = compiled.fixture; // https://angular.io/api/core/testing/ComponentFixture
      instance = compiled.instance;
    })
  ));

  it('should create the page', async(() => {
    expect(instance)
      .toBeTruthy();
  }));

});
