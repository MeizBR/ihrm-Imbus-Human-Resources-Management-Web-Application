import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

import { RoleModel } from '../../../../shared/enum/role-model.enum';
import { UserDetailedPermissions } from '../../../../shared/models/user-models/userDetails';

@Component({
  selector: 'app-all-users-card',
  templateUrl: './all-users-card.component.html',
  styleUrls: ['./all-users-card.component.scss'],
})
export class AllUsersCardComponent implements OnChanges {
  @Input() selectedUserId: number;
  @Input() users: UserDetailedPermissions[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  public offset = 0;
  public pageSize = 8;
  public pageLength: number;
  public roleModel = RoleModel;
  public splicedData: UserDetailedPermissions[];

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['users'] && this.users) {
      this.pageLength = this.users.length;
      this.splicedData = this.users.slice(this.offset).slice(0, this.pageSize);
    }
  }

  public pageChangeEvent(event: PageEvent): void {
    this.offset = event.pageIndex * event.pageSize;
    this.splicedData = this.users?.slice(this.offset).slice(0, event.pageSize);
  }

  public usersTrackFn = (i: number, _UserDetails) => i;

  public getSelectedPage(pageIndex: number) {
    this.paginator.pageIndex = pageIndex - 1;
    this.offset = pageIndex ? (pageIndex - 1) * this.pageSize : 0;
    this.splicedData = this.users?.slice(this.offset).slice(0, this.pageSize);
  }
}
