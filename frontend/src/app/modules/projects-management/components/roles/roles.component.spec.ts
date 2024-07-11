import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { reducers } from '../../../../core/reducers';

import { RolesComponent } from './roles.component';
import { ProjectDetailedPermissions, Roles } from '../../../../shared/models';
import { NoItemsComponent } from '../../../../shared/component/no-items/no-items.component';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('RolesComponent', () => {
  let component: RolesComponent;
  let fixture: ComponentFixture<RolesComponent>;
  let rolesTable: MatTable<Roles>;
  let matPaginator: MatPaginator;
  const projectDetails: ProjectDetailedPermissions = {
    id: 1,
    customerId: 1,
    customer: 'Customer 1',
    name: 'Project A1',
    description: 'The description of Project A1',
    note: '',
    isActive: false,
    userRoles: ['Administrator'],
    userPermissions: {
      canEdit: true,
      seeRoles: true,
      canDelete: true,
      canEditRole: true,
    },
  };
  const rolesColumns = [
    { matColumnDef: 'user', headerName: 'user', attribute: 'user' },
    { matColumnDef: 'roles', headerName: 'roles', attribute: 'roles' },
  ];
  const roles: Roles[] = [
    {
      user: { id: 1, name: 'user 1', isActive: true },
      roles: ['lead'],
    },
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RolesComponent, NoItemsComponent],
      imports: [
        StoreModule.forRoot(reducers, {
          runtimeChecks: {
            strictStateImmutability: true,
            strictActionImmutability: true,
          },
        }),
        AngularMaterialModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RolesComponent);
    component = fixture.componentInstance;
    component.projectDetails = projectDetails;
    component.displayedColumns = ['user', 'roles', 'actions'];
    component.columns = rolesColumns;
    component.list = new MatTableDataSource(roles);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the card header correctly', () => {
    const cardHeaderText = fixture.debugElement.query(By.css('.header-text'));

    expect(cardHeaderText).toBeTruthy();
    expect(cardHeaderText.nativeElement.childElementCount).toEqual(1);

    const cardTitle = fixture.debugElement.query(By.css('.title'));
    expect(cardTitle).toBeTruthy();
    expect(cardTitle.nativeElement.textContent).toEqual('PROJECTS_VIEW.ROLES.PROJECT_ROLES');

    let lockDiv = fixture.debugElement.query(By.css('.lock-div'));
    expect(lockDiv).toBeFalsy();

    component.projectDetails = { ...projectDetails, userPermissions: { ...projectDetails.userPermissions, canEditRole: false } };
    fixture.detectChanges();

    expect(cardHeaderText.nativeElement.childElementCount).toEqual(2);
    lockDiv = fixture.debugElement.query(By.css('.lock-div'));
    expect(lockDiv).toBeTruthy();

    const lockIcon = fixture.debugElement.query(By.css('.lock-div mat-icon'));
    expect(lockIcon).toBeTruthy();
    expect(lockIcon.nativeElement.textContent).toEqual('lock');
  });

  it('should display the correct role data', () => {
    const title = fixture.debugElement.query(By.css('.project-roles .card-content .project-roles-container .header .project-name '));
    expect(title).toBeTruthy();
    expect(title.nativeElement.textContent).toEqual('Project A1');
  });

  it('should display the correct role table elements', () => {
    rolesTable = fixture.debugElement.query(By.css('mat-table')).componentInstance;

    expect(rolesTable).toBeTruthy();

    const headerRowDef = rolesTable._contentHeaderRowDefs.toArray();
    expect(headerRowDef).toBeTruthy();
    expect(headerRowDef.length).toEqual(1);
    expect(headerRowDef[0].columns[0]).toEqual('user');
    expect(headerRowDef[0].columns[1]).toEqual('roles');
    expect(headerRowDef[0].columns[2]).toEqual('actions');

    const rolesTableHeaderCells = fixture.debugElement.queryAll(By.css('mat-header-cell'));
    expect(rolesTableHeaderCells.length).toEqual(3);
    expect(rolesTableHeaderCells[0].nativeElement.innerText).toEqual('PROJECTS_VIEW.ROLES.USER');
    expect(rolesTableHeaderCells[1].nativeElement.innerText).toEqual('PROJECTS_VIEW.ROLES.ROLE');
    expect(rolesTableHeaderCells[2].nativeElement.innerText).toEqual('');

    const rolesTableRowCells = fixture.debugElement.queryAll(By.css('mat-cell'));
    expect(rolesTableRowCells.length).toEqual(3);
    expect(rolesTableRowCells[0].nativeElement.innerText).toEqual('user 1');
    expect(rolesTableRowCells[1].nativeElement.innerText).toEqual('lead');
    expect(rolesTableRowCells[2].nativeElement.innerText).toEqual('');
    fixture.detectChanges();
  });

  it('Should display the paginator with correct data', () => {
    matPaginator = fixture.debugElement.query(By.css('mat-paginator')).componentInstance;

    expect(matPaginator).toBeTruthy();
    expect(matPaginator.pageSize).toEqual(7);
    fixture.detectChanges();
  });
});
