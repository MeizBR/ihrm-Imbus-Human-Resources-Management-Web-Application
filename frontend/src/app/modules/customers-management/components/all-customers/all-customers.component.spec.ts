import { SimpleChange } from '@angular/core';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';

import { AllCustomersComponent } from './all-customers.component';
import { CustomerDetailedPermissions } from '../../../../shared/models/customer-models/customer-models-index';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('AllCustomersComponent', () => {
  let component: AllCustomersComponent;
  let fixture: ComponentFixture<AllCustomersComponent>;
  const customers: CustomerDetailedPermissions[] = [
    {
      id: 1,
      name: 'Customer N°1',
      description: 'Description of Customer N°1',
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
      description: 'Description of Customer N°2',
      isActive: false,
      userPermissions: {
        canEdit: true,
        seeRoles: true,
        canDelete: true,
      },
    },
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AllCustomersComponent],
      imports: [AngularMaterialModule, BrowserAnimationsModule, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the initial static component DOM, header and content details correctly', () => {
    const allCustomersCardCard = fixture.debugElement.query(By.css('.all-customers-card'));
    expect(allCustomersCardCard).toBeTruthy();
    expect(allCustomersCardCard.nativeElement.childElementCount).toEqual(2);

    const allCustomersCardHeaderText = fixture.debugElement.query(By.css('.all-customers-card-header-text'));
    expect(allCustomersCardHeaderText).toBeTruthy();
    expect(allCustomersCardHeaderText.nativeElement.childElementCount).toEqual(1);

    const allCustomersCardTitle = fixture.debugElement.query(By.css('.all-customers-card-title'));
    expect(allCustomersCardTitle).toBeTruthy();
    expect(allCustomersCardTitle.nativeElement.textContent).toEqual('CUSTOMERS_VIEW.EDIT_CUSTOMER.Customers_LIST.ALL_Customers');

    const customersCardContent = fixture.debugElement.query(By.css('.all-customers-card-content'));
    expect(customersCardContent).toBeTruthy();
    const allCustomers = fixture.debugElement.query(By.css('.customer-details-content'));
    const customersAvatars = fixture.debugElement.query(By.css('.customer-avatar'));
    const customersDetails = fixture.debugElement.query(By.css('.customer-details'));
    const customersInformation = fixture.debugElement.query(By.css('.customer-information'));

    expect(allCustomers).toBeFalsy();
    expect(customersAvatars).toBeFalsy();
    expect(customersDetails).toBeFalsy();
    expect(customersInformation).toBeFalsy();
  });

  it('should display the selected customer details correctly', () => {
    component.customers = customers;
    component.selectedCustomerId = 1;
    component.ngOnChanges({ customers: new SimpleChange(customers, undefined, true) });
    fixture.detectChanges();

    const customersCardContent = fixture.debugElement.query(By.css('.all-customers-card-content'));
    expect(customersCardContent).toBeTruthy();

    const allCustomers = fixture.debugElement.queryAll(By.css('.customer-details-content'));
    const customersAvatars = fixture.debugElement.queryAll(By.css('.customer-avatar'));
    const customersDetails = fixture.debugElement.queryAll(By.css('.customer-details'));
    const customersInformation = fixture.debugElement.queryAll(By.css('.customer-information'));

    expect(allCustomers.length).toEqual(component.splicedData.length);
    expect(customersAvatars.length).toEqual(component.splicedData.length);
    expect(customersDetails.length).toEqual(component.splicedData.length);
    expect(customersInformation.length).toEqual(component.splicedData.length);

    expect(customersInformation[0].nativeElement.textContent).toEqual('Customer N°1');
    expect(customersInformation[1].nativeElement.textContent).toEqual('Customer N°2');

    let customerCardContent = fixture.debugElement.queryAll(By.css('.customer-details-content'))[0];
    expect(customerCardContent).toBeTruthy();
    expect(customerCardContent.classes).toEqual({ selected: true, 'customer-details-content': true });
    expect(customerCardContent.nativeElement.childElementCount).toEqual(2);

    let selectedCustomerName = fixture.debugElement.query(By.css('.customer-details-content .customer-details .customer-information'));
    expect(selectedCustomerName).toBeTruthy();
    expect(selectedCustomerName.nativeElement.textContent).toEqual('Customer N°1');

    let isActiveIcon = fixture.debugElement.query(By.css('.customer-details-content .customer-details mat-icon'));
    expect(isActiveIcon).toBeTruthy();
    expect(isActiveIcon.nativeElement.textContent).toEqual('done');

    component.selectedCustomerId = 2;
    fixture.detectChanges();

    customerCardContent = fixture.debugElement.queryAll(By.css('.customer-details-content'))[1];
    expect(customerCardContent).toBeTruthy();
    expect(customerCardContent.classes).toEqual({ selected: true, 'customer-details-content': true });
    expect(customerCardContent.nativeElement.childElementCount).toEqual(2);

    selectedCustomerName = customerCardContent.query(By.css('.customer-details .customer-information'));
    expect(selectedCustomerName).toBeTruthy();
    expect(selectedCustomerName.nativeElement.textContent).toEqual('Customer N°2');

    isActiveIcon = fixture.debugElement.queryAll(By.css('.customer-details-content .customer-details mat-icon'))[0];
    expect(isActiveIcon).toBeTruthy();
    expect(isActiveIcon.nativeElement.textContent).toEqual('done');
  });
});
