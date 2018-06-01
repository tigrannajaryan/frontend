import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {InvitationsComponent} from './invitations.component';
import {TestUtils} from '../../test';
import {InvitationsApi} from './invitations.api';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

let injector: TestBed;
let fixture: ComponentFixture<InvitationsComponent>;
let instance: InvitationsComponent;
let invitationsApi: InvitationsApi;
let httpMock: HttpTestingController;

describe('Pages: InvitationsComponent', () => {

  // beforeEach(async(() => {
  //   TestBed.configureTestingModule({
  //     imports: [
  //       HttpClientTestingModule
  //     ],
  //     providers: [
  //       InvitationsApi
  //     ]
  //   });
  // }));

  // beforeEach(async(() => TestUtils.beforeEachCompiler([InvitationsComponent])
  //   .then(compiled => {
  //     fixture = compiled.fixture;
  //     instance = compiled.instance;

  //     injector = getTestBed();
  //     invitationsApi = injector.get(invitationsApi);
  //     httpMock = injector.get(HttpTestingController);
  //   })));

  // it('should create the page', async(() => {
  //   expect(instance).toBeTruthy();
  // }));

});
