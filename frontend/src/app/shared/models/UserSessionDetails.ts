export interface UserSessionDetails {
  workspaceId: number;
  userId: number;
  fullName: string;
  token: string;
  globalRoles: Array<string>;
}
