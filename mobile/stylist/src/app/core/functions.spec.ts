import { async } from '@angular/core/testing';
import { profileStatusToPage } from './functions';
import { PageNames } from './page-names';
import { ProfileStatus } from './auth-api-service/auth-api-service';

describe('Shared functions: profileStatusToPage', () => {

  it('should correctly map stylist profile completeness to pages', async(() => {
    // No profile
    expect(profileStatusToPage(undefined))
      .toEqual(PageNames.RegisterSalon);

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

    expect(profileStatusToPage(profileStatus))
      .toEqual(PageNames.Today);
  }));
});
