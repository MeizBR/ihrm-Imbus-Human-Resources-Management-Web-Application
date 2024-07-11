import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppState } from '../../reducers';
import { selectUserSession, selectUserWorkspaceId } from './../../reducers/auth/index';

import { BaseHttpService } from './../base-http.service';

import { Customer } from '../../../generated/customer';
import { PostCustomer } from '../../../generated/postCustomer';
import { PatchCustomer } from '../../../generated/patchCustomer';

import { CustomerDetails, mapCustomerToCustomerDetails } from '../../../shared/models/';
import { UserSession } from 'src/app/generated/userSession';

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  private workspaceId: number;
  private userSession: UserSession;
  private customersPath: string;

  constructor(private baseHttp: BaseHttpService, private store: Store<AppState>) {
    this.store.pipe(select(selectUserSession)).subscribe((userSession: UserSession) => {
      this.userSession = userSession;
    })

    this.store.pipe(select(selectUserWorkspaceId)).subscribe(workspaceId => {
      this.workspaceId = workspaceId;
      this.customersPath = `/workspaces/${workspaceId}/customers`;
    });
  }

  public getCustomers(): Observable<CustomerDetails[]> {
    const queryParam = {};
    const userId = JSON.parse(localStorage.getItem('USER_SESSION')).userId;
    const workspaceId = JSON.parse(localStorage.getItem('USER_SESSION')).workspaceId;
    queryParam['userId'] = userId;

    return this.baseHttp.get<Customer[]>(`/workspaces/${workspaceId}/customers`).pipe(map((data: Customer[]) => data.map(customer => mapCustomerToCustomerDetails(customer))));
  }

  public postCustomers(customer: PostCustomer): Observable<CustomerDetails> {
    return this.baseHttp
      .post<Customer>(this.customersPath, { payload: customer })
      .pipe(map((data: Customer) => mapCustomerToCustomerDetails(data)));
  }

  public patchCustomers(customer: PatchCustomer, id: number): Observable<CustomerDetails> {
    return this.baseHttp
      .patch<Customer>(this.customersPath, { payload: customer, urlParams: id + '' })
      .pipe(map((data: Customer) => mapCustomerToCustomerDetails(data)));
  }

  public deleteCustomers(id: number): Observable<string> {
    return this.baseHttp.delete<string>(this.customersPath, { urlParams: id + '' });
  }
}
