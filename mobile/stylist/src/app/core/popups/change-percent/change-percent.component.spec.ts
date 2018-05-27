import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Haptic, ViewController } from 'ionic-angular';
import { TestUtils } from '../../../../test';
import { ChangePercentComponent } from './change-percent.component';
import { ViewControllerMock } from '~/shared/view-controller-mock';

let fixture: ComponentFixture<ChangePercentComponent>;
let instance: ChangePercentComponent;

describe('Pages: ChangePercentComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        Haptic,
        { provide: ViewController, useClass: ViewControllerMock }
      ]
    });
  }));

  beforeEach(async(() => TestUtils.beforeEachCompiler([ChangePercentComponent])
    .then(compiled => {
      fixture = compiled.fixture;
      instance = compiled.instance;
    })));

  it('should create the page', async(() => {
    expect(instance)
      .toBeTruthy();
  }));

  it('should dismiss modal', () => {
    let loadingCtrl = fixture.debugElement.injector.get(ViewController);
    spyOn(loadingCtrl, 'dismiss');

    instance.save();

    expect(loadingCtrl.dismiss).toHaveBeenCalled();
  });
});
