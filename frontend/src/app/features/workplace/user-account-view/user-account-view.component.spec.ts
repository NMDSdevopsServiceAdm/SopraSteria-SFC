import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { URLStructure } from '@core/model/url.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService, nonPrimaryEditUser, primaryEditUser, readUser } from '@core/test-utils/MockUserService';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { UserAccountViewComponent } from './user-account-view.component';

describe('UserAccountViewComponent', () => {
  async function setup(isPrimary = true, uidLinkedToMockUsers = 'activeEditUsers', isEdit = true) {
    let userType;
    if (isPrimary) {
      userType = primaryEditUser;
    } else if (isEdit) {
      userType = nonPrimaryEditUser;
    } else {
      userType = readUser;
    }

    const { fixture, getByText, getByTestId, queryByText } = await render(UserAccountViewComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
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
          useFactory: MockUserService.factory(),
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
                user: userType,
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
    const userService = injector.inject(UserService) as UserService;
    const parentSubsidiaryViewService = injector.inject(ParentSubsidiaryViewService) as ParentSubsidiaryViewService;
    const component = fixture.componentInstance;

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      permissionsService,
      userService,
      routerSpy,
      getByText,
      getByTestId,
      queryByText,
      parentSubsidiaryViewService,
    };
  }

  it('should render a UserAccountViewComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display Change link when logged in user can edit user and user is not primary', async () => {
    const { getByText } = await setup(false);

    expect(getByText('Change')).toBeTruthy();
  });

  it('should display Change link when logged in user can edit user, user is primary but there is more than one active edit user linked to the establishment', async () => {
    const { getByText } = await setup(true);

    expect(getByText('Change')).toBeTruthy();
  });

  it('should not display Change link when user is primary and only active edit user linked to the establishment', async () => {
    const { queryByText } = await setup(true, 'singleEditUser');

    expect(queryByText('Change')).toBeFalsy();
  });

  it('should not display Change link when logged in user does not have edit permissions for the user', async () => {
    const { component, fixture, permissionsService, queryByText } = await setup(true);

    const spy = spyOn(permissionsService, 'can');
    spy.and.returnValue(false);

    component.ngOnInit();
    fixture.detectChanges();

    expect(queryByText('Change')).toBeFalsy();
  });

  it('should not display Delete link when logged in user has read-only access and user has read-only access', async () => {
    const userIsPrimary = false;
    const userIsEdit = false;

    const { queryByText, component, fixture, permissionsService, userService } = await setup(
      userIsPrimary,
      'activeEditUsers',
      userIsEdit,
    );

    const readOnlyUser = component.user;

    component.ngOnInit();
    component.canDeleteUser = false;
    fixture.detectChanges();

    spyOnProperty(userService, 'loggedInUser$').and.returnValue(of(readOnlyUser));
    spyOn(permissionsService, 'can').and.returnValue(false);

    const deleteButton = queryByText('Delete this user');
    expect(deleteButton).toBeFalsy();
  });

  it('should display Delete link when logged in user has edit access and user has read-only access', async () => {
    const userIsPrimary = false;
    const userIsEdit = false;

    const { queryByText, component, fixture, permissionsService, userService, routerSpy } = await setup(
      userIsPrimary,
      'activeEditUsers',
      userIsEdit,
    );
    const editUser = component.user;

    component.ngOnInit();
    component.canDeleteUser = true;
    fixture.detectChanges();

    spyOnProperty(userService, 'loggedInUser$').and.returnValue(of(editUser));
    spyOn(permissionsService, 'can').and.returnValue(true);

    const deleteButton = queryByText('Delete this user');
    fireEvent.click(deleteButton);

    expect(deleteButton).toBeTruthy();
    expect(routerSpy.calls.mostRecent().args[0]).toEqual(['delete-user']);
  });

  it('should not display delete link when logged in user has read only access and user has edit access', async () => {
    const userIsPrimary = false;
    const userIsEdit = true;

    const { queryByText, component, fixture, permissionsService, userService } = await setup(
      userIsPrimary,
      'activeEditUsers',
      userIsEdit,
    );
    const readOnlyUser = component.user;

    component.ngOnInit();
    component.canDeleteUser = false;
    fixture.detectChanges();

    spyOnProperty(userService, 'loggedInUser$').and.returnValue(of(readOnlyUser));
    spyOn(permissionsService, 'can').and.returnValue(false);

    component.ngOnInit();
    fixture.detectChanges();

    const deleteButton = queryByText('Delete this user');
    expect(deleteButton).toBeFalsy();
  });

  it('should not display a delete link when logged in user is an edit user, and goes onto their details page', async () => {
    const userIsPrimary = false;
    const userIsEdit = true;

    const { queryByText, component, fixture, permissionsService, userService } = await setup(
      userIsPrimary,
      'activeEditUsers',
      userIsEdit,
    );
    const editUser = component.user;

    spyOnProperty(userService, 'loggedInUser$').and.returnValue(of(editUser));
    spyOn(permissionsService, 'can').and.returnValue(false);

    component.ngOnInit();
    fixture.detectChanges();

    const deleteButton = queryByText('Delete this user');
    expect(deleteButton).toBeFalsy();
  });

  it('should display a delete link when logged in user is an edit user, and user is an edit user', async () => {
    const userIsPrimary = false;
    const userIsEdit = true;

    const { getByText, component, fixture, permissionsService, userService, routerSpy } = await setup(
      userIsPrimary,
      'activeEditUsers',
      userIsEdit,
    );

    const editUser = component.user;

    spyOnProperty(userService, 'loggedInUser$').and.returnValue(of(editUser));
    spyOn(permissionsService, 'can').and.returnValue(true);

    component.ngOnInit();
    component.canDeleteUser = true;
    fixture.detectChanges();

    const deleteButton = getByText('Delete this user');

    fireEvent.click(deleteButton);

    expect(deleteButton).toBeTruthy();
    expect(routerSpy.calls.mostRecent().args[0]).toEqual(['delete-user']);
  });

  it('should display a delete link when logged in user is an edit user, and user is an primary user', async () => {
    const userIsPrimary = true;
    const userIsEdit = true;

    const { queryByText, component, fixture, permissionsService, userService, routerSpy } = await setup(
      userIsPrimary,
      'activeEditUsers',
      userIsEdit,
    );
    const editUser = component.user;

    spyOnProperty(userService, 'loggedInUser$').and.returnValue(of(editUser));
    spyOn(permissionsService, 'can').and.returnValue(true);

    component.ngOnInit();
    component.canDeleteUser = true;
    fixture.detectChanges();

    const deleteButton = queryByText('Delete this user');
    fireEvent.click(deleteButton);

    expect(deleteButton).toBeTruthy();
    expect(routerSpy.calls.mostRecent().args[0]).toEqual(['select-primary-user-delete']);
  });

  describe('getBreadcrumbsJourney', () => {
    it('should return subsidiary journey when viewing sub as parent', async () => {
      const { component, parentSubsidiaryViewService } = await setup();
      spyOn(parentSubsidiaryViewService, 'getViewingSubAsParent').and.returnValue(true);
      expect(component.getBreadcrumbsJourney()).toBe(JourneyType.SUBSIDIARY);
    });

    it('should return my workplace journey when return does not have fragment set', async () => {
      const { component, fixture } = await setup();
      component.return = { fragment: null } as URLStructure;
      fixture.detectChanges();

      expect(component.getBreadcrumbsJourney()).toBe(JourneyType.MY_WORKPLACE);
    });

    it('should return all workplaces journey when return has fragment', async () => {
      const { component } = await setup();

      expect(component.getBreadcrumbsJourney()).toBe(JourneyType.ALL_WORKPLACES);
    });
  });
});
