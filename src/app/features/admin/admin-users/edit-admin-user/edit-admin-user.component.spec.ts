import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminUsersService } from '@core/services/admin/admin-users/admin-users.service';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { WindowRef } from '@core/services/window.ref';
import { MockAdminUsersService } from '@core/test-utils/admin/MockAdminUsersService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { EditAdminUserComponent } from './edit-admin-user.component';

fdescribe('EditAdminUserMenuComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, getByTestId, getByLabelText, queryByText } = await render(
      EditAdminUserComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          AlertService,
          WindowRef,
          {
            provide: BreadcrumbService,
            useClass: MockBreadcrumbService,
          },
          {
            provide: AdminUsersService,
            useClass: MockAdminUsersService,
          },
        ],
      },
    );

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const adminUsersService = injector.inject(AdminUsersService) as AdminUsersService;
    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByTestId,
      getByLabelText,
      queryByText,
      routerSpy,
      adminUsersService,
      alertSpy,
    };
  }

  it('should render a EditAdminUserComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });
});
