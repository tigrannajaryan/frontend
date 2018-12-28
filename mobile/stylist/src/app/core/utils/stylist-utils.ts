import { StylistProfile, StylistProfileCompleteness } from '~/shared/api/stylist-app.models';

export function calcProfileCompleteness(fields: StylistProfile): StylistProfileCompleteness {
  const {
    first_name,
    last_name,
    salon_name,
    salon_address,
    profile_photo_url,
    email,
    website_url
  } = fields;
  const profileCompleteness = [
    first_name,
    last_name,
    salon_name,
    salon_address,
    profile_photo_url,
    email,
    website_url
  ];

  const complete = Number(profileCompleteness.reduce((previousValue: number, currentValue) => {
    return !!currentValue ? ++previousValue : previousValue;
  }, 0));
  const completenessPercent = calcPercentageDifference(profileCompleteness.length, complete);

  return {
    isProfileComplete: profileCompleteness.every(item => !!item),
    completenessPercent: +completenessPercent.toFixed()
  };
}

function calcPercentageDifference(oldNumber: number, newNumber: number): number {
  const decreaseValue = oldNumber - newNumber;

  return -((decreaseValue / oldNumber) * 100 - 100);
}
