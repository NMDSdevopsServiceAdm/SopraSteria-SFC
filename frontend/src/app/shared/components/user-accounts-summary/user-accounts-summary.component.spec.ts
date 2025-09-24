import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Roles } from '@core/model/roles.enum';
import { UserDetails } from '@core/model/userDetails.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { EditUser, ReadUser } from '@core/test-utils/MockUserService';
import { UserAccountsSummaryComponent } from '@shared/components/user-accounts-summary/user-accounts-summary.component';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { Establishment } from '../../../../mockdata/establishment';
describe('UserAccountsSummaryComponent', () => {
  const setup = async (showBanner = undefined, overLimit = false, isParentUsers = false) => {
    const workplace = Establishment;

    const setupTools = await render(UserAccountsSummaryComponent, {
      imports: [SharedModule, RouterModule],
      declarations: [],
      componentProperties: {
        workplace,
        showSecondUserBanner: showBanner,
        isParentUsers: isParentUsers,
      },
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canAddUser', 'canViewUser']),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                users: overLimit
                  ? ([ReadUser(), ReadUser(), ReadUser(), EditUser(), EditUser(), EditUser()] as UserDetails[])
                  : ([EditUser()] as UserDetails[]),
              },
            },
          },
        },
      provideHttpClient(), provideHttpClientTesting(),],
    });
    const component = setupTools.fixture.componentInstance;

    return { ...setupTools, component, workplace };
  };

  it('should render a User Account Summary Workplace Component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the workplace name and id when in parent view', async () => {
    const { getByText, workplace } = await setup(false, false, true);

    const workplaceIdCaption = `(Workplace ID: ${workplace.nmdsId})`;

    expect(getByText(workplace.name)).toBeTruthy();
    expect(getByText(workplaceIdCaption)).toBeTruthy();
  });

  it('should not show the workplace name and id when not in parent view', async () => {
    const { queryByText, workplace } = await setup();

    const workplaceIdCaption = `(Workplace ID: ${workplace.nmdsId})`;

    expect(queryByText(workplace.name)).toBeFalsy();
    expect(queryByText(workplaceIdCaption)).toBeFalsy();
  });

  it('should show the number of users', async () => {
    const { getByText } = await setup(false, false, true);

    const numberOfUsers = getByText('Users (1)');

    expect(numberOfUsers).toBeTruthy();
  });

  it('should show Add a user button with the correct href when the canAddUser permission is true', async () => {
    const { component, getByText } = await setup();

    const addUserButton = getByText('Add a user');
    const workplaceId = component.workplace.uid;

    expect(addUserButton).toBeTruthy();
    expect(addUserButton.getAttribute('href')).toEqual(`/workplace/${workplaceId}/user/create`);
  });

  it('should not show Add a user button when the canAddUser permission is false', async () => {
    const { component, fixture, queryByText } = await setup();

    component.canAddUser = false;
    fixture.detectChanges();

    expect(queryByText('Add a user')).toBeFalsy();
  });

  it('should still show Add User if existing user doesnt have a name', async () => {
    const { component } = await setup();

    component.workplace.uid = '4698f4a4-ab82-4906-8b0e-3f4972375927';

    component.ngOnInit();
    expect(component.users.length).toEqual(1);
    expect(component.canAddUser).toBeTruthy();
  });

  it('should not be able to add user if 3 edit users exist', async () => {
    const { component } = await setup(false, true);

    component.workplace.isParent = false;

    component.ngOnInit();
    expect(component.users.length).toEqual(6);
    expect(component.canAddUser).toBeFalsy();
  });

  it('should show add user banner if showSecondUserBanner is true', async () => {
    const { queryByText } = await setup(true);
    const addUserText =
      'Adding a second user will give Skills for Care another person to contact at your workplace should you be unavailable.';

    expect(queryByText(addUserText, { exact: false })).toBeTruthy();
  });

  it('should not show add user banner if showSecondUserBanner is false', async () => {
    const { queryByText } = await setup(false);
    const addUserText =
      'Adding a second user will give Skills for Care another person to contact at your workplace should you be unavailable.';

    expect(queryByText(addUserText, { exact: false })).toBeFalsy();
  });

  it('should show add user banner if there is 1 user and canAddUser permission is true', async () => {
    const { queryByText } = await setup();

    const addUserText =
      'Adding a second user will give Skills for Care another person to contact at your workplace should you be unavailable.';

    expect(queryByText(addUserText, { exact: false })).toBeTruthy();
  });

  it('should not show add user banner if there is 1 user and canAddUser permission is false', async () => {
    const { component, fixture, queryByText } = await setup();

    component.canAddUser = false;
    component.setShowSecondUserBanner();
    fixture.detectChanges();

    const addUserText =
      'Adding a second user will give Skills for Care another person to contact at your workplace should you be unavailable.';

    expect(queryByText(addUserText, { exact: false })).toBeFalsy();
  });

  it('should not show add user banner if there is more than 1 user', async () => {
    const { queryByText } = await setup(undefined, true);

    const addUserText =
      'Adding a second user will give Skills for Care another person to contact at your workplace should you be unavailable.';

    expect(queryByText(addUserText, { exact: false })).toBeFalsy();
  });

  it('should show the users full name as a link with the correct href when the canViewUser permissions is true', async () => {
    const { component, getByTestId } = await setup();
    const usernameLink = getByTestId('username-link');

    const establishmentId = component.workplace.uid;
    const userId = component.users[0].uid;

    expect(usernameLink).toBeTruthy();
    expect(usernameLink.getAttribute('href')).toEqual(`/workplace/${establishmentId}/user/${userId}`);
  });

  it('should show the users fullname not as a link when the canViewUser permission is false', async () => {
    const { component, fixture, queryByTestId, getByText } = await setup();

    component.canViewUser = false;
    fixture.detectChanges();

    const fullname = component.users[0].fullname;

    expect(queryByTestId('username-link')).toBeFalsy();
    expect(getByText(fullname)).toBeTruthy();
  });

  describe('Permissions column', () => {
    it('should have permission as Primary edit when user isPrimary is true and role is Edit', async () => {
      const { component, fixture, queryByText } = await setup();

      component.users[0].role = 'Edit' as Roles;
      component.users[0].isPrimary = true;

      fixture.detectChanges();

      expect(queryByText('Primary edit')).toBeTruthy();
    });

    it('should have permission as Edit when user isPrimary is false and role is Edit', async () => {
      const { component, fixture, queryByText } = await setup();

      component.users[0].role = 'Edit' as Roles;
      component.users[0].isPrimary = false;

      fixture.detectChanges();

      expect(queryByText('Edit')).toBeTruthy();
    });

    it('should have permission as Read only when role is Read', async () => {
      const { component, fixture, queryByText } = await setup();

      component.users[0].role = 'Read' as Roles;
      component.users[0].isPrimary = false;

      fixture.detectChanges();

      expect(queryByText('Read only')).toBeTruthy();
    });
  });
});