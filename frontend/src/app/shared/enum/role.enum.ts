export enum RoleSegment {
  lead = 'Lead',
  supervisor = 'Supervisor',
  member = 'Member',
}

export namespace RoleSegment {
  export function getValues(): RoleSegment[] {
    return [RoleSegment.lead, RoleSegment.supervisor, RoleSegment.member];
  }
}
