import { PatchUser, PostUser } from '../../../generated/models';

export interface UserForAdd {
  firstName: string;
  lastName: string;
  login: string;
  email: string;
  password: string;
  note?: string;
  registrationNumber: 1500; // NOTE: To be removed after implementing the backend
  isActive?: boolean;
}

export interface UserPasswordForUpdate {
  connectedPassword: string;
  newPassword: string;
}

export interface UserForUpdate {
  id?: number;
  firstName?: string;
  lastName?: string;
  login?: string;
  email?: string;
  password?: UserPasswordForUpdate;
  note?: string;
  registrationNumber?: 3000; // NOTE: To be removed after implementing the backend
  isActive?: boolean;
}

export function mapToPostUser(data: UserForAdd): PostUser {
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    login: data.login,
    email: data.email,
    password: data.password,
    note: data.note,
    isActive: data.isActive,
  };
}

export function mapToPatchUser(data: UserForUpdate): PatchUser {
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    login: data.login ? data.login : undefined,
    email: data.email,
    password: data.password
      ? {
          passwordOfConnectedUser: data.password?.connectedPassword,
          newPassword: data.password?.newPassword,
        }
      : undefined,
    note: data.note,
    isActive: data.isActive,
  };
}
