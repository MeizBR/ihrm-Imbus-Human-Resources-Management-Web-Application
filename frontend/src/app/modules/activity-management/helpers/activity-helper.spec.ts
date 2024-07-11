import * as moment from 'moment';
import { getDuration, getDurationFormat, getTotalDuration } from './activity-.helper';

describe('test activity helper functions', () => {
  it('get the total duration of an array of work duration', () => {
    let mockDuration = ['0:00:01', '0:00:02', '0:00:03'];
    let totalWorkDuration = getTotalDuration(mockDuration);

    expect(totalWorkDuration).toEqual('00:00:06');

    mockDuration = ['0:00:02', '0:00:01'];
    totalWorkDuration = getTotalDuration(mockDuration);

    expect(totalWorkDuration).toEqual('00:00:03');
    mockDuration = ['0:00:02'];
    totalWorkDuration = getTotalDuration(mockDuration);

    expect(totalWorkDuration).toEqual('00:00:02');
  });

  it('test the getDurationFormat function', () => {
    const mockStart = 'Mon Dec 21 2020 07:55:34 GMT+0100';
    let mockEnd: moment.Moment | string = 'Mon Dec 21 2020 09:16:25 GMT+0100';
    let mockDuration = moment.duration(moment(mockEnd).unix() - moment(mockStart).unix(), 'seconds');
    let result = getDurationFormat(mockDuration);
    expect(result).toEqual('1:20:51');

    mockEnd = 'Mon Dec 21 2020 08:16:25 GMT+0100';
    mockDuration = moment.duration(moment(mockEnd).unix() - moment(mockStart).unix(), 'seconds');
    result = getDurationFormat(mockDuration);
    expect(result).toEqual('0:20:51');
  });

  it('get the get duration between two dates', () => {
    let mockStart = 'Mon Dec 21 2020 07:55:34 GMT+0100';
    let mockEnd: moment.Moment | string = moment('Mon Dec 21 2020 09:16:25 GMT+0100');
    let result = getDuration(mockEnd, mockStart);
    expect(result).toEqual('1:20:51');

    mockEnd = moment('Mon Dec 21 2020 08:16:25 GMT+0100');
    result = getDuration(mockEnd, mockStart);
    expect(result).toEqual('0:20:51');

    mockEnd = 'Mon Dec 21 2020 09:16:25 GMT+0100';
    result = getDuration(mockEnd, mockStart);
    expect(result).toEqual('1:20:51');

    mockStart = '2020-12-21T07:55:34.406Z';
    mockEnd = moment('2020-12-21T08:16:25.406Z');
    result = getDuration(mockEnd, mockStart);
    expect(result).toEqual('0:20:51');
  });
});
