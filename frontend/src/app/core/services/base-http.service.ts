import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { CONFIGURATION_URL } from '../../config';

import { AppConfig, HttpRequestOptions, HttpRequestParams } from '../../shared/models/index';

export enum HttpRequestMethod {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Patch = 'PATCH',
  Delete = 'DELETE',
}

@Injectable({
  providedIn: 'root',
})
export class BaseHttpService {
  appConfig: AppConfig;

  constructor(private http: HttpClient) {
    this.load();
  }

  public load(): void {
    this.appConfig = CONFIGURATION_URL;
  }

  public urlParamsParser(url: string, param?: string): string {
    if (param) {
      url = `${url}/${param}`;
    }

    return url;
  }

  private request<T>(method: string, endPoint: string, options: HttpRequestOptions): Observable<T> {
    return this.http.request<T>(method, this.getRequestUrl(endPoint), {
      ...options,
      headers: this.getHeaders(),
    });
  }

  public queryParamsParser(queryParams: string | { [key: string]: string | string[] }): HttpParams | undefined {
    if (!queryParams) {
      return undefined;
    }

    return new HttpParams(typeof queryParams === 'string' ? { fromString: queryParams } : { fromObject: queryParams });
  }

  public getHeaders(): HttpHeaders {
    // tslint:disable-next-line: object-literal-key-quotes
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
      Accept: 'application/json; charset=utf-8',
    });

    return headers;
  }

  public getRequestUrl(endPoint: string): string {
    return `${this.appConfig.apiUrl}${endPoint}`;
  }

  public get<T>(endPoint: string, httpRequest?: HttpRequestParams): Observable<T> {
    return this.request<T>(HttpRequestMethod.Get, this.urlParamsParser(endPoint, httpRequest ? httpRequest.urlParams : undefined), {
      params: this.queryParamsParser((httpRequest && httpRequest.queryParams) || {}),
    });
  }

  public post<T>(endPoint: string, httpRequest?: HttpRequestParams): Observable<T> {
    return this.request<T>(HttpRequestMethod.Post, this.urlParamsParser(endPoint, httpRequest ? httpRequest.urlParams : undefined), {
      params: this.queryParamsParser((httpRequest && httpRequest.queryParams) || {}),
      body: httpRequest ? httpRequest.payload : undefined,
    });
  }

  public put<T>(endPoint: string, httpRequest?: HttpRequestParams): Observable<T> {
    return this.request<T>(HttpRequestMethod.Put, this.urlParamsParser(endPoint, httpRequest ? httpRequest.urlParams : undefined), {
      params: this.queryParamsParser((httpRequest && httpRequest.queryParams) || {}),
      body: httpRequest ? httpRequest.payload : undefined,
    });
  }

  public patch<T>(endPoint: string, httpRequest?: HttpRequestParams): Observable<T> {
    return this.request<T>(HttpRequestMethod.Patch, this.urlParamsParser(endPoint, httpRequest ? httpRequest.urlParams : undefined), {
      params: this.queryParamsParser((httpRequest && httpRequest.queryParams) || {}),
      body: httpRequest ? httpRequest.payload : undefined,
    });
  }

  public delete<T>(endPoint: string, httpRequest?: HttpRequestParams): Observable<T> {
    return this.request<T>(HttpRequestMethod.Delete, this.urlParamsParser(endPoint, httpRequest ? httpRequest.urlParams : undefined), {
      params: this.queryParamsParser((httpRequest && httpRequest.queryParams) || {}),
      body: httpRequest ? httpRequest.payload : undefined,
    });
  }
}
