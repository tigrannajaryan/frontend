import { async } from '@angular/core/testing';
import { createNavHistoryList } from './functions';
import { PageNames } from './page-names';
import { StylistProfileStatus } from '~/shared/stylist-api/stylist-models';

describe('Shared functions: profileStatusToPage', () => {

  it('should correctly map undefined profile status to RegisterSalon', async(() => {
    // No profile
    expect(createNavHistoryList(undefined))
      .toEqual([
        { page: PageNames.FirstScreen },
        { page: PageNames.RegisterSalon }
      ]);
  }));

  it('should correctly map fully complete profile completeness to Tabs screen', async(() => {
    // Full profile
    const profileStatus: StylistProfileStatus = {
      has_business_hours_set: true,
      has_invited_clients: true,
      has_other_discounts_set: true,
      has_personal_data: true,
      has_picture_set: true,
      has_services_set: true,
      has_weekday_discounts_set: true
    };

    expect(createNavHistoryList(profileStatus))
      .toEqual([{ page: PageNames.Tabs }]);
  }));

  it('should correctly map half complete profile to the correct list', async(() => {
    // Half profile
    const profileStatus: StylistProfileStatus = {
      has_business_hours_set: true,
      has_invited_clients: false,
      has_other_discounts_set: false,
      has_personal_data: true,
      has_picture_set: true,
      has_services_set: true,
      has_weekday_discounts_set: false
    };

    expect(createNavHistoryList(profileStatus))
      .toEqual([
        { page: PageNames.FirstScreen },
        { page: PageNames.RegisterSalon },
        { page: PageNames.Services },
        { page: PageNames.WorkHours },
        { page: PageNames.DiscountsWeekday }
      ]);
  }));
});
