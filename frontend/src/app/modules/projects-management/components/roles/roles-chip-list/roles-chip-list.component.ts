import { FormControl } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';

import { map } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';

import * as lodash from 'lodash';
import { RoleSegment } from '../../../../../shared/enum/role.enum';

@Component({
  selector: 'app-roles-chip-list',
  templateUrl: './roles-chip-list.component.html',
  styleUrls: ['./roles-chip-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesChipListComponent implements OnInit, OnChanges {
  @Input() selectedRole = RoleSegment.getValues();

  @Output() selectedRoleChanged = new EventEmitter<RoleSegment[]>();

  @ViewChild('roleInput') roleInput: ElementRef<HTMLInputElement>;

  public roleCtrl = new FormControl();
  public filteredRoles$: Observable<RoleSegment[]>;
  public roles = RoleSegment.getValues();
  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public selectedValue$: BehaviorSubject<RoleSegment[]> = new BehaviorSubject([]);

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedRole']) {
      this.selectedValue$.next(this.selectedRole);
    }
  }

  ngOnInit(): void {
    this.filteredRoles$ = combineLatest([this.selectedValue$]).pipe(
      map(([selectedRoles]: [RoleSegment[]]) => {
        this.selectedRoleChanged.emit(selectedRoles);

        return lodash.difference(this.roles, selectedRoles);
      }),
    );
  }

  public removeRole(role: string): void {
    this.selectedValue$.next(this.selectedValue$.value.filter((item: string) => item !== role));
  }

  public onSelectedRole(event: MatAutocompleteSelectedEvent): void {
    this.selectedValue$.next([...this.selectedValue$.value, event.option.value]);
    this.roleCtrl.setValue(null);
    this.roleInput.nativeElement.blur();
  }
}
