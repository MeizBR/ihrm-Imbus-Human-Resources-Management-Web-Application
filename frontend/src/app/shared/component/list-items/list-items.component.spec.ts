import { SimpleChange } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { RoleModel } from '../../enum/role-model.enum';
import { ListItemsComponent } from './list-items.component';
import { CustomerDetails, ProjectDetails, UserDetails } from '../../models';
import { AngularMaterialModule } from '../../angular-material/angular-material.module';

describe('ListItemsComponent', () => {
  type DataType = UserDetails | ProjectDetails | CustomerDetails;
  let component: ListItemsComponent<DataType>;
  let fixture: ComponentFixture<ListItemsComponent<DataType>>;
  let matTable: MatTable<DataType>;
  let matPaginator: MatPaginator;
  let mockList: MatTableDataSource<DataType> = new MatTableDataSource<DataType>([]);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AngularMaterialModule, MatSortModule, TranslateModule.forRoot(), BrowserAnimationsModule, RouterTestingModule, HttpClientModule, FormsModule],
      declarations: [ListItemsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListItemsComponent) as ComponentFixture<ListItemsComponent<DataType>>;
    component = fixture.componentInstance;
    component.searchKey = '';
    component.sort = new MatSort();
    component.paginator = matPaginator;
    component.displayDeleteButton = true;
    component.displayEditButton = true;
    component.list.sort = component.sort;
    component.list.paginator = component.paginator;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the search division correctly', () => {
    const searchDiv = fixture.debugElement.query(By.css('.search-div'));
    expect(searchDiv).toBeTruthy();

    const searchFormField = fixture.debugElement.query(By.css('.search-form-field'));
    expect(searchFormField).toBeTruthy();

    const searchInput = fixture.debugElement.query(By.css('.search-form-field input'));
    expect(searchInput).toBeTruthy();
    expect(searchInput.properties.placeholder).toEqual('SEARCH');
    expect(searchInput.nativeElement.value).toEqual('');

    let searchButton = fixture.debugElement.query(By.css('.search-form-field button'));
    expect(searchButton).toBeFalsy();

    searchInput.nativeElement.value = 'abc';
    searchInput.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(searchInput.nativeElement.value).toEqual('abc');
    expect(component.searchKey).toEqual('abc');

    searchButton = fixture.debugElement.query(By.css('.search-form-field button'));
    const searchButtonIcon = fixture.debugElement.query(By.css('.search-form-field button mat-icon'));
    expect(searchButton).toBeTruthy();
    expect(searchButtonIcon).toBeTruthy();
    expect(searchButtonIcon.nativeElement.textContent).toEqual('close');
  });

  it('should handle the search actions correctly', () => {
    const searchInput = fixture.debugElement.query(By.css('.search-form-field input'));

    component.searchKey = 'abc';
    searchInput.nativeElement.value = 'abc';
    searchInput.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const searchButton = fixture.debugElement.query(By.css('.search-form-field button'));
    const spyOnApplyFilter = spyOn(component, 'applyFilter').and.callThrough();
    const spyOnSearchClear = spyOn(component, 'onSearchClear').and.callThrough();

    expect(searchButton).toBeTruthy();
    searchInput.triggerEventHandler('keyup', null);
    fixture.detectChanges();
    expect(spyOnApplyFilter).toHaveBeenCalled();

    searchButton.nativeElement.click();
    fixture.detectChanges();
    expect(spyOnSearchClear).toHaveBeenCalled();
    expect(spyOnApplyFilter).toHaveBeenCalled();
    expect(component.searchKey).toEqual('');
  });

  describe('Users table', () => {
    beforeEach(() => {
      component.columns = [
        { matColumnDef: 'user', headerName: 'user', attribute: 'user' },
        { matColumnDef: 'login', headerName: 'login', attribute: 'login' },
        { matColumnDef: 'email', headerName: 'email', attribute: 'email' },
        { matColumnDef: 'registrationNumber', headerName: 'registration number', attribute: 'registrationNumber' },
        { matColumnDef: 'active', headerName: 'active', attribute: 'active' },
      ];
      component.displayedColumns = ['user', 'login', 'email', 'registrationNumber', 'active', 'actions'];
      mockList = new MatTableDataSource([
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          login: 'john.doe',
          email: 'john.doe@gmail.com',
          note: 'the user note',
          registrationNumber: 1,
          isActive: true,
          fullName: 'John Doe',
          globalRoles: [RoleModel.Administrator],
          userPermissions: {
            canEdit: true,
            seeRoles: false,
            canDelete: true,
          },
        },
        {
          id: 2,
          firstName: 'Jackie',
          lastName: 'Joe',
          login: 'jackie.joe',
          email: 'jackie.joe@gmail.com',
          note: 'the user note',
          registrationNumber: 2,
          isActive: false,
          fullName: 'Jackie Joe',
          globalRoles: [RoleModel.AccountManager],
          userPermissions: {
            canEdit: false,
            seeRoles: false,
            canDelete: false,
          },
        },
      ]);
      component.ngOnChanges({ list: new SimpleChange(mockList, undefined, true) });
      component.list = mockList;
      fixture.detectChanges();
    });

    it('should display the correct table data according to data type', async(() => {
      matTable = fixture.debugElement.query(By.css('mat-table')).componentInstance;
      expect(matTable).toBeTruthy();
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(matTable.dataSource).toBeDefined();
        expect(matTable.dataSource).toEqual(mockList);
      });
    }));

    it('should display the correct columns of table list', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const matTableColumns = fixture.debugElement.nativeElement.querySelectorAll('.mat-header-cell');
        expect(matTableColumns).toBeDefined();
        expect(matTableColumns.length).toBe(6);
        expect(matTableColumns[0].textContent).toBe('user');
        expect(matTableColumns[1].textContent).toBe('login');
        expect(matTableColumns[2].textContent).toBe('email');
        expect(matTableColumns[3].textContent).toBe('registration number');
        expect(matTableColumns[4].textContent).toBe('active');
        expect(matTableColumns[5].textContent).toBe('');
      });
    }));

    it('should display the correct rows of table list', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        matTable = fixture.debugElement.query(By.css('mat-table')).componentInstance;
        const matTableRows = matTable._contentColumnDefs.toArray();
        expect(matTableRows.length).toEqual(7);
        expect(matTableRows[0].name).toBe('user');
        expect(matTableRows[1].name).toBe('login');
        expect(matTableRows[2].name).toBe('email');
        expect(matTableRows[3].name).toBe('registrationNumber');
        expect(matTableRows[4].name).toBe('active');
        expect(matTableRows[5].name).toBe('actions');
        expect(matTableRows[6].name).toBe('noData');

        const matTableCell = fixture.debugElement.queryAll(By.css('mat-cell'));
        expect(matTableCell.length).toEqual(12);
        expect(matTableCell[0].nativeElement.textContent).toEqual('John Doe');
        expect(matTableCell[1].nativeElement.textContent).toEqual('john.doe');
        expect(matTableCell[2].nativeElement.textContent).toEqual('john.doe@gmail.com');
        expect(matTableCell[3].nativeElement.textContent).toEqual('1');
        expect(matTableCell[4].nativeElement.textContent).toEqual('done');
        expect(matTableCell[6].nativeElement.textContent).toEqual('Jackie Joe');
        expect(matTableCell[7].nativeElement.textContent).toEqual('jackie.joe');
        expect(matTableCell[8].nativeElement.textContent).toEqual('jackie.joe@gmail.com');
        expect(matTableCell[9].nativeElement.textContent).toEqual('2');
        expect(matTableCell[10].nativeElement.textContent).toEqual('clear');
      });
    }));

    it('should handle form actions correctly', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const spyDeleteAction = spyOn(component.deleteAction, 'emit').and.callThrough();
        const spyEditAction = spyOn(component.editAction, 'emit').and.callThrough();
        const firstDeleteButton = fixture.debugElement.queryAll(By.css('mat-cell'))[5].children[0];
        expect(firstDeleteButton.nativeElement.disabled).toEqual(false);

        firstDeleteButton.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(spyDeleteAction).toHaveBeenCalledWith(1);

        const firstEditButton = fixture.debugElement.queryAll(By.css('mat-cell'))[5].children[1];
        expect(firstEditButton.nativeElement.disabled).toEqual(false);

        firstEditButton.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(spyEditAction).toHaveBeenCalled();

        const secondDeleteButton = fixture.debugElement.queryAll(By.css('mat-cell'))[11].children[0];
        expect(secondDeleteButton.nativeElement.disabled).toEqual(true);

        const secondEditButton = fixture.debugElement.queryAll(By.css('mat-cell'))[11].children[1];
        expect(secondEditButton.nativeElement.disabled).toEqual(true);
      });
    }));
  });

  describe('Projects table', () => {
    beforeEach(() => {
      component.columns = [
        { matColumnDef: 'name', headerName: 'name', attribute: 'name' },
        { matColumnDef: 'customer', headerName: 'customer', attribute: 'customer' },
        { matColumnDef: 'active', headerName: 'active', attribute: 'active' },
      ];
      component.displayedColumns = ['name', 'customer', 'active', 'actions'];
      mockList = new MatTableDataSource([
        {
          id: 1,
          customerId: 1,
          customer: 'Customer N°1',
          isActiveCustomer: true,
          name: 'Project A1',
          description: 'Description of Project A1',
          isActive: true,
          userRoles: [RoleModel.Lead, RoleModel.Supervisor],
          userPermissions: {
            canEdit: true,
            seeRoles: true,
            canDelete: true,
            canEditRole: true,
          },
        },
        {
          id: 2,
          customerId: 2,
          customer: 'Customer N°2',
          isActiveCustomer: false,
          name: 'Project A2',
          description: 'Description of Project A2',
          isActive: true,
          userRoles: [RoleModel.Supervisor],
          userPermissions: {
            canEdit: true,
            seeRoles: true,
            canDelete: false,
            canEditRole: false,
          },
        },
      ]);
      component.ngOnChanges({ list: new SimpleChange(mockList, undefined, true) });
      component.list = mockList;
      fixture.detectChanges();
    });

    it('should display the correct table data according to data type', async(() => {
      matTable = fixture.debugElement.query(By.css('mat-table')).componentInstance;
      expect(matTable).toBeTruthy();
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(matTable.dataSource).toBeDefined();
        expect(matTable.dataSource).toEqual(mockList);
      });
    }));

    it('should display the correct columns of table list', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const matTableColumns = fixture.debugElement.nativeElement.querySelectorAll('.mat-header-cell');
        expect(matTableColumns).toBeDefined();
        expect(matTableColumns.length).toBe(4);
        expect(matTableColumns[0].textContent).toBe('name');
        expect(matTableColumns[1].textContent).toBe('customer');
        expect(matTableColumns[2].textContent).toBe('active');
        expect(matTableColumns[3].textContent).toBe('');
      });
    }));

    it('should display the correct rows of table list', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        matTable = fixture.debugElement.query(By.css('mat-table')).componentInstance;
        const matTableRows = matTable._contentColumnDefs.toArray();
        expect(matTableRows.length).toEqual(5);
        expect(matTableRows[0].name).toBe('name');
        expect(matTableRows[1].name).toBe('customer');
        expect(matTableRows[2].name).toBe('active');
        expect(matTableRows[3].name).toBe('actions');
        expect(matTableRows[4].name).toBe('noData');

        const matTableCell = fixture.debugElement.queryAll(By.css('mat-cell'));
        expect(matTableCell.length).toEqual(8);
        expect(matTableCell[0].nativeElement.textContent).toEqual('Project A1');
        expect(matTableCell[0].children.length).toEqual(1); // FIXME:  check that the component app-item-status exist
        expect(matTableCell[5].children[0].nativeElement.tagName).toEqual('APP-ITEM-STATUS');
        expect(matTableCell[2].nativeElement.textContent).toEqual('done');
        expect(matTableCell[4].nativeElement.textContent).toEqual('Project A2');
        expect(matTableCell[5].children.length).toEqual(1); // FIXME:  check that the component app-item-status exist
        expect(matTableCell[5].children[0].nativeElement.tagName).toEqual('APP-ITEM-STATUS');
        expect(matTableCell[6].nativeElement.textContent).toEqual('done');
      });
    }));

    it('should handle form actions correctly', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const spyDeleteAction = spyOn(component.deleteAction, 'emit').and.callThrough();
        const spyEditAction = spyOn(component.editAction, 'emit').and.callThrough();
        const firstDeleteButton = fixture.debugElement.queryAll(By.css('mat-cell'))[3].children[0];
        expect(firstDeleteButton.nativeElement.disabled).toEqual(false);

        firstDeleteButton.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(spyDeleteAction).toHaveBeenCalledWith(1);

        const firstEditButton = fixture.debugElement.queryAll(By.css('mat-cell'))[3].children[1];
        expect(firstEditButton.nativeElement.disabled).toEqual(false);

        firstEditButton.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(spyEditAction).toHaveBeenCalled();

        const secondDeleteButton = fixture.debugElement.queryAll(By.css('mat-cell'))[7].children[0];
        expect(secondDeleteButton.nativeElement.disabled).toEqual(true);

        const secondEditButton = fixture.debugElement.queryAll(By.css('mat-cell'))[7].children[1];
        expect(secondEditButton.nativeElement.disabled).toEqual(false);

        secondEditButton.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(spyEditAction).toHaveBeenCalled();
      });
    }));
  });

  describe('Customers table', () => {
    beforeEach(() => {
      component.columns = [
        { matColumnDef: 'name', headerName: 'CUSTOMERS_VIEW.CUSTOMER_LIST.NAME', attribute: 'name' },
        { matColumnDef: 'active', headerName: 'CUSTOMERS_VIEW.CUSTOMER_LIST.ACTIVE', attribute: 'active' },
      ];
      component.displayedColumns = ['name', 'active', 'actions'];
      mockList = new MatTableDataSource([
        {
          id: 1,
          name: 'Customer N°1',
          description: 'the description of Customer N°1',
          isActive: true,
          userPermissions: {
            canEdit: true,
            seeRoles: true,
            canDelete: true,
          },
        },
        {
          id: 2,
          name: 'Customer N°2',
          description: 'the description of Customer N°2',
          isActive: false,
          userPermissions: {
            canEdit: false,
            seeRoles: false,
            canDelete: false,
          },
        },
      ]);

      component.ngOnChanges({ list: new SimpleChange(mockList, undefined, true) });
      component.list = mockList;
      fixture.detectChanges();
    });

    it('should display the correct table data according to data type', async(() => {
      matTable = fixture.debugElement.query(By.css('mat-table')).componentInstance;
      expect(matTable).toBeTruthy();
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(matTable.dataSource).toBeDefined();
        expect(matTable.dataSource).toEqual(mockList);
      });
    }));

    it('should display the correct columns of table list', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const matTableColumns = fixture.debugElement.nativeElement.querySelectorAll('.mat-header-cell');
        expect(matTableColumns).toBeDefined();
        expect(matTableColumns.length).toBe(3);
        expect(matTableColumns[0].textContent).toBe('CUSTOMERS_VIEW.CUSTOMER_LIST.NAME');
        expect(matTableColumns[1].textContent).toBe('CUSTOMERS_VIEW.CUSTOMER_LIST.ACTIVE');
        expect(matTableColumns[2].textContent).toBe('');
      });
    }));

    it('should display the correct rows of table list', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        matTable = fixture.debugElement.query(By.css('mat-table')).componentInstance;
        const matTableRows = matTable._contentColumnDefs.toArray();
        expect(matTableRows.length).toEqual(4);
        expect(matTableRows[0].name).toBe('name');
        expect(matTableRows[1].name).toBe('active');
        expect(matTableRows[2].name).toBe('actions');
        expect(matTableRows[3].name).toBe('noData');

        const matTableCell = fixture.debugElement.queryAll(By.css('mat-cell'));
        expect(matTableCell.length).toEqual(6);
        expect(matTableCell[0].nativeElement.textContent).toEqual('Customer N°1');
        expect(matTableCell[1].nativeElement.textContent).toEqual('done');
        expect(matTableCell[3].nativeElement.textContent).toEqual('Customer N°2');
        expect(matTableCell[4].nativeElement.textContent).toEqual('clear');
      });
    }));

    it('should handle form actions correctly', async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        const spyDeleteAction = spyOn(component.deleteAction, 'emit').and.callThrough();
        const spyEditAction = spyOn(component.editAction, 'emit').and.callThrough();
        const customer1DeleteButton = fixture.debugElement.queryAll(By.css('mat-cell'))[2].children[0];
        expect(customer1DeleteButton.nativeElement.disabled).toEqual(false);

        customer1DeleteButton.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(spyDeleteAction).toHaveBeenCalledWith(1);

        const customer1EditButton = fixture.debugElement.queryAll(By.css('mat-cell'))[2].children[1];
        expect(customer1EditButton.nativeElement.disabled).toEqual(false);

        customer1EditButton.triggerEventHandler('click', null);
        fixture.detectChanges();
        expect(spyEditAction).toHaveBeenCalled();

        const customer2DeleteButton = fixture.debugElement.queryAll(By.css('mat-cell'))[5].children[0];
        expect(customer2DeleteButton.nativeElement.disabled).toEqual(true);

        const customer2EditButton = fixture.debugElement.queryAll(By.css('mat-cell'))[5].children[1];
        expect(customer2EditButton.nativeElement.disabled).toEqual(true);
      });
    }));
  });

  it('should display paginator correctly', () => {
    matPaginator = fixture.debugElement.query(By.css('mat-paginator')).componentInstance;

    expect(matPaginator.pageSize).toEqual(5);
    expect(matPaginator.pageSizeOptions.length).toEqual(4);
    expect(matPaginator.pageSizeOptions).toEqual([5, 10, 25, 100]);
  });
});
