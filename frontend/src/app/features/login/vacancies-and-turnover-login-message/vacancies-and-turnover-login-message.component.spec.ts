import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '@core/services/user.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';

import { VacanciesAndTurnoverLoginMessage } from './vacancies-and-turnover-login-message.component';

describe('VacanciesAndTurnoverLoginMessage', () => {
  async function setup() {
    const updateLastViewedVacanciesAndTurnoverLoginMessageSpy = jasmine
      .createSpy('updateLastViewedVacanciesAndTurnoverLoginMessage')
      .and.returnValue(of(null));

    const setupTools = await render(VacanciesAndTurnoverLoginMessage, {
      imports: [SharedModule, RouterModule, RouterTestingModule],
      providers: [
        {
          provide: UserService,
          useValue: {
            loggedInUser: {
              uid: 'ajoij3213213213',
            },
            updateLastViewedVacanciesAndTurnoverLoginMessage: updateLastViewedVacanciesAndTurnoverLoginMessageSpy,
          },
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
      updateLastViewedVacanciesAndTurnoverLoginMessageSpy,
    };
  }

  it('should render a VacanciesAndTurnoverLoginMessage', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should navigate to dashboard on click of Continue', async () => {
    const { getByText } = await setup();

    const continueButton = getByText('Continue');

    expect(continueButton.getAttribute('href')).toEqual('/dashboard');
  });

  it('should call updateLastViewedVacanciesAndTurnoverLoginMessage in UserService on page load', async () => {
    const { updateLastViewedVacanciesAndTurnoverLoginMessageSpy } = await setup();

    expect(updateLastViewedVacanciesAndTurnoverLoginMessageSpy).toHaveBeenCalled();
  });
});
