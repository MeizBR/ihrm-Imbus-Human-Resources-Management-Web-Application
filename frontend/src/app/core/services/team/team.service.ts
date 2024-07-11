import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppState } from '../../reducers';
import { selectUserSession, selectUserWorkspaceId } from '../../reducers/auth';

import { BaseHttpService } from '../base-http.service';

import { User } from '../../../generated/user';
import { PostUser } from '../../../generated/postUser';
import { UserSession } from '../../../generated/models';
import { PatchUser } from '../../../generated/patchUser';

import { RoleModel } from '../../../shared/enum/role-model.enum';
import { mapUserToUserDetails, UserDetails } from '../../../shared/models/index';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private teamPath: string;
  private userSession: UserSession;

  constructor(private baseHttp: BaseHttpService, private store: Store<AppState>) {
    this.store.pipe(select(selectUserSession)).subscribe((userSession: UserSession) => 
    (this.userSession = userSession));

    this.store.pipe(select(selectUserWorkspaceId)).subscribe(workspaceId => {
      this.teamPath = `/workspaces/${workspaceId}/users`;
    });
  }

  public getUsers(): Observable<UserDetails[]> {
    const queryParam = {};
    const userId= JSON.parse(localStorage.getItem('USER_SESSION')).userId;
    const workspaceId= JSON.parse(localStorage.getItem('USER_SESSION')).workspaceId;
    queryParam['userId'] = userId;
    
    return this.baseHttp.get<User[]>(`/workspaces/${workspaceId}/users`).pipe(map((data: User[]) => data.map(user => mapUserToUserDetails(user))));
  }

  public postUsers(user: PostUser): Observable<UserDetails> {
    return this.baseHttp
      .post<User>(this.teamPath, { payload: user })
      .pipe(map((data: User) => mapUserToUserDetails(data)));
  }

  public patchUsers(user: PatchUser, id: number): Observable<UserDetails> {
    const queryParam =
      this.userSession?.globalRoles.includes(RoleModel.Administrator) && this.userSession.userId !== id
        ? {
            userId: id + '',
          }
        : null;

    return this.baseHttp
      .patch<User>(this.teamPath, { payload: user, queryParams: queryParam })
      .pipe(map((data: User) => mapUserToUserDetails(data)));
  }

  public deleteUsers(id: number): Observable<UserDetails> {
    return this.baseHttp.delete<User>(this.teamPath, { urlParams: id + '' });
  }

  public setGlobalRole(userId: number, roles: string[]): Observable<RoleModel[]> {
    return this.baseHttp
      .put<string[]>(`${this.teamPath}/${userId}/roles`, { payload: roles })
      .pipe(map((data: string[]) => data.map(role => RoleModel.fromApiValue(role))));
  }

  public getUserGlobalRoles(userId: Number): Observable<RoleModel[]> {
    return this.baseHttp.get<string[]>(`${this.teamPath}/${userId}/roles`).pipe(map((data: string[]) => data?.map(role => RoleModel.fromApiValue(role))));
  }
}
