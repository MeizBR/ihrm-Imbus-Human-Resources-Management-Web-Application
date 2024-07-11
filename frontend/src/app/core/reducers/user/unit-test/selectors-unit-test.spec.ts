import { initialUsersState } from '../user.reducer';
import { mappedActiveUsersList, mappedUsersList, selectAddUserPermission, selectUsersList, usersListDetailed } from '..';

import { RoleModel } from '../../../../shared/enum/role-model.enum';
import { UserDetailedPermissions, UserDetails } from '../../../../shared/models/user-models/userDetails';

describe('Users state', () => {
  const johnDoe: UserDetails = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    login: 'admin',
    email: 'admin@gmail.com',
    note: 'the user note',
    registrationNumber: 1500,
    isActive: true,
    fullName: 'John Doe',
    globalRoles: [RoleModel.Administrator],
  };
  const johnDoe2: UserDetails = {
    id: 2,
    firstName: 'John',
    lastName: 'Doe',
    login: 'john.doe',
    email: 'john.doe@gmail.com',
    note: 'the user note',
    registrationNumber: 1500,
    isActive: true,
    fullName: 'John Doe',
    globalRoles: [],
  };
  const jackieJoe: UserDetails = {
    id: 3,
    firstName: 'Jackie',
    lastName: 'Joe',
    login: 'lead',
    email: 'lead@gmail.com',
    note: 'the user note',
    registrationNumber: 1500,
    isActive: false,
    fullName: 'Jackie Joe',
    globalRoles: [],
  };

  it('Should select the users list', () => {
    let result: UserDetails[] = selectUsersList.projector(initialUsersState);
    expect(result).toEqual(undefined);

    result = selectUsersList.projector({ initialUsersState, usersList: [johnDoe, jackieJoe] });

    expect(result.length).toEqual(2);
    expect(result[0]).toEqual(johnDoe);
    expect(result[1]).toEqual(jackieJoe);
  });

  it('Should select the Add User Permission', () => {
    let result = selectAddUserPermission.projector([]);
    expect(result).toEqual(false);

    result = selectAddUserPermission.projector(['Administrator']);
    expect(result).toEqual(true);
  });

  it('Should select the users list detailed', () => {
    let result: UserDetailedPermissions[] = usersListDetailed.projector([], [], {});
    expect(result.length).toEqual(0);

    result = usersListDetailed.projector([johnDoe, jackieJoe], [RoleModel.Administrator], { workspaceId: 1, userId: 1, token: 'token', globalRoles: [RoleModel.Administrator] });
    expect(result.length).toEqual(2);
    expect(result[0]).toEqual({ ...johnDoe, userPermissions: { canEdit: true, seeRoles: false, canDelete: false } });
    expect(result[1]).toEqual({ ...jackieJoe, globalRoles: [], userPermissions: { canEdit: true, seeRoles: false, canDelete: true } });
  });

  it('Should select user list mapped by redundant name', () => {
    let result: UserDetailedPermissions[] = mappedUsersList.projector([]);
    expect(result.length).toEqual(0);

    result = mappedUsersList.projector([
      { ...johnDoe, globalRoles: [RoleModel.Administrator], userPermissions: { canEdit: true, seeRoles: false, canDelete: true } },
      { ...johnDoe2, globalRoles: [], userPermissions: { canEdit: true, seeRoles: false, canDelete: true } },
      { ...jackieJoe, globalRoles: [], userPermissions: { canEdit: true, seeRoles: false, canDelete: true } },
    ]);

    expect(result.length).toEqual(3);
    expect(result[0]).toEqual({
      ...johnDoe,
      fullName: 'John Doe (admin)',
      globalRoles: [RoleModel.Administrator],
      userPermissions: { canEdit: true, seeRoles: false, canDelete: true },
    });
    expect(result[1]).toEqual({
      ...johnDoe2,
      fullName: 'John Doe (john.doe)',
      globalRoles: [],
      userPermissions: { canEdit: true, seeRoles: false, canDelete: true },
    });
    expect(result[2]).toEqual({
      ...jackieJoe,
      globalRoles: [],
      userPermissions: { canEdit: true, seeRoles: false, canDelete: true },
    });
  });

  it('Should select active user list mapped by redundant name', () => {
    let result: UserDetailedPermissions[] = mappedActiveUsersList.projector([]);
    expect(result.length).toEqual(0);

    const usersList = [
      {
        ...johnDoe,
        fullName: 'John Doe (admin)',
        globalRoles: [RoleModel.Administrator],
        userPermissions: { canEdit: true, seeRoles: false, canDelete: true },
      },
      {
        ...johnDoe2,
        fullName: 'John Doe (john.doe)',
        globalRoles: [],
        userPermissions: { canEdit: true, seeRoles: false, canDelete: true },
      },
      {
        ...jackieJoe,
        globalRoles: [],
        userPermissions: { canEdit: true, seeRoles: false, canDelete: true },
      },
    ];
    result = mappedActiveUsersList.projector(usersList);

    expect(result.length).toEqual(2);
    expect(result[0]).toEqual(usersList[0]);
    expect(result[1]).toEqual(usersList[1]);
  });
});
