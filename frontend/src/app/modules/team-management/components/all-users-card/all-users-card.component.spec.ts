import { SimpleChange } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';

import { AllUsersCardComponent } from './all-users-card.component';
import { UserDetailedPermissions } from '../../../../shared/models/user-models/userDetails';
import { AngularMaterialModule } from '../../../../shared/angular-material/angular-material.module';

describe('AllUsersCardComponent', () => {
  let component: AllUsersCardComponent;
  let fixture: ComponentFixture<AllUsersCardComponent>;
  const users: UserDetailedPermissions[] = [
    {
      id: 1,
      firstName: 'Ayedi',
      lastName: 'Hejer',
      login: 'admin',
      email: 'admin',
      note: 'the user note',
      registrationNumber: 1500,
      isActive: true,
      userPermissions: {
        canEdit: true,
        seeRoles: true,
        canDelete: true,
      },
    },
    {
      id: 2,
      firstName: 'Mouelhi',
      lastName: 'Ameni',
      login: 'lead',
      email: 'lead',
      note: 'the user note',
      registrationNumber: 1500,
      isActive: true,
      userPermissions: {
        canEdit: true,
        seeRoles: true,
        canDelete: true,
      },
    },
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AllUsersCardComponent],
      imports: [AngularMaterialModule, TranslateModule.forRoot(), HttpClientModule, RouterTestingModule, BrowserAnimationsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllUsersCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the initial static component DOM, header and content details correctly', () => {
    const allUserCard = fixture.debugElement.query(By.css('.all-users-card'));
    expect(allUserCard).toBeTruthy();
    expect(allUserCard.nativeElement.childElementCount).toEqual(2);

    const allUsersCardHeaderText = fixture.debugElement.query(By.css('.all-users-card-header-text'));
    expect(allUsersCardHeaderText).toBeTruthy();
    expect(allUsersCardHeaderText.nativeElement.childElementCount).toEqual(1);

    const allUsersCardTitle = fixture.debugElement.query(By.css('.all-users-card-title'));
    expect(allUsersCardTitle).toBeTruthy();
    expect(allUsersCardTitle.nativeElement.textContent).toEqual('TEAM_VIEW.USERS_LIST.ALL_USERS');

    const usersCardContent = fixture.debugElement.query(By.css('.all-users-card-content'));
    expect(usersCardContent).toBeTruthy();
    const allUsers = fixture.debugElement.query(By.css('.user-details-content'));
    const usersAvatars = fixture.debugElement.query(By.css('.user-avatar'));
    const usersDetails = fixture.debugElement.query(By.css('.user-details'));
    const usersInformation = fixture.debugElement.query(By.css('.user-information'));
    const switchButtons = fixture.debugElement.query(By.css('.user-switch-button'));

    expect(allUsers).toBeFalsy();
    expect(usersAvatars).toBeFalsy();
    expect(usersDetails).toBeFalsy();
    expect(usersInformation).toBeFalsy();
    expect(switchButtons).toBeFalsy();
  });

  it('should display the selected user details correctly', () => {
    component.users = users;
    component.selectedUserId = 1;
    component.ngOnChanges({ users: new SimpleChange(users, undefined, true) });

    fixture.detectChanges();
    const usersCardContent = fixture.debugElement.query(By.css('.all-users-card-content'));
    expect(usersCardContent).toBeTruthy();
    const allUsers = fixture.debugElement.queryAll(By.css('.user-details-content'));
    const usersDetails = fixture.debugElement.queryAll(By.css('.user-details'));
    const usersInformation = fixture.debugElement.queryAll(By.css('.user-information'));

    expect(allUsers.length).toEqual(users.length);
    expect(usersDetails.length).toEqual(users.length);
    expect(usersInformation.length).toEqual(users.length);
    expect(usersInformation[0].nativeElement.textContent).toEqual('Ayedi Hejer');
    expect(usersInformation[1].nativeElement.textContent).toEqual('Mouelhi Ameni');

    let userCardContent = fixture.debugElement.query(By.css('.user-details-content'));
    expect(userCardContent).toBeTruthy();
    expect(userCardContent.classes).toEqual({ selected: true, 'user-details-content': true });
    expect(userCardContent.nativeElement.childElementCount).toEqual(1);

    let selectedUserName = fixture.debugElement.query(By.css('.user-details-content .user-details .user-information'));
    expect(selectedUserName).toBeTruthy();
    expect(selectedUserName.nativeElement.textContent).toEqual('Ayedi Hejer');

    component.selectedUserId = 2;
    fixture.detectChanges();

    userCardContent = fixture.debugElement.queryAll(By.css('.user-details-content'))[1];
    expect(userCardContent).toBeTruthy();
    expect(userCardContent.classes).toEqual({ selected: true, 'user-details-content': true });
    expect(userCardContent.nativeElement.childElementCount).toEqual(1);

    selectedUserName = userCardContent.query(By.css('.user-details .user-information'));
    expect(selectedUserName).toBeTruthy();
    expect(selectedUserName.nativeElement.textContent).toEqual('Mouelhi Ameni');
  });
});
