import { provideRouter, RouterModule } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';

import { VacanciesAndTurnoverLoginMessage } from './vacancies-and-turnover-login-message.component';

describe('VacanciesAndTurnoverLoginMessage', () => {
  async function setup() {
    const updateLastViewedVacanciesAndTurnoverMessageSpy = jasmine
      .createSpy('updateLastViewedVacanciesAndTurnoverMessage')
      .and.returnValue(of(null));

    const setupTools = await render(VacanciesAndTurnoverLoginMessage, {
      imports: [SharedModule, RouterModule],
      providers: [
        {
          provide: UserService,
          useValue: {
            loggedInUser: {
              uid: 'ajoij3213213213',
            },
            updateLastViewedVacanciesAndTurnoverMessage: updateLastViewedVacanciesAndTurnoverMessageSpy,
          },
        },
        provideRouter([]),
      ],
    });

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
      updateLastViewedVacanciesAndTurnoverMessageSpy,
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

  it('should call updateLastViewedVacanciesAndTurnoverMessage in UserService on page load', async () => {
    const { updateLastViewedVacanciesAndTurnoverMessageSpy } = await setup();

    expect(updateLastViewedVacanciesAndTurnoverMessageSpy).toHaveBeenCalled();
  });
});
