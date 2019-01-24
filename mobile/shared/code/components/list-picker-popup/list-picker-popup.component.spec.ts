import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, NavParams, ViewController } from 'ionic-angular';
import { ViewControllerMock } from 'ionic-mocks';
import * as faker from 'faker';

import { ListPickerPopupComponent, ListPickerPopupParams } from './list-picker-popup.component';

let fixture: ComponentFixture<ListPickerPopupComponent>;
let instance: ListPickerPopupComponent;
let params: ListPickerPopupParams;

describe('ListPickerPopupComponent', () => {
  beforeEach(async(() =>
    TestBed
      .configureTestingModule({
        declarations: [ListPickerPopupComponent],
        providers: [
          NavParams,
          { provide: ViewController, useFactory: () => ViewControllerMock.instance() }
        ],
        imports: [
          // Load all Ionic’s deps:
          IonicModule.forRoot(this)
        ]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ListPickerPopupComponent);
        instance = fixture.componentInstance;
      })
      .then(() => {
        params = {
          options: [{
            label: faker.commerce.productName(),
            value: 1
          }],
          title: faker.lorem.sentence(),
          onSelect: jasmine.createSpy('onSelect')
        };
        const navParams = fixture.debugElement.injector.get(NavParams);
        navParams.data = { params };
        instance.ngOnInit();
        fixture.detectChanges();
      })
  ));

  it('should create the component', () => {
    expect(instance)
      .toBeTruthy();
  });

  it('should show title', () => {
    expect(fixture.nativeElement.textContent)
      .toContain(params.title);
  });

  it('should show options', () => {
    for (const option of params.options) {
      expect(fixture.nativeElement.textContent)
        .toContain(option.label);
    }
  });
});
