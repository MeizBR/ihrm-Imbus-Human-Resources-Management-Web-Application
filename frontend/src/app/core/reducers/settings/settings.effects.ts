import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { concatMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { AppState } from '..';

import { settingsActions } from './settings.actions';
import { getModulesPagesSizes } from './settings.selectors';
import { IHRMAppModules, ModulesPagesSizes } from './settings.reducer';

@Injectable()
export class SettingsEffects {
  updatePagesSize$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(settingsActions.updateModulePageSizeAction),
      withLatestFrom(this.store.pipe(select(getModulesPagesSizes))),
      concatMap(([_, sizes]) => of(settingsActions.setModulePagesSizeAction({ pagesSizes: sizes }))),
    );
  });

  setPageSizesToStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(settingsActions.setModulePagesSizeAction),
      concatMap(action => {
        localStorage.setItem('pagesSize', action.pagesSizes.map(page => `${page.module}-${page.size}`).join(','));

        return of(settingsActions.customerManagementFailAction({ withSnackBarNotification: false }));
      }),
    ),
  );

  constructor(private actions$: Actions, private store: Store<AppState>) {
    const sizesFromStorage = localStorage.getItem('pagesSize');
    // NOTE: sizes in Storage are like "Users-5,Customers-5,Leaves-5,Projects-5"
    let modulesPages: ModulesPagesSizes[] = [];
    if (sizesFromStorage) {
      const pages = sizesFromStorage.split(',');

      // NOTE: It's better to have namespace for IHRMAppModules and helper for this mapping
      modulesPages = pages.map(page => {
        const currentModule =
          page.split('-')[0] === 'Users'
            ? IHRMAppModules.Users
            : page.split('-')[0] === 'Customers'
            ? IHRMAppModules.Customers
            : page.split('-')[0] === 'Projects'
            ? IHRMAppModules.Projects
            : page.split('-')[0] === 'Leaves'
            ? IHRMAppModules.Leaves
            : page.split('-')[0] === 'Calendars'
            ? IHRMAppModules.Calendars
            : page.split('-')[0] === 'Events'
            ? IHRMAppModules.Events
            : undefined;
        let data: ModulesPagesSizes;

        return (data = currentModule
          ? {
              module: currentModule,
              size: parseInt(page.split('-')[1], 10),
            }
          : undefined);
      });
    }

    modulesPages = modulesPages.length
      ? modulesPages
      : [
          { module: IHRMAppModules.Users, size: 5 },
          { module: IHRMAppModules.Customers, size: 5 },
          { module: IHRMAppModules.Leaves, size: 5 },
          { module: IHRMAppModules.Projects, size: 5 },
          { module: IHRMAppModules.Calendars, size: 5 },
          { module: IHRMAppModules.Events, size: 5 },
        ];
    this.store.dispatch(settingsActions.updateModulesPagesSizeAction({ pagesSizes: modulesPages }));
  }
}
