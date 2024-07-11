import { SimpleChange } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatOption } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatChip, MatChipList } from '@angular/material/chips';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { of } from 'rxjs';

import { TranslateModule } from '@ngx-translate/core';

import { RolesChipListComponent } from './roles-chip-list.component';

import { RoleSegment } from '../../../../../shared/enum/role.enum';
import { AngularMaterialModule } from '../../../../../shared/angular-material/angular-material.module';

describe('RolesChipListComponent', () => {
  let component: RolesChipListComponent;
  let fixture: ComponentFixture<RolesChipListComponent>;

  let matChips: MatChip[];
  let matOptions: MatOption[];
  let matChipList: MatChipList;
  let matAutocomplete: MatAutocomplete;

  const selectedRole = [RoleSegment.lead, RoleSegment.supervisor];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AngularMaterialModule, BrowserAnimationsModule, ReactiveFormsModule, TranslateModule.forRoot()],
      declarations: [RolesChipListComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RolesChipListComponent);
    component = fixture.componentInstance;
    component.selectedRole = selectedRole;
    component.filteredRoles$ = of([RoleSegment.member]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct role chip data', () => {
    const roleChipContainer = fixture.debugElement.query(By.css('.role-field-container'));
    expect(roleChipContainer).toBeTruthy();
    expect(roleChipContainer.nativeElement.childElementCount).toEqual(1);

    matChipList = fixture.debugElement.query(By.css('.mat-chip-list')).componentInstance;
    expect(matChipList).toBeTruthy();

    component.ngOnChanges({ selectedRole: new SimpleChange(selectedRole, undefined, true) });
    fixture.detectChanges();

    matChips = matChipList.chips.toArray();
    expect(matChips).toBeTruthy();
    expect(matChips.length).toEqual(2);
    expect(matChips[0].value).toEqual(' Lead cancel');
    expect(matChips[0].removable).toEqual(true);
    expect(matChips[1].value).toEqual(' Supervisor cancel');
    expect(matChips[1].removable).toEqual(true);

    let matChipInput = fixture.debugElement.query(By.css('.role-Input'));
    expect(matChipInput).toBeTruthy();
    expect(matChipInput.nativeElement.placeholder).toEqual('PROJECTS_VIEW.ROLES.SELECT_ROLE_PLACEHOLDER');

    matChipInput.nativeElement.value = 'Member';
    matChipInput.nativeElement.dispatchEvent(new Event('input'));
    expect(matChipInput.nativeElement.value).toEqual('Member');

    matAutocomplete = fixture.debugElement.query(By.css('mat-autocomplete')).componentInstance;
    matOptions = matAutocomplete.options.toArray();
    expect(matOptions.length).toEqual(1);
    expect(matOptions[0].value).toEqual('Member');

    matAutocomplete.optionSelected.emit(new MatAutocompleteSelectedEvent(matAutocomplete, matOptions[0]));
    fixture.detectChanges();

    matChips = matChipList.chips.toArray();
    expect(matChips.length).toEqual(3);
    expect(matChips[0].value).toEqual(' Lead cancel');
    expect(matChips[0].removable).toEqual(true);
    expect(matChips[1].value).toEqual(' Supervisor cancel');
    expect(matChips[1].removable).toEqual(true);
    expect(matChips[2].value).toEqual(' Member cancel');
    expect(matChips[2].removable).toEqual(true);

    matOptions = matAutocomplete.options.toArray();
    expect(matOptions.length).toEqual(0);

    matChipInput = fixture.debugElement.query(By.css('.role-Input'));
    expect(matChipInput).toBeFalsy();

    const spyOnRemoveRole = spyOn(component, 'removeRole').and.callThrough();

    matChips[0].removeIcon._handleClick(new Event('click'));
    fixture.detectChanges();
    expect(spyOnRemoveRole).toHaveBeenCalled();

    matChips = matChipList.chips.toArray();
    expect(matChips.length).toEqual(2);
    expect(matChips[0].value).toEqual(' Supervisor cancel');
    expect(matChips[0].removable).toEqual(true);
    expect(matChips[1].value).toEqual(' Member cancel');
    expect(matChips[1].removable).toEqual(true);
  });

  it('should emit event with correct parameter', () => {
    const selectedRoles: RoleSegment[] = [RoleSegment.lead, RoleSegment.supervisor, RoleSegment.member];
    const spyOnSelectedRoleChanged = spyOn(component.selectedRoleChanged, 'emit').and.callThrough();

    component.selectedRoleChanged.emit(selectedRoles);
    fixture.detectChanges();

    expect(spyOnSelectedRoleChanged).toHaveBeenCalledWith(selectedRoles);
  });
});
