import { Injectable } from '@angular/core';

import { of } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { tasksActions } from './tasks-management.actions';

@Injectable()
export class TasksEffects {
  /** Task management effects */
  addTask$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tasksActions.addTaskAction),
      concatMap(action => of(tasksActions.addTaskSuccessAction({ task: action.task }))),
      catchError(() => of(tasksActions.addTaskFailedAction())),
    );
  });

  updateTask$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tasksActions.updateTaskAction),
      concatMap(action => of(tasksActions.updateTaskSuccessAction({ task: action.task }))),
      catchError(() => of(tasksActions.updateTaskFailedAction())),
    );
  });

  deleteTask$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tasksActions.deleteTaskAction),
      concatMap(action => of(tasksActions.deleteTaskSuccessAction({ task: action.task }))),
      catchError(() => of(tasksActions.deleteTaskFailedAction())),
    );
  });

  /** Progress column management effects */
  addColumn$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tasksActions.addProgressColumnAction),
      concatMap(action => of(tasksActions.addProgressColumnSuccessAction({ progressColumn: action.progressColumn }))),
      catchError(() => of(tasksActions.addProgressColumnFailedAction())),
    );
  });

  constructor(private actions$: Actions) {}
}
