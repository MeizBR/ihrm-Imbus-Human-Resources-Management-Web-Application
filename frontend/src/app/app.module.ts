import {LOCALE_ID, NgModule} from "@angular/core";
import {HttpClientModule} from "@angular/common/http";
import {MAT_DATE_LOCALE} from "@angular/material/core";
import {MatPaginatorIntl} from "@angular/material/paginator";
import {BrowserModule, HammerModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {TranslateService} from "@ngx-translate/core";
import {AuthModule} from "./auth/auth.module";
import {AppRoutingModule} from "./app-routing.module";
import {CustomerModule} from "./modules/customers-management/customer.module";
import {StateModule} from "./core/reducers/state.module";
import {BaseHttpService} from "./core/services/base-http.service";
import {authInterceptorProviders} from "./core/services/auth/auth-interceptor.service";
import {SharedModule} from "./shared/shared.module";
import {HeaderComponent} from "./shared/component/header/header.component";
import {SidebarComponent} from "./shared/component/sidebar/sidebar.component";
import {CustomPaginator} from "./shared/component/list-items/custom-paginator";
import {AngularMaterialModule} from "./shared/angular-material/angular-material.module";
import {AppComponent} from "./app.component";
import {HomeComponent} from "./home/home.component";
import {LoginComponent} from "./auth/login/login.component";
import { ReportsComponent } from "./modules/reports-management/reports.component";
import {ReportsHeaderComponent} from "./modules/reports-management/components/reports-header/reports-header.component";
import {ReportsListComponent} from "./modules/reports-management/components/reports-list/reports-list.component";
import {ReportsDetailedComponent} from "./modules/reports-management/reports-detailed/reports-detailed.component";
import {AllNotificationsComponent} from "./modules/all-notifications/all-notifications.component";
import {EditActivityComponent} from "./modules/activity-management/components/edit-activity/edit-activity.component";
import {NgxChartsModule} from "@swimlane/ngx-charts";
import {DashBoardComponent} from "./modules/dash-board/dash-board.component";
import {ChartsComponent} from "./modules/dash-board/charts-component/charts.component";
import {VerticalChartComponent} from "./modules/dash-board/vertical-chart/vertical-chart.component";
import {TopActivitiesListComponent} from "./modules/dash-board/top-acitivities-list/top-activities-list.component";
import {DashBoardHeaderComponent} from "./modules/dash-board/sadh-board-header/dash-board-header.component";
import {TeamActivitiesListComponent} from "./modules/dash-board/team-activities-list/team-activities-list.component";
import {NgxDaterangepickerMd} from "ngx-daterangepicker-material";
import {FilterBarComponent} from "./modules/reports-management/components/filter-bar/filter-bar.component";
import {DatePipe} from "@angular/common";
import {ReportsSummaryComponent} from "./modules/reports-management/reports-summary/reports-summary.component";
import {ReactiveFormsModule} from "@angular/forms";
import {NgApexchartsModule} from "ng-apexcharts";
import {ReportsDashboardComponent} from "./modules/reports-management/components/reports-dashboard/reports-dashboard.component";
import {ReportsStatsComponent} from "./modules/reports-management/components/reports-stats/reports-stats.component";
import {ReportsWeeklyComponent} from "./modules/reports-management/reports-weekly/reports-weekly.component";
import {FormsModule} from "@angular/forms";

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        HomeComponent,
        SidebarComponent,
        HeaderComponent,
        ReportsComponent,
        ReportsHeaderComponent,
        ReportsListComponent,
        ReportsDetailedComponent,
        FilterBarComponent,
        ReportsSummaryComponent,
        ReportsDashboardComponent,
        ReportsStatsComponent,
        ReportsWeeklyComponent,
        AllNotificationsComponent,
        EditActivityComponent,
        DashBoardComponent,
        ChartsComponent,
        VerticalChartComponent,
        TopActivitiesListComponent,
        DashBoardHeaderComponent,
        TeamActivitiesListComponent,
    ],
    imports: [
        HammerModule,
        BrowserModule,
        HttpClientModule,
        AngularMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        AuthModule,
        SharedModule,
        CustomerModule,
        StateModule,
        ReactiveFormsModule,
        NgApexchartsModule,
        FormsModule,
        NgxChartsModule,
        NgxDaterangepickerMd.forRoot(),
    ],
    providers: [
        BaseHttpService,
        authInterceptorProviders,
        {provide: MatPaginatorIntl, useFactory: CustomPaginator, deps: [TranslateService]},
        {
            provide: LOCALE_ID,
            useValue: "en-GB",
        },
        {
            provide: MAT_DATE_LOCALE,
            useExisting: LOCALE_ID,
        },
        DatePipe,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
