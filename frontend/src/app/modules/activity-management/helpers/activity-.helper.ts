import * as moment from 'moment';
import { Duration } from 'moment';
import { HttpErrorResponse } from '@angular/common/http';

import { TimeFormat } from '../../../shared/enum/interval.enum';

export function getTotalDuration(durations: string[]): string {
  const totalDuration = durations.slice(1).reduce((prev, cur) => moment.duration(cur).add(prev), moment.duration(durations[0]));

  return moment.utc(totalDuration.asMilliseconds()).format(TimeFormat.FullTime);
}
export function getTotalDurationInMilliseconds(durations: string[]): number {
  const totalDuration = durations.slice(1).reduce((prev, cur) => moment.duration(cur).add(prev), moment.duration(durations[0]));

  return totalDuration.asMilliseconds();
}
export function getDuration(end: string | moment.Moment, start: string): string {
  return getDurationFormat(moment.duration(moment(end).unix() - moment(start).unix(), 'seconds'));
}

export function getDurationFormat(duration: Duration): string {
  return (
    // tslint:disable-next-line:no-bitwise
    (duration.asHours() | 0) +
    ':' + // NOTE:" | 0 "  to exclude digits after comma
    duration.minutes().toLocaleString([], { minimumIntegerDigits: 2 }) +
    ':' +
    duration.seconds().toLocaleString([], { minimumIntegerDigits: 2 })
  );
}

export function extractActivityErrorMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 403:
      return 'Forbidden or workspace not found !';
    case 404:
      return 'Activity not found !';
    case 422:
      return 'End timestamp should be after start timestamp !';

    default:
      return 'Server error !!';
  }
}
