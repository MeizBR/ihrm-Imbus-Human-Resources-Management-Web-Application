import { HttpHeaders, HttpParams } from '@angular/common/http';

export interface HttpRequestParams {
  urlParams?: string;
  queryParams?: string | { [key: string]: string | string[] };
  // tslint:disable-next-line:no-any
  payload?: any;
}

export interface HttpRequestOptions {
  // tslint:disable-next-line:no-any
  body?: any;
  headers?: HttpHeaders;
  params?: HttpParams;
  reportProgress?: boolean;
  withCredentials?: boolean;
}
