import { async } from '@angular/core/testing';

import { normalizePhoneNumber } from './phone-numbers';

describe('phone-numbers tests', () => {

  it('should validate phone numbers', async(() => {
    expect(normalizePhoneNumber('4166352746', 'US')).toEqual('+1 416 635 2746');
    expect(normalizePhoneNumber('+1 416 635 2746', 'US')).toEqual('+1 416 635 2746');

    expect(normalizePhoneNumber('+37493123456', 'US')).toEqual('+374 93 123456');

    // 374 is not a valid area code in the US
    expect(normalizePhoneNumber('3746352746', 'US')).toEqual(undefined);
    expect(normalizePhoneNumber('+1 374 635 2746', 'US')).toEqual(undefined);
  }));

});
