import { async, ComponentFixture, getTestBed } from '@angular/core/testing';

import { TestUtils } from '../../test';
import { WeekdayIso } from '~/shared/weekday';
import { WorktimeApi } from '~/shared/stylist-api/worktime.api';
import { WorktimeApiMock } from '~/shared/stylist-api/worktime.api.mock';

import { defaultEndTime, defaultStartTime, WorktimeComponent } from './worktime.component';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';

let fixture: ComponentFixture<WorktimeComponent>;
let instance: WorktimeComponent;
const injector = getTestBed();

describe('Pages: WorktimeComponent', () => {

  prepareSharedObjectsForTests();

  beforeEach(async(() => TestUtils.beforeEachCompiler([WorktimeComponent])
    .then(compiled => {
      fixture = compiled.fixture;
      instance = compiled.instance;
      fixture.detectChanges();
    })));

  it('should create the page', async () => {
    expect(instance).toBeTruthy();
    expect(instance.cards).toEqual([]);
  });

  it('should toggle weekday and steal from another card', async () => {
    await instance.ionViewWillLoad();

    // Test non-registration mode, when saving should result in refreshing of the page
    instance.isProfile = true;

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

    await instance.autoSave();

    const api = injector.get(WorktimeApi) as WorktimeApiMock;

    // Make sure Mon is not enabled
    expect(api.lastSet.weekdays[WeekdayIso.Mon].is_available).toEqual(false);

  });
});
