import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { RegistrationSubmitButtonsComponent } from './registration-submit-buttons.component';

describe('RegistrationSubmitButtonsComponent', () => {
  const setup = async (insideFlow = true) => {
    const { fixture, getByText } = await render(RegistrationSubmitButtonsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      componentProperties: {
        insideFlow: insideFlow,
        returnRoute: 'add-workplace/confirm-workplace-details',
      },
      declarations: [],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText };
  };

  it('should render a RegistrationSubmitButtonsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render a continue button when insideFlow is true', async () => {
    const { getByText } = await setup();

    expect(getByText('Continue')).toBeTruthy();
  });

  it('should render a Save and return button and an exit link when inside flow is false', async () => {
    const { getByText } = await setup(false);

    expect(getByText('Save and return')).toBeTruthy();
    expect(getByText('Exit')).toBeTruthy();
  });

  it('should render the exit link with the correct url', async () => {
    const { getByText } = await setup(false);

    const exitLink = getByText('Exit');
    expect(exitLink.getAttribute('href')).toEqual('/add-workplace/confirm-workplace-details');
  });
});
