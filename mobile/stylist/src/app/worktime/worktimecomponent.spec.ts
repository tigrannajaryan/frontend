import { async, ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { TestUtils } from '../../test';
import { defaultEndTime, defaultStartTime, WeekdayIso, WorktimeComponent } from './worktime.component';
import { WorktimeComponentModule } from './worktime.component.module';
import { WorktimeApi } from './worktime.api';
import { WorktimeApiMock } from './worktime.api.mock';
import { Worktime } from './worktime.models';
import { SharedModule } from '../shared/shared.module';

let fixture: ComponentFixture<WorktimeComponent>;
let instance: WorktimeComponent;
const injector = getTestBed();

describe('Pages: WorktimeComponent', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WorktimeComponent],
      imports: [SharedModule]
    });
  });

  beforeEach(async(() => TestUtils.beforeEachCompiler([WorktimeComponent])
    .then(compiled => {
      fixture = compiled.fixture;
      instance = compiled.instance;
    })));

  it('should create the page', async () => {
    expect(instance).toBeTruthy();
    expect(instance.cards).toEqual(undefined);
  });

  it('should toggle weekday and steal from another card', async () => {
    await instance.ionViewDidEnter();

    expect(instance.cards.length).toEqual(1);

    expect(instance.cards[0].workStartAt).toEqual(defaultStartTime);
    expect(instance.cards[0].workEndAt).toEqual(defaultEndTime);

    // Add a card
    instance.addNewCard();

    // Make sure it is added
    expect(instance.cards.length).toEqual(2);

    // Check that card 0 Mon is set
    expect(instance.cards[0].weekdays[WeekdayIso.Mon].enabled).toEqual(true);

    // Check that card 1 Mon is not set
    expect(instance.cards[1].weekdays[WeekdayIso.Mon].enabled).toEqual(false);

    // Now toggle Mon on card 1
    instance.toggleWeekday(instance.cards[1].weekdays[WeekdayIso.Mon]);

    // And check that it stole the day from card 0
    expect(instance.cards[0].weekdays[WeekdayIso.Mon].enabled).toEqual(false);
    expect(instance.cards[1].weekdays[WeekdayIso.Mon].enabled).toEqual(true);

    // Now toggle Mon on card 1 again
    instance.toggleWeekday(instance.cards[1].weekdays[WeekdayIso.Mon]);

    // Mon on both cards should be unset now
    expect(instance.cards[0].weekdays[WeekdayIso.Mon].enabled).toEqual(false);
    expect(instance.cards[1].weekdays[WeekdayIso.Mon].enabled).toEqual(false);

    await instance.saveChanges();

    // After saving 2 cards must be collapsed into 1
    expect(instance.cards.length).toEqual(1);

    const api = injector.get(WorktimeApi) as WorktimeApiMock;

    // Make sure Mon is not enabled
    expect(api.lastSet.weekdays[WeekdayIso.Mon].is_available).toEqual(false);

  });
});
