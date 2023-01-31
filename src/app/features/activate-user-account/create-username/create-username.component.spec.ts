import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackLinkService } from '@core/services/backLink.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { RegistrationService } from '@core/services/registration.service';
import { MockRegistrationService } from '@core/test-utils/MockRegistrationService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { CreateUsernameComponent } from './create-username.component';

describe('UsernamePasswordComponent', () => {
  async function setup(insideFlow = true) {
    const component = await render(CreateUsernameComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        BackLinkService,
        CreateAccountService,
        {
          provide: RegistrationService,
          useClass: MockRegistrationService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                activationToken: 'c4780eba-cb93-4a64-8e53-0cbcd50f6a73',
              },
              parent: {
                url: [
                  {
                    path: insideFlow ? 'c4780eba-cb93-4a64-8e53-0cbcd50f6a73' : 'confirm-account-details',
                  },
                ],
              },
            },
          },
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const componentInstance = component.fixture.componentInstance;
    const registrationsService = injector.inject(CreateAccountService) as CreateAccountService;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      router,
      componentInstance,
      registrationsService,
      spy,
    };
  }

  it('should render a CreateUsernameComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the password as password field when show password is false', async () => {
    const { component } = await setup();

    component.fixture.componentInstance.showPassword = false;

    component.fixture.detectChanges();

    const passwordInput = component.getByTestId('password');
    const confirmPasswordInput = component.getByTestId('confirmpassword');
    expect(passwordInput.getAttribute('type')).toEqual('password');
    expect(confirmPasswordInput.getAttribute('type')).toEqual('password');
  });
});
