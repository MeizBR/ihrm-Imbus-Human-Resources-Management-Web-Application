import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { select, Store } from '@ngrx/store';

import { selectUserSession } from '../../../core/reducers/auth';
import { getProjectsForCalenderOwner } from '../../../core/reducers/project';
import { AppState, getSelectedCalendarDetails } from '../../../core/reducers';
import { calendarsActions } from '../../../core/reducers/calendar/calendar.actions';
import { getCalendarsError, getCalendarsList } from '../../../core/reducers/calendar';

import { UserSession } from '../../../generated/models';

import { ErrorType } from '../../../shared/validators/validation-error-type';
import { ConfirmDialogComponent } from '../../../shared/component/confirm-dialog/confirm-dialog.component';
import { CalendarDetails, CalendarToUpdate, ConfirmDialogModel, ProjectDetails } from '../../../shared/models/index';

@Component({
  selector: 'app-calendar-details',
  templateUrl: './calendar-details.component.html',
  styleUrls: ['./calendar-details.component.scss'],
})
export class CalendarDetailsComponent {
  public userSession$: Observable<UserSession>;
  public isAdministrator$: Observable<boolean>;
  public error$: Observable<ErrorType | undefined>;
  public allProjects$: Observable<ProjectDetails[]>;
  public allCalendars$: Observable<CalendarDetails[]>;
  public calendarDetails$: Observable<CalendarDetails>;
  public projectsForCalender$: Observable<ProjectDetails[]>;

  constructor(public dialog: MatDialog, private store: Store<AppState>) {
    this.error$ = this.store.pipe(select(getCalendarsError));
    this.userSession$ = this.store.pipe(select(selectUserSession));
    this.allCalendars$ = this.store.pipe(select(getCalendarsList));
    this.calendarDetails$ = this.store.pipe(select(getSelectedCalendarDetails)).pipe(
      map(calendar => {
        this.projectsForCalender$ = this.store.pipe(select(getProjectsForCalenderOwner(calendar.userId, calendar.project)));

        return calendar;
      }),
    );
  }

  public updateCalendar(data: { calendarId: number; calendarForUpdate: CalendarToUpdate }): void {
    this.store.dispatch(calendarsActions.updateCalendarAction({ calendarToUpdate: data.calendarForUpdate, id: data.calendarId }));
  }

  public deleteCalendar(id: number): void {
    let dialogRef: MatDialogRef<ConfirmDialogComponent>;
    const data: ConfirmDialogModel = {
      title: 'DELETE_TITLE',
      message: 'DELETE_CALENDAR_MESSAGE',
    };

    dialogRef = this.dialog.open(ConfirmDialogComponent, { maxWidth: '400px', data });

    const subscribeDialog = dialogRef?.afterClosed().subscribe((dialogResult: boolean) => {
      if (dialogResult) {
        this.store.dispatch(calendarsActions.deleteCalendarAction({ id }));
      }
    });
    dialogRef.afterClosed().subscribe(_ => subscribeDialog.unsubscribe());
  }
}
