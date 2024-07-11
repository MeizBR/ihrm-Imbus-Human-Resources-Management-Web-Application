import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { metaReducers, reducers } from '.';

import { AuthEffects } from './auth/auth.effects';
import { UserEffects } from './user/user.effects';
import { EventEffects } from './event/event.effects';
import { LeaveEffects } from './leave/leave.effects';
import { ProjectsEffects } from './project/project.effects';
import { ActivityEffects } from './activity/activity.effects';
import { CustomerEffects } from './customer/customer.effects';
import { CalendarEffects } from './calendar/calendar.effects';
import { TasksEffects } from './task/tasks-management.effects';
import { SettingsEffects } from './settings/settings.effects';

import { environment } from '../../../environments/environment';
import { NotificationsEffects } from './notifications/notifications.effects';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forRoot(reducers, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
      },
    }),
    StoreDevtoolsModule.instrument({
      maxAge: 10,
      logOnly: environment.production,
    }),
    EffectsModule.forRoot([
      AuthEffects,
      TasksEffects,
      ActivityEffects,
      CustomerEffects,
      ProjectsEffects,
      UserEffects,
      LeaveEffects,
      CalendarEffects,
      SettingsEffects,
      EventEffects,
      NotificationsEffects
    ]),
  ],
})
export class StateModule {}
