import { SimpleChange } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HarnessLoader } from '@angular/cdk/testing';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ProfileHeaderComponent } from './profile-header.component';

import { RoleModel } from '../../../../shared/enum/role-model.enum';
import { UserDetailedPermissions } from '../../../../shared/models/user-models/userDetails';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('ProfileHeaderComponent', () => {
  let component: ProfileHeaderComponent;
  let fixture: ComponentFixture<ProfileHeaderComponent>;

  let loader: HarnessLoader;
  const cardDetails: UserDetailedPermissions = {
    id: 1,
    firstName: 'Ayedi',
    lastName: 'Hejer',
    login: 'admin',
    email: 'admin',
    note: 'the user note',
    registrationNumber: 1500,
    isActive: true,
    globalRoles: [RoleModel.Administrator],
    userPermissions: {
      canEdit: true,
      seeRoles: true,
      canDelete: false,
    },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AngularMaterialModule, BrowserAnimationsModule, HttpClientModule, ReactiveFormsModule, FormsModule, TranslateModule.forRoot()],
      declarations: [ProfileHeaderComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileHeaderComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    component.cardDetails = cardDetails;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the profile header details', () => {
    component.ngOnChanges({ cardDetails: new SimpleChange(cardDetails, undefined, true) });
    fixture.detectChanges();

    const cardHeaderTextDiv = fixture.debugElement.query(By.css('.card-header-text'));
    const userNameDiv = fixture.debugElement.query(By.css('.user-name'));
    const editProfileTitle = fixture.debugElement.query(By.css('.edit-profile-title'));
    const userImgDiv = fixture.debugElement.query(By.css('.user-img'));
    let userGlobalRolesDiv = fixture.debugElement.query(By.css('.global-roles-icons'));
    const avatar = fixture.debugElement.query(By.css('.avatar'));

    expect(cardHeaderTextDiv).toBeTruthy();
    expect(userNameDiv).toBeTruthy();
    expect(editProfileTitle).toBeTruthy();
    expect(editProfileTitle.nativeElement.textContent).toEqual('Ayedi Hejer');

    expect(userImgDiv).toBeTruthy();
    expect(userGlobalRolesDiv).toBeTruthy();
    expect(userGlobalRolesDiv.nativeElement.childElementCount).toEqual(1);

    let adminIcon = fixture.debugElement.query(By.css('.global-roles-icons mat-icon'));
    expect(adminIcon).toBeTruthy();
    expect(adminIcon.nativeElement.textContent).toEqual('admin_panel_settings');

    component.cardDetails = { ...cardDetails, globalRoles: [RoleModel.Administrator, RoleModel.AccountManager] };
    component.ngOnChanges({ cardDetails: new SimpleChange(cardDetails, undefined, true) });
    fixture.detectChanges();

    userGlobalRolesDiv = fixture.debugElement.query(By.css('.global-roles-icons'));
    expect(userGlobalRolesDiv).toBeTruthy();
    expect(userGlobalRolesDiv.nativeElement.childElementCount).toEqual(2);

    const globalRolesIcons = fixture.debugElement.queryAll(By.css('.global-roles-icons mat-icon'));
    expect(globalRolesIcons).toBeTruthy();
    expect(globalRolesIcons.length).toEqual(2);

    adminIcon = globalRolesIcons[0];
    expect(adminIcon).toBeTruthy();
    expect(adminIcon.nativeElement.textContent).toEqual('admin_panel_settings');

    const accountManagerIcon = globalRolesIcons[1];
    expect(accountManagerIcon).toBeTruthy();
    expect(accountManagerIcon.nativeElement.textContent).toEqual('manage_accounts');

    expect(avatar).toBeTruthy();
    expect(avatar.attributes['mat-card-avatar']).toBeDefined();

    component.cardDetails = { ...cardDetails, firstName: 'Mouelhi', lastName: 'Ameni' };
    fixture.detectChanges();

    expect(editProfileTitle.nativeElement.textContent).toEqual('Mouelhi Ameni');
  });

  it('should display the setting menu in the profile header details', async () => {
    component.cardDetails = {
      ...cardDetails,
      userPermissions: {
        ...cardDetails.userPermissions,
        canDelete: false,
      },
    };
    fixture.detectChanges();

    let settingsSection = fixture.debugElement.query(By.css('.settings-section'));
    expect(settingsSection).toBeFalsy();

    component.cardDetails = {
      ...cardDetails,
      userPermissions: {
        ...cardDetails.userPermissions,
        canDelete: true,
      },
    };
    component.isAdministratorConnectedUser = true;
    fixture.detectChanges();

    settingsSection = fixture.debugElement.query(By.css('.settings-section'));
    expect(settingsSection).toBeTruthy();

    const settingsMenuTrigger = await loader.getHarness<MatMenuHarness>(MatMenuHarness.with({ selector: '#userMenu' }));
    expect(settingsMenuTrigger).toBeTruthy();

    const settingsMenuTriggerName = (await settingsMenuTrigger.getTriggerText()).valueOf();
    expect(settingsMenuTriggerName).toEqual('settings');

    await settingsMenuTrigger.open();
    fixture.detectChanges();
    const isOpen = await settingsMenuTrigger.isOpen();

    expect(isOpen).toBe(true);

    const items = await settingsMenuTrigger.getItems();
    expect(items.length).toBe(3);

    const adminItem = (await items[0].getText()).valueOf();
    expect(adminItem).toEqual('admin_panel_settings TEAM_VIEW.EDIT_PROFILE.ADMINISTRATOR');

    const managerItem = (await items[1].getText()).valueOf();
    expect(managerItem).toEqual('manage_accounts TEAM_VIEW.EDIT_PROFILE.ACCOUNT_MANAGER');

    const deleteButton = (await items[2].getText()).valueOf();
    expect(deleteButton).toEqual('TEAM_VIEW.EDIT_PROFILE.DELETE_USERdelete');

    await settingsMenuTrigger.close();
    fixture.detectChanges();
  });

  it('should handle the role affectation to the user correctly', async () => {
    component.cardDetails = {
      ...cardDetails,
      userPermissions: {
        ...cardDetails.userPermissions,
        canDelete: true,
      },
    };
    component.isAdministratorConnectedUser = true;
    fixture.detectChanges();

    const spyOnChangeRole = spyOn(component, 'onChangeRole').and.callThrough();
    const spyOnDeleteUser = spyOn(component, 'deleteUser').and.callThrough();
    const settingsMenuTrigger = await loader.getHarness<MatMenuHarness>(MatMenuHarness.with({ selector: '#userMenu' }));
    await settingsMenuTrigger.open();
    fixture.detectChanges();

    const administratorToggle = fixture.debugElement.query(By.css('#administrator'));
    administratorToggle.triggerEventHandler('change', { source: { id: 'administrator', checked: undefined }, checked: true });
    fixture.detectChanges();

    expect(spyOnChangeRole).toHaveBeenCalledWith({ source: { id: 'administrator', checked: undefined }, checked: true });

    const accountManagerToggle = fixture.debugElement.query(By.css('#accountManager'));
    accountManagerToggle.triggerEventHandler('change', { source: { id: 'accountManager', checked: undefined }, checked: true });
    fixture.detectChanges();

    expect(spyOnChangeRole).toHaveBeenCalledWith({ source: { id: 'accountManager', checked: undefined }, checked: true });

    const deleteButton = fixture.debugElement.query(By.css('.delete button'));
    deleteButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(spyOnDeleteUser).toHaveBeenCalled();

    component.dialog.closeAll();
    fixture.detectChanges();
  });
});
