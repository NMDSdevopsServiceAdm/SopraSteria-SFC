import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { InviteResponse } from '@core/model/userDetails.model';
import { BackLinkService } from '@core/services/backLink.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { mockLoggedInUser, MockUserService } from '@core/test-utils/MockUserService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { ChangeUserResearchComponent } from './change-user-research.component';

describe('ChangeUserResearchComponent', () => {
  async function setup(inviteResponse: InviteResponse | null = null) {
    const { fixture, getByRole } = await render(ChangeUserResearchComponent, {
      imports: [SharedModule, ReactiveFormsModule, FormsModule],
      providers: [
        BackLinkService,

        {
          provide: CreateAccountService,
          useValue: {
            userResearchInviteResponse$: {
              next: jasmine.createSpy('next'),
            },
          },
        },

        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },

        {
          provide: UserService,
          useFactory: MockUserService.factoryWithOverrides({
            loggedInUser: {
              ...mockLoggedInUser,
              userResearchInviteResponse: inviteResponse,
            },
          }),
          deps: [HttpClient],
        },

        {
          provide: EstablishmentService,
          useValue: {
            primaryWorkplace: { uid: 'work-1' },
          },
        },

        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router);

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const userService = injector.inject(UserService);

    const updateSpy = spyOn(userService, 'updateUserDetails').and.returnValue({
      subscribe: (cb: any) => cb({}),
    } as any);

    return {
      fixture,
      component,
      getByRole,
      routerSpy,
      updateSpy,
    };
  }

  it('should create component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should prefill form when invite response exists', async () => {
    const { component } = await setup(InviteResponse.Yes);

    expect(component.form.value.inviteResponse).toEqual(InviteResponse.Yes);
  });

  it('should NOT prefill when no response exists', async () => {
    const { component } = await setup(null);

    expect(component.form.value.inviteResponse).toBeNull();
  });

  it('should show breadcrumb', async () => {
    const { fixture } = await setup();
    fixture.detectChanges();

    expect(true).toBeTrue();
  });

  it('should submit and navigate when option selected', async () => {
    const { getByRole, routerSpy, updateSpy } = await setup();

    const yesRadio = getByRole('radio', { name: 'Yes' });
    fireEvent.click(yesRadio);

    const button = getByRole('button');
    fireEvent.click(button);

    expect(updateSpy).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledWith(['/account-management']);
  });

  it('should NOT call updateUserDetails when no option selected', async () => {
    const { getByRole, updateSpy } = await setup();

    const button = getByRole('button');
    fireEvent.click(button);

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('should call updateUserDetails when Yes selected', async () => {
    const { getByRole, updateSpy, routerSpy } = await setup();

    const yesRadio = getByRole('radio', { name: 'Yes' });
    fireEvent.click(yesRadio);

    const button = getByRole('button');
    fireEvent.click(button);

    expect(updateSpy).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledWith(['/account-management']);
  });
});
