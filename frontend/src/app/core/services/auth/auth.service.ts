import { Injectable } from '@angular/core';

import { Observable, throwError } from 'rxjs';
import { catchError, map, mapTo } from 'rxjs/operators';

import { BaseHttpService } from '../base-http.service';

import { PostUserSession, UserSession } from '../../../generated/models';

import { mapToUserSessionDetails, UserSessionDetails } from '../../../shared/models/user-models/user-session-data';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly ADMIN_AUTH_WORKSPACE = '/workspaces';
  private readonly ADMIN_AUTH_SESSION = '/session';

  constructor(private baseHttp: BaseHttpService) {}

  public login(user: PostUserSession): Observable<UserSessionDetails> {
    return this.baseHttp
      .post<UserSession>(`${this.ADMIN_AUTH_WORKSPACE}${this.ADMIN_AUTH_SESSION}`, { payload: user })
      .pipe(
        map((userSession: UserSession) => mapToUserSessionDetails(userSession)),
        catchError(error => throwError(error)),
      );
  }

  public getCurrentSession(workspaceId: number): Observable<UserSessionDetails> {
    return this.baseHttp
      .get<UserSession>(`${this.ADMIN_AUTH_WORKSPACE}/${workspaceId}${this.ADMIN_AUTH_SESSION}`)
      .pipe(map((userSession: UserSession) => mapToUserSessionDetails(userSession)));
  }

  public logout(session: UserSessionDetails): Observable<boolean> {
    return this.baseHttp.delete(`${this.ADMIN_AUTH_WORKSPACE}/${session.workspaceId}${this.ADMIN_AUTH_SESSION}`, {}).pipe(
      mapTo(true),
      catchError(error => throwError(error)),
    );
  }
}
