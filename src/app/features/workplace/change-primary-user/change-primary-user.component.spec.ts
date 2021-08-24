import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { UserDetails } from '@core/model/userDetails.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { EditUser, MockUserService, primaryEditUser, ReadUser } from '@core/test-utils/MockUserService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { ChangePrimaryUserComponent } from './change-primary-user.component';

describe('ChangePrimaryUserComponent', () => {
  async function setup(uidLinkedToMockUsers = 'activeEditUsers') {
    const { fixture, getByText, getAllByText, queryByText } = await render(ChangePrimaryUserComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [],
      providers: [
        AlertService,
        WindowRef,
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canEditUser']),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(0, false),
          deps: [HttpClient],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                user: primaryEditUser,
              },
            },
            parent: {
              snapshot: {
                url: [{ path: 'workplace' }],
                data: {
                  establishment: {
                    id: 'abc123',
                    uid: uidLinkedToMockUsers,
                    name: 'abc123',
                  },
                },
              },
            },
          },
        },
      ],
    });

    const injector = getTestBed();
    const permissionsService = injector.inject(PermissionsService) as PermissionsService;

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      permissionsService,
      getByText,
      getAllByText,
      queryByText,
    };
  }

  it('should render a UserAccountViewComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display title', async () => {
    const { getByText } = await setup();

    const title = 'Select the new primary user';
    expect(getByText(title)).toBeTruthy();
  });

  it('should show list of active edit users', async () => {
    const { component, getByText } = await setup();

    const firstUserName = component.users[0].fullname;
    const secondUserName = component.users[1].fullname;

    expect(getByText(firstUserName)).toBeTruthy();
    expect(getByText(secondUserName)).toBeTruthy();
  });

  it('should not show current user as option to select as new primary user', async () => {
    const { component, fixture, queryByText } = await setup();

    component.currentUserUid = component.users[0].uid;
    const firstUserName = component.users[0].fullname;

    component.ngOnInit();
    fixture.detectChanges();

    expect(queryByText(firstUserName)).toBeFalsy();
  });

  it('should not show read only users as option to select as new primary user', async () => {
    const { component } = await setup('twoEditTwoReadOnlyUsers');

    expect(component.users.length).toBe(2);
  });

  describe('filterActiveNonPrimaryEditUsers', async () => {
    it('should not return read only users', async () => {
      const { component } = await setup();

      const editUser = EditUser();
      const editUserName = editUser.fullname as string;
      const users = [ReadUser(), editUser, ReadUser()] as UserDetails[];

      const filteredUsers = component.filterActiveNonPrimaryEditUsers(users);

      expect(filteredUsers.length).toBe(1);
      expect(filteredUsers[0].fullname).toBe(editUserName);
    });

    it('should not return pending users', async () => {
      const { component } = await setup();

      const pendingEditUser = EditUser();
      pendingEditUser.status = 'Pending';
      const pendingEditUserName = pendingEditUser.fullname as string;
      const users = [EditUser(), EditUser(), pendingEditUser] as UserDetails[];

      const filteredUsers = component.filterActiveNonPrimaryEditUsers(users);

      const pendingEditUsernameNotInUsersReturned = !filteredUsers.some(
        (user) => user.fullname === pendingEditUserName,
      );

      expect(filteredUsers.length).toBe(2);
      expect(pendingEditUsernameNotInUsersReturned).toBeTruthy();
    });

    it('should not return user with same uid as currentUserUid', async () => {
      const { component } = await setup();

      const currentUser = EditUser();
      component.currentUserUid = currentUser.uid as string;

      const currentUserName = currentUser.fullname as string;
      const users = [EditUser(), currentUser] as UserDetails[];

      const filteredUsers = component.filterActiveNonPrimaryEditUsers(users);

      const currentUsernameNotInUsersReturned = !filteredUsers.some((user) => user.fullname === currentUserName);

      expect(filteredUsers.length).toBe(1);
      expect(currentUsernameNotInUsersReturned).toBeTruthy();
    });
  });

  describe('Error messages', async () => {
    it('should show select primary user error message when nothing has been selected(plus title with same wording)', async () => {
      const { component, getByText, getAllByText } = await setup();

      const form = component.form;

      const errorMessage = 'Select the new primary user';

      const saveAsPrimaryUserButton = getByText('Save as primary user');
      fireEvent.click(saveAsPrimaryUserButton);

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(errorMessage).length).toBe(3);
    });
  });
});
