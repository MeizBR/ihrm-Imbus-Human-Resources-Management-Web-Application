import { ActivatedRoute } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { map } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';

import { select, Store } from '@ngrx/store';

import * as lodash from 'lodash';

import { AppState } from '../../../../core/reducers';
import { isAdminGlobalRole } from '../../../../core/reducers/auth/index';
import { mappedActiveUsersList } from '../../../../core/reducers/user/index';
import { projectActions } from '../../../../core/reducers/project/project.actions';
import { getDetailedProjectsList, selectAllProjectRolesList } from '../../../../core/reducers/project';

import { _filterRoles, _filterUsers, displayedRolesColumns, rolesColumns } from './roles-helper';

import { RoleSegment } from '../../../../shared/enum/role.enum';
import { Column, ProjectDetailedPermissions, Roles, SelectBoxItems, SelectBoxType, UserDetails } from '../../../../shared/models/index';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('roleInput') roleInput: ElementRef<HTMLInputElement>;
  @ViewChild(MatSort) set matSort(sort: MatSort) {
    if (this.list) {
      this.list.sort = sort;
    }
  }
  @ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) {
    if (this.list) {
      this.list.paginator = paginator;
    }
  }
  @Input() selectedProjectId: number; // FIXME: selectedProjectId is here why is extracted form url line 90
  @Output() emittedUsersToSelect = new EventEmitter<SelectBoxItems[]>();

  private allUsers: SelectBoxItems[] = [];
  private subscriptions$: Subscription[] = [];
  private selectedValue$: BehaviorSubject<RoleSegment[] | SelectBoxItems[]> = new BehaviorSubject([]);
  private selectItems: SelectBoxType = {
    projects: [], // FIXME: this attribute not used
    users: [],
    roles: [
      { id: RoleSegment.lead, name: RoleSegment.lead },
      { id: RoleSegment.supervisor, name: RoleSegment.supervisor },
      { id: RoleSegment.member, name: RoleSegment.member },
    ],
  };

  public roles: string[];
  public form: FormGroup;
  public canEditRole = false;
  public showAddRoleDiv = false;
  public isAdministrator: boolean;
  public RoleSegment = RoleSegment;
  public roleCtrl = new FormControl();
  public columns: Column[] = rolesColumns;
  public filteredRoles$: Observable<string[]>;
  public usersToSelect: SelectBoxItems[] = [];
  public displayedColumns = displayedRolesColumns;
  public projectDetails: ProjectDetailedPermissions;
  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public list: MatTableDataSource<Roles> = new MatTableDataSource([]);

  constructor(private store: Store<AppState>, public dialog: MatDialog, private route: ActivatedRoute) {
    // FIXME: Refats needed here (lot of code needs to be reduced and some of the treatment should be done in the redux)
    this.subscriptions$.push(
      combineLatest([
        this.route.params,
        this.store.pipe(select(mappedActiveUsersList)),
        this.store.pipe(select(getDetailedProjectsList)),
        this.store.pipe(select(selectAllProjectRolesList)),
      ]).subscribe(([projectId, users, projects, roles]) => {
        this.allUsers = [];
        this.list = new MatTableDataSource(roles?.data);
        this.selectItems.users = users?.map((user: UserDetails) => ({ id: user.id, name: user.fullName, isActive: user.isActive }));
        this.projectDetails = projects?.find(project => project.id === +projectId.projectId);
        this.canEditRole = this.projectDetails?.userPermissions.canEditRole;
        roles?.data.forEach((element: Roles) => this.allUsers.push(element.user));
        // FIXME: This users list treatment should be in the parent component
        // FIXME: (fil component hedha 9a3ed nfelter fil list bte3 l users elli yatl3ou fil set role ==> handlinh lezem ykoun fil project details mich houni)
        this.usersToSelect = lodash.differenceWith(this.selectItems.users, this.allUsers, lodash.isEqual);
        this.emittedUsersToSelect.emit(this.usersToSelect);
      }),
      this.store.pipe(select(isAdminGlobalRole)).subscribe((isAdmin: boolean) => (this.isAdministrator = isAdmin)),
    );
    this.roles = this.selectItems?.roles.map((role: SelectBoxItems) => role.name);
  }

  ngOnInit(): void {
    this.filteredRoles$ = combineLatest([this.selectedValue$]).pipe(
      map(([selectedRoles]: [RoleSegment[]]) => {
        return lodash.difference(this.roles, selectedRoles);
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions$.map(subscription => subscription.unsubscribe);
  }

  // NOTE: need improvement
  public opened(selectedValue?: RoleSegment[]): void {
    if (selectedValue) {
      this.selectedValue$.next(selectedValue);
    }
  }

  public removeRole(roles: Roles, role: RoleSegment): void {
    const index = roles?.roles?.findIndex((element: string) => element === role);
    if (index >= 0) {
      this.store.dispatch(
        projectActions.UpdateProjectRolesAction({
          projectId: this.projectDetails?.id,
          userRole: { ...roles, roles: roles?.roles?.filter((item: string) => item !== role) },
          deletion: false,
        }),
      );
    }
  }

  public selectedRole(event: MatAutocompleteSelectedEvent, roles?: Roles): void {
    this.list.data = this.list.data?.map((role: Roles) => (role = lodash.isEqual(role, roles) ? { ...role, roles: [...role.roles, event.option.value] } : { ...role }));
    if (!!roles.user) {
      this.store.dispatch(
        projectActions.UpdateProjectRolesAction({
          projectId: this.projectDetails?.id,
          userRole: { ...roles, roles: [...roles.roles, event.option.value] },
          deletion: false,
        }),
      );
    }
    this.roleInput.nativeElement.value = '';
    this.roleCtrl.setValue(null);
  }

  public removeUserRole(row: Roles): void {
    if (row.roles.includes('Lead') && !this.isAdministrator) {
      this.store.dispatch(
        projectActions.UpdateProjectRolesAction({
          projectId: this.projectDetails?.id,
          userRole: { user: row.user, roles: row.roles.filter((item: string) => item === 'Lead') },
          deletion: true,
        }),
      );
    } else {
      this.store.dispatch(projectActions.DeleteProjectRolesAction({ projectId: this.projectDetails?.id, userRole: { user: row.user, roles: [] } }));
    }
  }
}
