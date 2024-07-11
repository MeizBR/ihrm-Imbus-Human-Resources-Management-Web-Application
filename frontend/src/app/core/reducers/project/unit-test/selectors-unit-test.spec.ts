import { initialProjectState } from '../project.reducer';
import {
  getConnectedUserProjects,
  getDetailedProjectsList,
  getProjectsError,
  getProjectsForCalenderOwner,
  getProjectsLoading,
  selectAddProjectPermission,
  selectAllProjectRolesList,
  selectOwnProjectsList,
  selectProjectsList,
} from '..';

import { RoleModel } from '../../../../shared/enum/role-model.enum';
import { ErrorType } from '../../../../shared/validators/validation-error-type';

describe('Projects state', () => {
  const projectsList = [
    {
      id: 1,
      customerId: 1,
      customer: 'Customer N°1',
      name: 'Project A1',
      description: 'Description of Project A1',
      isActive: true,
      userRoles: [],
    },
    {
      id: 2,
      customerId: 2,
      customer: 'Customer N°2',
      name: 'Project A2',
      description: 'Description of Project A2',
      isActive: true,
      userRoles: [],
    },
  ];
  const ownProjects = [
    {
      id: 1,
      customerId: 1,
      customer: 'Customer N°1',
      name: 'Project A1',
      description: 'Description of Project A1',
      isActive: true,
      userRoles: [],
    },
  ];
  it('Should select the projects list', () => {
    let result = selectProjectsList.projector(initialProjectState);
    expect(result).toEqual(undefined);

    result = selectProjectsList.projector({
      initialProjectState,
      projectsList,
    });

    expect(result.length).toEqual(2);
    expect(result[0]).toEqual({
      id: 1,
      customerId: 1,
      customer: 'Customer N°1',
      name: 'Project A1',
      description: 'Description of Project A1',
      isActive: true,
      userRoles: [],
    });
    expect(result[1]).toEqual({
      id: 2,
      customerId: 2,
      customer: 'Customer N°2',
      name: 'Project A2',
      description: 'Description of Project A2',
      isActive: true,
      userRoles: [],
    });
  });

  it('Should select the own projects list', () => {
    let result = selectOwnProjectsList.projector(initialProjectState);
    expect(result).toEqual(undefined);

    result = selectOwnProjectsList.projector({
      initialProjectState,
      ownProjects,
    });

    expect(result.length).toEqual(1);
    expect(result[0]).toEqual({
      id: 1,
      customerId: 1,
      customer: 'Customer N°1',
      name: 'Project A1',
      description: 'Description of Project A1',
      isActive: true,
      userRoles: [],
    });
  });

  it('Should select the user projects list', () => {
    let result = getConnectedUserProjects.projector([], [], null);
    expect(result).toEqual([]);

    result = getConnectedUserProjects.projector(projectsList, ownProjects, {
      workspaceId: 1,
      userId: 1,
      token: 'ABCD',
      globalRoles: [],
    });

    expect(result).toEqual(ownProjects);

    result = getConnectedUserProjects.projector(projectsList, ownProjects, {
      workspaceId: 1,
      userId: 1,
      token: 'ABCD',
      globalRoles: ['Administrator'],
    });

    expect(result).toEqual(projectsList);
  });

  it('Should select the projects of the calendars owner', () => {
    let result = getProjectsForCalenderOwner(1, 1).projector(null, [], [], [], []);
    expect(result).toEqual(undefined);

    result = getProjectsForCalenderOwner(1, 1).projector(
      {
        workspaceId: 1,
        userId: 1,
        token: 'ABCD',
        globalRoles: [RoleModel.Administrator],
      },
      projectsList,
      ownProjects,
      {
        userId: 1,
        projects: [
          {
            id: 1,
            customerId: 1,
            customer: 'Customer N°1',
            name: 'Project A1',
            description: 'Description of Project A1',
            isActive: true,
            userRoles: [],
          },
        ],
      },
    );

    expect(result).toEqual(projectsList);

    result = getProjectsForCalenderOwner(1, 1).projector(
      {
        workspaceId: 1,
        userId: 1,
        token: 'ABCD',
        globalRoles: [],
      },
      projectsList,
      ownProjects,
      {
        userId: 1,
        projects: [
          {
            id: 1,
            customerId: 1,
            customer: 'Customer N°1',
            name: 'Project A1',
            description: 'Description of Project A1',
            isActive: true,
            userRoles: [],
          },
        ],
      },
    );

    expect(result).toEqual(ownProjects);

    result = getProjectsForCalenderOwner(1, 1).projector(
      {
        workspaceId: 1,
        userId: 2,
        token: 'ABCD',
        globalRoles: [],
      },
      projectsList,
      ownProjects,
      {
        userId: 1,
        projects: [
          {
            id: 1,
            customerId: 1,
            customer: 'Customer N°1',
            name: 'Project A1',
            description: 'Description of Project A1',
            isActive: true,
            userRoles: [],
          },
        ],
      },
    );

    expect(result).toEqual([
      {
        id: 1,
        customerId: 1,
        customer: 'Customer N°1',
        name: 'Project A1',
        description: 'Description of Project A1',
        isActive: true,
        userRoles: [],
      },
    ]);
  });

  it('Should select the project role', () => {
    let result = selectAllProjectRolesList.projector(undefined);
    expect(result).toEqual(undefined);

    result = selectAllProjectRolesList.projector({
      initialProjectState,
      projectsRoles: {
        project: 1,
        data: [
          {
            user: { id: 1, name: 'lead', isActive: true },
            roles: ['Lead'],
          },
        ],
      },
    });

    expect(result).toEqual({
      project: 1,
      data: [
        {
          user: { id: 1, name: 'lead', isActive: true },
          roles: ['Lead'],
        },
      ],
    });
  });

  it('Should select the permission of project addition', () => {
    let result = selectAddProjectPermission.projector(undefined);
    expect(result).toEqual(false);

    result = selectAddProjectPermission.projector([]);
    expect(result).toEqual(false);

    result = selectAddProjectPermission.projector(['Administrator']);
    expect(result).toEqual(true);
  });

  it('Should select the detailed project list', () => {
    const result = getDetailedProjectsList.projector(
      [
        {
          id: 1,
          customerId: 1,
          name: 'Project A1',
          description: 'Description of Project A1',
          note: '',
          isActive: true,
          userRoles: ['Lead'],
        },
        {
          id: 2,
          customerId: 2,
          name: 'Project A2',
          description: 'Description of Project A2',
          note: '',
          isActive: true,
          userRoles: ['Member'],
        },
      ],
      [
        {
          id: 1,
          customerId: 1,
          name: 'Project A1',
          description: 'Description of Project A1',
          note: '',
          isActive: true,
          userRoles: ['Lead'],
        },
      ],
      ['Administrator'],
      [
        {
          id: 1,
          name: 'Customer N°1',
          description: 'New description of Customer N°1',
          isActive: true,
        },
        {
          id: 2,
          name: 'Customer N°2',
          description: 'New description of Customer N°2',
          isActive: true,
        },
      ],
    );

    expect(result.length).toEqual(2);
    expect(result[0]).toEqual({
      id: 1,
      customerId: 1,
      customer: 'Customer N°1',
      isActiveCustomer: true,
      name: 'Project A1',
      description: 'Description of Project A1',
      note: '',
      isActive: true,
      userRoles: ['Lead'],
      userPermissions: {
        canEdit: true,
        seeRoles: true,
        canDelete: true,
        canEditRole: true,
      },
    });

    expect(result[1]).toEqual({
      id: 2,
      customerId: 2,
      customer: 'Customer N°2',
      isActiveCustomer: true,
      name: 'Project A2',
      description: 'Description of Project A2',
      note: '',
      isActive: true,
      userRoles: ['Member'],
      userPermissions: {
        canEdit: true,
        seeRoles: true,
        canDelete: true,
        canEditRole: true,
      },
    });
  });

  it('Should select the projects error', () => {
    let result = getProjectsError.projector({
      initialProjectState,
      error: undefined,
    });
    expect(result).toEqual(undefined);

    result = getProjectsError.projector({
      initialProjectState,
      error: ErrorType.NameAlreadyExists,
    });
    expect(result).toEqual('NameAlreadyExists');
  });

  it('Should select the projects error', () => {
    let result = getProjectsLoading.projector({
      initialProjectState,
      loadingAction: false,
    });
    expect(result).toEqual(false);

    result = getProjectsLoading.projector({
      initialProjectState,
      loadingAction: true,
    });

    expect(result).toEqual(true);
  });
});
