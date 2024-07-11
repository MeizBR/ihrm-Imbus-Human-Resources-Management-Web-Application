import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';

import { CustomersComponent } from './customers.component';
import { CustomersListComponent } from './customers-list/customers-list.component';
import { AddCustomerComponent } from './components/add-customer/add-customer.component';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';
import { EditCustomerComponent } from './components/edit-customer/edit-customer.component';
import { AllCustomersComponent } from './components/all-customers/all-customers.component';
import { CustomersHeaderComponent } from './components/customers-header/customers-header.component';
import { AngularMaterialModule } from '../../../app/shared/angular-material/angular-material.module';

import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    CustomersComponent,
    AddCustomerComponent,
    CustomersListComponent,
    CustomerDetailsComponent,
    CustomersHeaderComponent,
    EditCustomerComponent,
    AllCustomersComponent,
  ],
  imports: [CommonModule, SharedModule, AngularMaterialModule, RouterModule, TranslateModule],
})
export class CustomerModule {}
