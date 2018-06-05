import { async } from '@angular/core/testing';
import { createNavHistoryList } from './functions';
import { PageNames } from './page-names';
import { ProfileStatus } from './auth-api-service/auth-api-service';

describe('Shared functions: profileStatusToPage', () => {

  it('should correctly map undefined profile status to RegisterSalon', async(() => {
    // No profile
    expect(createNavHistoryList(undefined))
      .toEqual([{ page: PageNames.RegisterSalon }]);
  }));

  it('should correctly map fully complete profile completeness to Today', async(() => {
    // Full profile
    const profileStatus: ProfileStatus = {
      has_business_hours_set: true,
      has_invited_clients: true,
      has_other_discounts_set: true,
      has_personal_data: true,
      has_picture_set: true,
      has_services_set: true,
      has_weekday_discounts_set: true
    };

    expect(createNavHistoryList(profileStatus))
      .toEqual([{ page: PageNames.Today }]);
  }));

  it('should correctly map half complete profile to the correct list', async(() => {
    // Half profile
    const profileStatus: ProfileStatus = {
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
        { page: PageNames.RegisterSalon },
        { page: PageNames.RegisterServices },
        { page: PageNames.Worktime },
        { page: PageNames.Discounts }
      ]);
  }));
});
