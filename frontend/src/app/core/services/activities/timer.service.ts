import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import { TimeFormat } from '../../../shared/enum/interval.enum';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private timer = new Subject<string | TimeFormat>();

  setTimer(timer: string | TimeFormat) {
    this.timer.next(timer);
  }

  clearTimer() {
    this.timer.next();
  }

  getTimer(): Observable<string | TimeFormat> {
    return this.timer.asObservable();
  }
}
