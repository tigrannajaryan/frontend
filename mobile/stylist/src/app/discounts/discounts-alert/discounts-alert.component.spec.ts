import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewController } from 'ionic-angular';
import { TestUtils } from '../../../test';
import { DiscountsAlertComponent } from './discounts-alert.component';
import { ViewControllerMock } from '~/shared/view-controller-mock';

let fixture: ComponentFixture<DiscountsAlertComponent>;
let instance: DiscountsAlertComponent;

describe('Pages: DiscountsAlertComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ViewController, useClass: ViewControllerMock }
      ]
    });
  }));

  beforeEach(async(() => TestUtils.beforeEachCompiler([DiscountsAlertComponent])
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

    instance.close(true);

    expect(loadingCtrl.dismiss).toHaveBeenCalled();
  });
});
