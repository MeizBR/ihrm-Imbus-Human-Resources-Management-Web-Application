import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { select, Store } from '@ngrx/store';

import { AppState } from '../../reducers';
import { selectUserSession, selectUserWorkspaceId } from '../../reducers/auth';

import { BaseHttpService } from './../base-http.service';

import { ProjectRoles } from '../../../generated/projectRoles';
import { PatchProject, PostProject, Project, UserSession } from '../../../generated/models';

import { mapProjectRolesToProjectRolesDetails, mapProjectToProjectDetails, ProjectDetails, ProjectRolesDetails } from '../../../shared/models/index';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private workspaceId: number;
  private userSession: UserSession;
  private projectsPath: string;

  constructor(private baseHttp: BaseHttpService, private store: Store<AppState>) {
    this.store.pipe(select(selectUserSession)).subscribe((userSession: UserSession) => {
      this.userSession = userSession;
    })

    this.store.pipe(select(selectUserWorkspaceId)).subscribe(workspaceId => {
      this.workspaceId = workspaceId;
      this.projectsPath = `/workspaces/${workspaceId}/projects`;
    });
  }

  public getProjects(): Observable<ProjectDetails[]> {
    const queryParam = {};
    const userId= JSON.parse(localStorage.getItem('USER_SESSION')).userId;
    const workspaceId= JSON.parse(localStorage.getItem('USER_SESSION')).workspaceId;
    queryParam['userId'] = userId;

    return this.baseHttp.get<Project[]>(`/workspaces/${workspaceId}/projects`).pipe(map((data: Project[]) => data.map(project => mapProjectToProjectDetails(project))));
  }

  public postProjects(project: PostProject): Observable<ProjectDetails> {
    return this.baseHttp
      .post<Project>(this.projectsPath, { payload: project })
      .pipe(map((data: Project) => mapProjectToProjectDetails(data)));
  }

  public patchProjects(project: PatchProject, id: number): Observable<ProjectDetails> {
    return this.baseHttp
      .patch<Project>(this.projectsPath, { payload: project, urlParams: id + '' })
      .pipe(map((data: Project) => mapProjectToProjectDetails(data)));
  }

  public deleteProjects(id: number): Observable<string> {
    return this.baseHttp
      .delete<string>(this.projectsPath, { urlParams: id + '' })
      .pipe(map((data: string) => data));
  }

  public putProjects(role: string[], projectId: number, userId: number): Observable<string> {
    const rolePath = `${this.projectsPath}/${projectId}/users/${userId}/roles`;

    return this.baseHttp
      .put<string>(rolePath, { payload: role })
      .pipe(map((data: string) => data));
  }

  public getUserRoleByProject(projectId: number): Observable<ProjectRolesDetails[]> {
    const rolePath = `${this.projectsPath}/${projectId}/users/roles`;

    return this.baseHttp.get<ProjectRoles[]>(rolePath).pipe(map((data: ProjectRoles[]) => data.map(role => mapProjectRolesToProjectRolesDetails(role))));
  }

  public getOwnProjectRoles(projectId: number): Observable<string[]> {
    const rolesProjectPath = `${this.projectsPath}/${projectId}/users/self/roles`;

    return this.baseHttp.get<string[]>(rolesProjectPath).pipe(map((data: string[]) => data));
  }

  public getUserProjects(userId: number): Observable<ProjectDetails[]> {
    const userProjectsPath = `${this.projectsPath}/user/${userId}`;

    return this.baseHttp.get<Project[]>(userProjectsPath).pipe(map((data: Project[]) => data.map(project => mapProjectToProjectDetails(project))));
  }
}
