import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '@core/services/user.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';

import { StartersLeaversVacanciesLoginMessageComponent } from './starters-leavers-vacancies-login-message.component';

describe('StartersLeaversVacanciesLoginMessageComponent', () => {
  const mockUserUid = 'ajoij3213213213';

  async function setup() {
    const updateSLVMessageSpy = jasmine.createSpy('updateSLVMessage').and.returnValue(of(null));

    const setupTools = await render(StartersLeaversVacanciesLoginMessageComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule],
      providers: [
        {
          provide: UserService,
          useValue: {
            loggedInUser: {
              uid: mockUserUid,
            },
            updateSLVMessage: updateSLVMessageSpy,
          },
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
      updateSLVMessageSpy,
    };
  }

  it('should render a StartersLeaversVacanciesLoginMessageComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should navigate to dashboard on click of Continue', async () => {
    const { getByText } = await setup();

    const continueButton = getByText('Continue');

    expect(continueButton.getAttribute('href')).toEqual('/dashboard');
  });

  it('should call updateSLVMessage in UserService on page load', async () => {
    const { updateSLVMessageSpy } = await setup();

    expect(updateSLVMessageSpy).toHaveBeenCalledWith(mockUserUid);
  });
});
