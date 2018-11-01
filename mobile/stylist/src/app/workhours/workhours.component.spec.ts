import { async, ComponentFixture, getTestBed } from '@angular/core/testing';

import { TestUtils } from '../../test';
import { WeekdayIso } from '~/shared/weekday';
import { WorktimeApi } from '~/core/api/worktime.api';
import { WorktimeApiMock } from '~/core/api/worktime.api.mock';

import { defaultEndTime, defaultStartTime, VisualWeekCard, WorkHoursComponent } from './workhours.component';
import { prepareSharedObjectsForTests } from '~/core/test-utils.spec';

let fixture: ComponentFixture<WorkHoursComponent>;
let instance: WorkHoursComponent;
const injector = getTestBed();

describe('Pages: WorktimeComponent', () => {

  prepareSharedObjectsForTests();

  beforeEach(async(() => TestUtils.beforeEachCompiler([WorkHoursComponent])
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

  it('VisualWeekCard: empty card', async () => {
    const card = new VisualWeekCard('9:00', '16:00', []);
    expect(card.getSummaryStr()).toEqual('');
  });

  it('VisualWeekCard: one day card', async () => {
    const card = new VisualWeekCard('9:00', '16:00', [
      {weekdayIso: WeekdayIso.Mon, label: 'Mon', enabled: true}
    ]);

    expect(card.getSummaryStr()).toEqual('Mon: 9a-4p');
  });

  it('VisualWeekCard: all disabled card', async () => {
    const card = new VisualWeekCard('10:00', '16:12', [
      {weekdayIso: WeekdayIso.Mon, label: 'Mon', enabled: false},
      {weekdayIso: WeekdayIso.Tue, label: 'Tue', enabled: false},
      {weekdayIso: WeekdayIso.Wed, label: 'Wed', enabled: false},
      {weekdayIso: WeekdayIso.Thu, label: 'Thu', enabled: false},
      {weekdayIso: WeekdayIso.Fri, label: 'Fri', enabled: false},
      {weekdayIso: WeekdayIso.Sat, label: 'Sat', enabled: false},
      {weekdayIso: WeekdayIso.Sun, label: 'Sun', enabled: false}
    ]);

    expect(card.getSummaryStr()).toEqual('');
  });

  it('VisualWeekCard: Sat-Sun card', async () => {
    const card = new VisualWeekCard('10:00', '16:12', [
      {weekdayIso: WeekdayIso.Mon, label: 'Mon', enabled: false},
      {weekdayIso: WeekdayIso.Tue, label: 'Tue', enabled: false},
      {weekdayIso: WeekdayIso.Wed, label: 'Wed', enabled: false},
      {weekdayIso: WeekdayIso.Thu, label: 'Thu', enabled: false},
      {weekdayIso: WeekdayIso.Fri, label: 'Fri', enabled: false},
      {weekdayIso: WeekdayIso.Sat, label: 'Sat', enabled: true},
      {weekdayIso: WeekdayIso.Sun, label: 'Sun', enabled: true}
    ]);

    expect(card.getSummaryStr()).toEqual('Sat - Sun: 10a-4:12p');
  });

  it('VisualWeekCard: Sat-Sun card', async () => {
    const card = new VisualWeekCard('10:04', '15:00', [
      {weekdayIso: WeekdayIso.Mon, label: 'Mon', enabled: true},
      {weekdayIso: WeekdayIso.Tue, label: 'Tue', enabled: false},
      {weekdayIso: WeekdayIso.Wed, label: 'Wed', enabled: true},
      {weekdayIso: WeekdayIso.Thu, label: 'Thu', enabled: true},
      {weekdayIso: WeekdayIso.Fri, label: 'Fri', enabled: false},
      {weekdayIso: WeekdayIso.Sat, label: 'Sat', enabled: true},
      {weekdayIso: WeekdayIso.Sun, label: 'Sun', enabled: true}
    ]);

    expect(card.getSummaryStr()).toEqual('Mon, Wed - Thu, Sat - Sun: 10:04a-3p');
  });

  it('VisualWeekCard: Mon-Tue card', async () => {
    const card = new VisualWeekCard('13:00', '15:00', [
      {weekdayIso: WeekdayIso.Mon, label: 'Mon', enabled: true},
      {weekdayIso: WeekdayIso.Tue, label: 'Tue', enabled: true},
      {weekdayIso: WeekdayIso.Wed, label: 'Wed', enabled: false},
      {weekdayIso: WeekdayIso.Thu, label: 'Thu', enabled: false},
      {weekdayIso: WeekdayIso.Fri, label: 'Fri', enabled: false},
      {weekdayIso: WeekdayIso.Sat, label: 'Sat', enabled: false},
      {weekdayIso: WeekdayIso.Sun, label: 'Sun', enabled: false}
    ]);

    expect(card.getSummaryStr()).toEqual('Mon - Tue: 1p-3p');
  });

  it('VisualWeekCard: invalid time card', async () => {
    const card = new VisualWeekCard('', '15:00', [
      {weekdayIso: WeekdayIso.Mon, label: 'Mon', enabled: false},
      {weekdayIso: WeekdayIso.Tue, label: 'Tue', enabled: true},
      {weekdayIso: WeekdayIso.Wed, label: 'Wed', enabled: false},
      {weekdayIso: WeekdayIso.Thu, label: 'Thu', enabled: false},
      {weekdayIso: WeekdayIso.Fri, label: 'Fri', enabled: false},
      {weekdayIso: WeekdayIso.Sat, label: 'Sat', enabled: false},
      {weekdayIso: WeekdayIso.Sun, label: 'Sun', enabled: false}
    ]);

    expect(card.getSummaryStr()).toEqual('Tue');
  });

  it('VisualWeekCard: longest string card', async () => {
    const card = new VisualWeekCard('10:45', '23:33', [
      {weekdayIso: WeekdayIso.Mon, label: 'Mon', enabled: true},
      {weekdayIso: WeekdayIso.Tue, label: 'Tue', enabled: true},
      {weekdayIso: WeekdayIso.Wed, label: 'Wed', enabled: false},
      {weekdayIso: WeekdayIso.Thu, label: 'Thu', enabled: true},
      {weekdayIso: WeekdayIso.Fri, label: 'Fri', enabled: true},
      {weekdayIso: WeekdayIso.Sat, label: 'Sat', enabled: false},
      {weekdayIso: WeekdayIso.Sun, label: 'Sun', enabled: true}
    ]);

    expect(card.getSummaryStr()).toEqual('Mon - Tue, Thu - Fri, Sun: 10:45a-11:33p');
  });
});
