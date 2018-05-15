import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewController } from 'ionic-angular';
import { TestUtils } from '../../../test';
import { DiscountsChangeComponent } from './discounts-change.component';
import { ViewControllerMock } from '../../shared/view-controller-mock';

let fixture: ComponentFixture<DiscountsChangeComponent>;
let instance: DiscountsChangeComponent;

describe('Pages: DiscountsChangeComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ViewController, useClass: ViewControllerMock }
      ]
    });
  }));

  beforeEach(async(() => TestUtils.beforeEachCompiler([DiscountsChangeComponent])
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

  it('should generate lines for scroll bar', () => {
    instance.generateLines();

    expect(instance.scrollBar.nativeElement.childNodes.length).toEqual(20);
  });

  it('should set percentage', () => {
    instance.setPercentage(50);

    expect(instance.percentage).toEqual(50);
  });
});
