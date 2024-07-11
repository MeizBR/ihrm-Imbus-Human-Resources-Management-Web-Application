export enum RoleModel {
  Lead = 'Lead',
  Member = 'Member',
  Supervisor = 'Supervisor',
  Administrator = 'Administrator',
  AccountManager = 'AccountManager',
}

export namespace RoleModel {
  export function fromApiValue(role: string): RoleModel {
    switch (role) {
      case 'Lead':
        return RoleModel.Lead;

      case 'Member':
        return RoleModel.Member;

      case 'Supervisor':
        return RoleModel.Supervisor;

      case 'Administrator':
        return RoleModel.Administrator;

      case 'AccountManager':
        return RoleModel.AccountManager;

      default:
        return;
    }
  }
}

export namespace RoleModel {
  export function toApiValue(role: RoleModel): string {
    switch (role) {
      case RoleModel.Lead:
        return 'Lead';

      case RoleModel.Member:
        return 'Member';

      case RoleModel.Supervisor:
        return 'Supervisor';

      case RoleModel.Administrator:
        return 'Administrator';

      case RoleModel.AccountManager:
        return 'AccountManager';

      default:
        return;
    }
  }
}
