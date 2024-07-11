import { FormGroup } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';

import { _filterRoles, rolesForm } from '../roles-helper';

import { Roles, SelectBoxItems } from '../../../../../shared/models';

@Component({
  selector: 'app-set-roles',
  templateUrl: './set-roles.component.html',
  styleUrls: ['./set-roles.component.scss'],
})
export class SetRolesComponent implements OnInit {
  @Input() usersToSelect: SelectBoxItems[] = [];

  @Output() userRoleToAdd = new EventEmitter<Roles>();

  public form: FormGroup;
  public formVisibility = false;

  constructor() {
    this.form = rolesForm;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usersToSelect'] && this.usersToSelect) {
      if (!this.usersToSelect?.length) {
        this.form.controls['user'].disable();
      } else {
        this.form.controls['user'].enable();
      }
    }
  }

  ngOnInit(): void {
    this.form.reset();
  }

  public selectedRolesChanged(event: string[]): void {
    this.form.controls['selectedRoles'].setValue(event);
  }

  public cancel(): void {
    this.form.reset();
    this.formVisibility = false;
  }

  public onSubmit(): void {
    if (this.form.valid) {
      this.userRoleToAdd.emit({
        user: this.form.value.user,
        roles: this.form.value.selectedRoles,
      });

      this.form.reset();
      this.formVisibility = false;
    }
  }
}
