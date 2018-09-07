import { ProfileCompleteness, ProfileModel } from '~/core/api/profile.models';

export function checkProfileCompleteness(fields: ProfileModel): ProfileCompleteness {
  const { birthday, city, state, ...profileCompleteness } = fields;

  const fieldsValuesArray = Object.keys(profileCompleteness).map(key => fields[key]);
  const complete = fieldsValuesArray.reduce((previousValue, currentValue, index, array) => {
    return !!currentValue ? ++previousValue : previousValue;
  }, 0);
  const completenessPercent = getPercentageChange(fieldsValuesArray.length, complete);

  return {
    isProfileComplete: fieldsValuesArray.every(item => !!item),
    completenessPercent: +completenessPercent.toFixed()
  };
}

function getPercentageChange(oldNumber: number, newNumber: number): number {
  const decreaseValue = oldNumber - newNumber;

  return -((decreaseValue / oldNumber) * 100 - 100);
}
