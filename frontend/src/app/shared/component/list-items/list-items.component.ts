import { Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';

import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { CustomPaginator } from './custom-paginator';

import { RoleModel } from '../../enum/role-model.enum';
import { Column, ProjectDetails } from '../../models/index';

@Component({
  selector: 'app-list-items',
  templateUrl: './list-items.component.html',
  styleUrls: ['./list-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MatPaginatorIntl, useFactory: CustomPaginator, deps: [TranslateService] }],
})
export class ListItemsComponent<T> implements OnChanges {
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  @Input() pageSize: number;
  @Input() columns: Column[];
  @Input() displayEditButton = true;
  @Input() displayedColumns: string[];
  @Input() displayRolesButton = false;
  @Input() displayDeleteButton = true;
  @Input() displayProfileButton = false;
  @Input() ownProjects: ProjectDetails[];
  @Input() list: MatTableDataSource<T> = new MatTableDataSource([]);

  @Output() editAction = new EventEmitter<T>();
  @Output() deleteAction = new EventEmitter<number>();
  @Output() pageSizeChanged = new EventEmitter<{ pageSize: number }>();

  public index: number;
  public searchKey: string;
  public matSortActive: string;
  public roleModel = RoleModel;
  public editPermitted = false;
  public deletePermitted = false;
  public showRolesPermitted = false;

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['displayedColumns'] && this.displayedColumns) {
      this.matSortActive = this.displayedColumns && this.displayedColumns[0];
    }
    if (changes['list'] && this.list) {
      this.list.sort = this.sort;
      this.list.paginator = this.paginator;
      this.list.filterPredicate = (data: T, filter: string) => {
        let res = [];
        const columns = this.displayedColumns?.filter(col => col !== 'actions');
        columns?.forEach((col: string) => {
          const dataToFilter = col === 'user' ? data['firstName'] + ' ' + data['lastName'] : col === 'active' ? (data['isActive'] ? 'active' : 'inactive') : data[col];

          res = [
            ...res,
            !filter || (dataToFilter !== 'active' && dataToFilter !== 'inactive')
              ? dataToFilter?.toString().trim().toLowerCase().includes(filter?.trim().toLowerCase())
              : dataToFilter?.toString().trim().toLowerCase() === filter?.trim().toLowerCase(),
          ];
        });

        return res?.reduce((sum, next) => sum || next);
      };
    }
  }

  public navigateToProjectDetails(id: number): void {
    this.router.navigate(['home', 'projects', 'details', id]);
  }

  public onSearchClear(): void {
    this.searchKey = '';
    this.applyFilter();
  }

  public applyFilter(): void {
    this.list.filter = this.searchKey?.trim().toLowerCase();
  }

  public navigateUserDetails(id: number): void {
    this.router.navigate(['home', 'team', 'profile', id]);
  }

  public updatePagination(event) {
    this.pageSizeChanged.emit({ pageSize: event.pageSize });
  }

  public colTrackFn = (i: number) => i;
}
