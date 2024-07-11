import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { QuillModule } from 'ngx-quill';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { FullCalendarModule } from '@fullcalendar/angular';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AngularMaterialModule } from './angular-material/angular-material.module';

import { DatesDiffPipe } from './pipes/dates-diff.pipe';

// SHARED COMPONENT import
import { ListItemsComponent } from './component/list-items/list-items.component';
import { CreateItemComponent } from './component/create-item/create-item.component';
import { SelectItemComponent } from './component/select-item/select-item.component';
import { ConfirmDialogComponent } from './component/confirm-dialog/confirm-dialog.component';
import { WarningDialogComponent } from './component/warning-dialog/warning-dialog.component';

// ACTIVITY components import
import { ActivityComponent } from '../modules/activity-management/activity.component';
import { ActivityDetailsComponent } from '../modules/activity-management/components/activity-details/activity-details.component';

// CALENDAR components import
import { CalendarComponent } from '../modules/calendar-management/calendar.component';
import { CalendarsComponent } from '../modules/calendar-management/calendars/calendars.component';
import { CalendarsListComponent } from '../modules/calendar-management/calendars-list/calendars-list.component';
import { AddCalendarComponent } from '../modules/calendar-management/components/add-calendar/add-calendar.component';
import { CalendarDetailsComponent } from '../modules/calendar-management/calendar-details/calendar-details.component';
import { AllCalendarsComponent } from '../modules/calendar-management/components/all-calendars/all-calendars.component';
import { EditCalendarComponent } from '../modules/calendar-management/components/edit-calendar/edit-calendar.component';
import { CalendarHeaderComponent } from '../modules/calendar-management/components/calendar-header/calendar-header.component';
import { FilterCalendarsComponent } from '../modules/calendar-management/components/filter-calendars/filter-calendars.component';

// PROJECT components import
import { ProjectsComponent } from '../modules/projects-management/projects.component';
import { RolesComponent } from '../modules/projects-management/components/roles/roles.component';
import { ProjectsListComponent } from '../modules/projects-management/projects-list/projects-list.component';
import { SetRolesComponent } from '../modules/projects-management/components/roles/set-roles/set-roles.component';
import { AddProjectComponent } from '../modules/projects-management/components/add-project/add-project.component';
import { ProjectDetailsComponent } from '../modules/projects-management/project-details/project-details.component';
import { EditProjectComponent } from '../modules/projects-management/components/edit-project/edit-project.component';
import { ProjectHeaderComponent } from '../modules/projects-management/components/project-header/project-header.component';
import { RolesChipListComponent } from '../modules/projects-management/components/roles/roles-chip-list/roles-chip-list.component';

// TEAM components import
import { TeamComponent } from '../modules/team-management/team.component';
import { ProfileComponent } from '../modules/team-management/profile/profile.component';
import { UsersListComponent } from '../modules/team-management/usersList/users-list.component';
import { AddUserComponent } from '../modules/team-management/components/add-user/add-user.component';
import { UserHeaderComponent } from '../modules/team-management/components/user-header/user-header.component';
import { AllUsersCardComponent } from '../modules/team-management/components/all-users-card/all-users-card.component';
import { ProfileHeaderComponent } from '../modules/team-management/components/profile-header/profile-header.component';
import { EditProfileCardComponent } from '../modules/team-management/components/edit-profile-card/edit-profile-card.component';

// Events components import
import { EventsComponent } from '../modules/events-management/events.component';
import { DatepickerComponent } from './component/datepicker/datepicker.component';
import { DatetimepickerComponent } from './component/datetimepicker/datetimepicker.component';
import { EventsListComponent } from '../modules/events-management/events-list/events-list.component';
import { AddEventComponent } from '../modules/events-management/components/add-event/add-event.component';
import { EventDetailsComponent } from '../modules/events-management/event-details/event-details.component';
import { AllEventsComponent } from '../modules/events-management/components/all-events/all-events.component';
import { EditEventComponent } from '../modules/events-management/components/edit-event/edit-event.component';
import { EventHeaderComponent } from '../modules/events-management/components/event-header/event-header.component';

// LEAVE components import
import { LeavesComponent } from '../modules/leave-management/leaves.component';
import { LeavesListComponent } from '../modules/leave-management/leaves-list/leaves-list.component';
import { AddLeaveComponent } from '../modules/leave-management/components/add-leave/add-leave.component';
import { LeaveDetailsComponent } from '../modules/leave-management/leave-details/leave-details.component';
import { EditLeaveComponent } from '../modules/leave-management/components/edit-leave/edit-leave.component';
import { LeaveHeaderComponent } from '../modules/leave-management/components/leave-header/leave-header.component';
import { AllLeavesCardComponent } from '../modules/leave-management/components/all-leaves-card/all-leaves-card.component';

// TASKS-MANAGEMENT  components import
import { TaskManagementComponent } from '../modules/tasks-management/task-management.component';
import { AddTaskCardComponent } from '../modules/tasks-management/add-task-card/add-task-card.component';
import { CardTaskSummaryComponent } from '../modules/tasks-management/card-task-summary/card-task-summary.component';
import { AddProgressColumnComponent } from '../modules/tasks-management/add-progress-column/add-progress-column.component';

import { SearchFilterPipe } from './custom-pipes/search-filter.pipe';
import { PaginatorDirective } from './directives/paginator.directive';
import { NoItemsComponent } from './component/no-items/no-items.component';
import { ItemStatusComponent } from './component/item-status/item-status.component';

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const quillModules = {
  toolbar: [
    // [{ header: [1, 2, 3, false] }],
    [{ size: ['small', false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    // ['blockquote', 'code-block'],
    // [{ list: 'ordered' }, { list: 'bullet' }],
  ],
};

FullCalendarModule.registerPlugins([dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]);

@NgModule({
  declarations: [
    TeamComponent,
    DatesDiffPipe,
    RolesComponent,
    EventsComponent,
    LeavesComponent,
    AddUserComponent,
    ProfileComponent,
    SearchFilterPipe,
    SearchFilterPipe,
    AddEventComponent,
    ProjectsComponent,
    CalendarComponent,
    SetRolesComponent,
    ActivityComponent,
    ActivityDetailsComponent,
    AddLeaveComponent,
    AllEventsComponent,
    CalendarsComponent,
    UsersListComponent,
    ListItemsComponent,
    EditLeaveComponent,
    EditEventComponent,
    AddProjectComponent,
    CreateItemComponent,
    DatepickerComponent,
    EventsListComponent,
    LeavesListComponent,
    SelectItemComponent,
    UserHeaderComponent,
    UserHeaderComponent,
    AddCalendarComponent,
    LeaveHeaderComponent,
    AddTaskCardComponent,
    EditProjectComponent,
    EventHeaderComponent,
    LeaveDetailsComponent,
    AllUsersCardComponent,
    ProjectsListComponent,
    AllCalendarsComponent,
    EditCalendarComponent,
    EventDetailsComponent,
    AllLeavesCardComponent,
    ConfirmDialogComponent,
    CalendarsListComponent,
    ProfileHeaderComponent,
    ProjectHeaderComponent,
    RolesChipListComponent,
    WarningDialogComponent,
    DatetimepickerComponent,
    CalendarHeaderComponent,
    TaskManagementComponent,
    ProjectDetailsComponent,
    CardTaskSummaryComponent,
    EditProfileCardComponent,
    CalendarDetailsComponent,
    FilterCalendarsComponent,
    AddProgressColumnComponent,
    PaginatorDirective,
    NoItemsComponent,
    ItemStatusComponent,
  ],
  imports: [
    FormsModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    RouterModule,
    FlexLayoutModule,
    BrowserModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    // CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
    FullCalendarModule,
    QuillModule.forRoot({ modules: quillModules }),
  ],
  exports: [FormsModule, ReactiveFormsModule, CommonModule, FlexLayoutModule, AngularMaterialModule, QuillModule, ListItemsComponent, PaginatorDirective, NoItemsComponent],
  entryComponents: [CreateItemComponent, ConfirmDialogComponent, EventsComponent, AddProgressColumnComponent],
})
export class SharedModule {}
