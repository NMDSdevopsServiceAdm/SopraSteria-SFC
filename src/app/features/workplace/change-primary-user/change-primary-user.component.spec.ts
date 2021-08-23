import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService, primaryEditUser } from '@core/test-utils/MockUserService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ChangePrimaryUserComponent } from './change-primary-user.component';

describe('ChangePrimaryUserComponent', () => {
  async function setup(uidLinkedToMockUsers = 'activeEditUsers') {
    const { fixture, getByText, getByTestId, queryByText } = await render(ChangePrimaryUserComponent, {
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
      getByTestId,
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
});
