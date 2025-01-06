import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { StartersLeaversVacanciesLoginMessageComponent } from './starters-leavers-vacancies-login-message.component';

describe('StartersLeaversVacanciesLoginMessageComponent', () => {
  async function setup() {
    const setupTools = await render(StartersLeaversVacanciesLoginMessageComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule],
      providers: [],
    });

    const component = setupTools.fixture.componentInstance;
    return {
      ...setupTools,
      component,
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
});
