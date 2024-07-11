import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './auth/guards/auth.guard';
import { LogoutGuard } from './auth/guards/logout.guard';
import { LeaveGuard } from './core/services/leaves/leave.guard';
import { EventsGuard } from './core/services/events/events.guard';
import { UsersGuard } from './core/services/team/team-guard.guard';
import { ActivityGuard } from './core/services/activities/activity.guard';
import { CalendarsGuard } from './core/services/calendar/calendars.guard';
import { UserProfileGuard } from './core/services/team/team-profile.guard';
import { ProjectsGuard } from './core/services/projects/project-guard.guard';
import { EventDetailsGuard } from './core/services/events/event-details.guard';
import { LeaveDetailsGuard } from './core/services/leaves/leave-details.guard';
import { CustomersGuard } from './core/services/customers/customer-guard.guard';
import { ProjectDetailsGuard } from './core/services/projects/project-details.guard';
import { CalendarDetailsGuard } from './core/services/calendar/calendar-details.guard';
import { CustomerDetailsGuard } from './core/services/customers/customer-details.guard';
import { CalendarsManagementGuard } from './core/services/calendar/calendars-management.guard';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { TeamComponent } from './modules/team-management/team.component';
import { LeavesComponent } from './modules/leave-management/leaves.component';
import { EventsComponent } from './modules/events-management/events.component';
import { CalendarComponent } from './modules/calendar-management/calendar.component';
import { ProjectsComponent } from './modules/projects-management/projects.component';
import { ActivityComponent } from './modules/activity-management/activity.component';
import { ProfileComponent } from './modules/team-management/profile/profile.component';
import { CustomersComponent } from './modules/customers-management/customers.component';
import { UsersListComponent } from './modules/team-management/usersList/users-list.component';
import { CalendarsComponent } from './modules/calendar-management/calendars/calendars.component';
import { LeavesListComponent } from './modules/leave-management/leaves-list/leaves-list.component';
import { EventsListComponent } from './modules/events-management/events-list/events-list.component';
import { LeaveDetailsComponent } from './modules/leave-management/leave-details/leave-details.component';
import { EventDetailsComponent } from './modules/events-management/event-details/event-details.component';
import { ProjectsListComponent } from './modules/projects-management/projects-list/projects-list.component';
import { CalendarsListComponent } from './modules/calendar-management/calendars-list/calendars-list.component';
import { CustomersListComponent } from './modules/customers-management/customers-list/customers-list.component';
import { ProjectDetailsComponent } from './modules/projects-management/project-details/project-details.component';
import { CalendarDetailsComponent } from './modules/calendar-management/calendar-details/calendar-details.component';
import { CustomerDetailsComponent } from './modules/customers-management/customer-details/customer-details.component';
import { ReportsComponent } from './modules/reports-management/reports.component';
import { ReportsDetailedComponent } from './modules/reports-management/reports-detailed/reports-detailed.component';
import { AllNotificationsComponent } from './modules/all-notifications/all-notifications.component';
import { NotificationGuard } from './core/user_notifications/notification.guard';
import { DashBoardComponent } from './modules/dash-board/dash-board.component';
import { DashGuard } from './auth/guards/dash.guard';
import { ReportsSummaryComponent } from './modules/reports-management/reports-summary/reports-summary.component';
import { ReportsWeeklyComponent } from './modules/reports-management/reports-weekly/reports-weekly.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/login' },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [LogoutGuard],
    canActivateChild: [LogoutGuard],
    children: [
      {
        path: 'dashboard',
        component: DashBoardComponent,
        canActivate: [DashGuard],

      },
      {
        path: 'timeTracker',
        component: ActivityComponent,
        canActivate: [ActivityGuard],
      },
      {
        path: 'notification',
        component: AllNotificationsComponent,
        canActivate: [NotificationGuard]
      },
      {
        path: 'leaves',
        component: LeavesComponent,
        canActivate: [LeaveGuard],
        children: [
          {
            path: '',
            component: LeavesListComponent,
          },
          {
            path: 'leave/:leaveId',
            canActivate: [LeaveDetailsGuard],
            component: LeaveDetailsComponent,
          },
        ],
      },
      {
        path: 'events',
        component: EventsComponent,
        canActivate: [EventsGuard],
        children: [
          {
            path: '',
            component: EventsListComponent,
          },
          {
            path: 'event/:eventId',
            canActivate: [EventDetailsGuard],
            component: EventDetailsComponent,
          },
        ],
      },
      {
        path: 'calendars',
        component: CalendarComponent,
        canActivate: [CalendarsGuard],
        children: [
          {
            path: '',
            component: CalendarsComponent,
          },
          {
            path: 'calendar/:calendarId',
            canActivate: [CalendarDetailsGuard],
            component: CalendarDetailsComponent,
          },
          {
            path: 'calendars-management',
            canActivate: [CalendarsManagementGuard],
            component: CalendarsListComponent,
          },
        ],
      },
      {
        path: 'team',
        component: TeamComponent,
        canActivate: [UsersGuard],
        children: [
          {
            path: '',
            component: UsersListComponent,
          },
          {
            path: 'profile/:profileId',
            canActivate: [UserProfileGuard],
            component: ProfileComponent,
          },
        ],
      },
      {
        path: 'projects',
        component: ProjectsComponent,
        canActivate: [ProjectsGuard],
        children: [
          {
            path: '',
            component: ProjectsListComponent,
          },
          {
            path: 'details/:projectId',
            canActivate: [ProjectDetailsGuard],
            component: ProjectDetailsComponent,
          },
        ],
      },
      {
        path: 'customers',
        component: CustomersComponent,
        canActivate: [CustomersGuard],
        children: [
          {
            path: '',
            component: CustomersListComponent,
          },
          {
            path: 'details/:customerId',
            canActivate: [CustomerDetailsGuard],
            component: CustomerDetailsComponent,
          },
        ],
      },
      {
        path: 'reports',
        component: ReportsComponent,
        children: [
          {
            path: 'summary',
            component: ReportsSummaryComponent,
          },
          {
            path: 'detailed',
            component: ReportsDetailedComponent,
          },
          {
            path: 'weekly',
            component: ReportsWeeklyComponent,
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
