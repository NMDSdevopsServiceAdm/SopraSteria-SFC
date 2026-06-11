import { render } from '@testing-library/angular';
import { MigratedUserTermsConditionsComponent } from './migrated-user-terms-conditions.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UserService } from '@core/services/user.service';
import { MockUserService } from '@core/test-utils/MockUserService';
import userEvent from '@testing-library/user-event';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

describe('MigratedUserTermsConditionsComponent', () => {
  const setup = async () => {
    const setupTools = await render(MigratedUserTermsConditionsComponent, {
      imports: [RouterModule, SharedModule, ReactiveFormsModule],
      declarations: [],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {},
          },
        },
        {
          provide: UserService,
          useClass: MockUserService,
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const userService = injector.inject(UserService) as UserService;

    return { ...setupTools, component, routerSpy, userService };
  };

  it('should set the user flag "agreedUpdatedTerms" to true when user ticked and click continue', async () => {
    const { getByRole, getByLabelText, userService } = await setup();
    const updateUserFlagSpy = spyOn(userService, 'updateUserFlag').and.returnValue(of({}));

    userEvent.click(getByLabelText('I agree to updated the terms and conditions of this service'));
    userEvent.click(getByRole('button', { name: 'Continue' }));

    expect(updateUserFlagSpy).toHaveBeenCalledWith('mocked-uid', { agreedUpdatedTerms: true });
  });

  it('should show an error if user did not ticked the box', async () => {
    const { getByRole, getByText, userService } = await setup();
    const updateUserFlagSpy = spyOn(userService, 'updateUserFlag').and.returnValue(of({}));

    userEvent.click(getByRole('button', { name: 'Continue' }));
    expect(getByText('There is a problem')).toBeTruthy();

    expect(updateUserFlagSpy).not.toHaveBeenCalled();
  });
});
