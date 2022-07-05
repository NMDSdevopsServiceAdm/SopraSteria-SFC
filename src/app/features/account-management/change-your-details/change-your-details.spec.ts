import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { ChangeYourDetailsComponent } from './change-your-details.component';

describe('ChangeYourDetailsComponent', () => {
  async function setup(isAdmin = false) {
    const { fixture, getByText, getAllByText, getByTestId, getByLabelText, queryByText } = await render(
      ChangeYourDetailsComponent,
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
            provide: UserService,
            useFactory: MockUserService.factory(0, isAdmin),
            deps: [HttpClient],
          },
          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService,
          },
        ],
      },
    );

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const userService = injector.inject(UserService) as UserService;

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByTestId,
      getByLabelText,
      queryByText,
      routerSpy,
      userService,
    };
  }

  it('should render a ChangeYourDetailsComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should call updateUserDetails with updated information if the user is not an admin', async () => {
    const { component, fixture, getByText, userService } = await setup();

    const updateUserSpy = spyOn(userService, 'updateUserDetails').and.callThrough();
    const button = getByText('Save and return');

    fireEvent.click(button);
    fixture.detectChanges();

    const userDetails = component.form.value;

    expect(updateUserSpy).toHaveBeenCalledWith('98a83eef-e1e1-49f3-89c5-b1287a3cc8de', 'mocked-uid', userDetails);
  });

  it('should navigate away from page when successfully updating user', async () => {
    const { fixture, getByText, routerSpy, userService } = await setup();

    spyOn(userService, 'updateUserDetails').and.callThrough();
    const button = getByText('Save and return');
    fireEvent.click(button);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['/account-management']);
  });

  it('should call updateUserDetails with updated information if the user is not an admin', async () => {
    const { component, fixture, getByText, userService } = await setup(true);

    const updateUserSpy = spyOn(userService, 'updateAdminUserDetails').and.callThrough();
    const button = getByText('Save and return');

    fireEvent.click(button);
    fixture.detectChanges();

    const userDetails = component.form.value;

    expect(updateUserSpy).toHaveBeenCalledWith('mocked-uid', userDetails);
  });

  it('should navigate away from page when successfully updating user', async () => {
    const { fixture, getByText, routerSpy, userService } = await setup(true);

    spyOn(userService, 'updateAdminUserDetails').and.callThrough();
    const button = getByText('Save and return');
    fireEvent.click(button);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['/account-management']);
  });
});
