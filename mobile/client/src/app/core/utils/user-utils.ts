import { ProfileCompleteness, ProfileModel } from '~/core/api/profile.models';

export function checkProfileCompleteness(fields: ProfileModel): ProfileCompleteness {
  const { first_name, last_name, zip_code, email, profile_photo_url } = fields;
  const profileCompleteness = [first_name, last_name, zip_code, email, profile_photo_url];

  const complete = Number(profileCompleteness.reduce((previousValue: number, currentValue) => {
    return !!currentValue ? ++previousValue : previousValue;
  }, 0));
  const completenessPercent = getPercentageChange(profileCompleteness.length, complete);

  return {
    isProfileComplete: profileCompleteness.every(item => !!item),
    completenessPercent: +completenessPercent.toFixed()
  };
}

function getPercentageChange(oldNumber: number, newNumber: number): number {
  const decreaseValue = oldNumber - newNumber;

  return -((decreaseValue / oldNumber) * 100 - 100);
}
