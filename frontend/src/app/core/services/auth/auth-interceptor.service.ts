import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { select, Store } from '@ngrx/store';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AppState } from '../../reducers';
import { selectUserSession } from '../../reducers/auth';
import { loadUserFromLocalStorage, removeItems } from '../../reducers/auth/auth.helper';

import { RouteSegment } from '../../../shared/enum/route-segment.enum';

const TOKEN_HEADER_KEY = 'Authorization';
@Injectable({
  providedIn: 'root',
})
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private router: Router, private store: Store<AppState>) {}

  intercept<T>(req: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
    let authReq = req;

    this.store.pipe(select(selectUserSession)).subscribe(userSession => {
      authReq = userSession
        ? req.clone({ headers: req.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + userSession.token) })
        : req.clone({ headers: req.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + loadUserFromLocalStorage()?.token) });
    });

    return next.handle(authReq).pipe(
      tap(
        () => {},
        (err: Error) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401 || err.status === 504) {
              removeItems();
              this.router.navigate([RouteSegment.Login]);

              // this.store.dispatch(authActions.logoutSuccessAction());
            }
          }
        },
      ),
    );
  }
}

export const authInterceptorProviders = [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true }];
