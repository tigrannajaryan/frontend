import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstScreenComponent } from './first-screen';
import { TestUtils } from '../../test';

let fixture: ComponentFixture<FirstScreenComponent>;
let instance: FirstScreenComponent;

describe('Pages: FirstScreenComponent', () => {

  beforeEach(async(() => {
    TestUtils.beforeEachCompiler([FirstScreenComponent])
      .then(compiled => {
        fixture = compiled.fixture;
        instance = compiled.instance;
      });

    TestBed.configureTestingModule({
      declarations: [FirstScreenComponent]
    }).compileComponents();
  }));

  it('should create the page', async(() => {
    expect(instance)
      .toBeTruthy();
  }));
});
