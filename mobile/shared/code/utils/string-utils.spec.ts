import { async } from '@angular/core/testing';
import * as moment from 'moment';

import { formatTimeInZone } from './string-utils';

describe('formatTimeInZone tests', () => {

  it('formatTime should convert am and pm string times', async(() => {
    expect(formatTimeInZone('2018-08-18T14:00:00-06:00')).toEqual('2:00p');
    expect(formatTimeInZone('2018-08-18T09:14:13-06:00')).toEqual('9:14a');
  }));

  it('formatTime should convert moment times', async(() => {
    expect(formatTimeInZone(moment('2017-08-01T10:00:00+01:00'))).toEqual('10:00a');
    expect(formatTimeInZone(moment('2018-01-18T08:14:13+03:00'))).toEqual('8:14a');
  }));

});
