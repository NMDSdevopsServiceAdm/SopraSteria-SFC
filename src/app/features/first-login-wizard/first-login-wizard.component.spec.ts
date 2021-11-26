import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WizardService } from '@core/services/wizard.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockWizardService } from '@core/test-utils/MockWizardService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { FirstLoginWizardComponent } from './first-login-wizard.component';

describe('FirstLoginWizardComponent', () => {
  const wizard = MockWizardService.wizardFactory();

  async function setup() {
    const { fixture, getByText } = await render(FirstLoginWizardComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: WizardService, useClass: MockWizardService },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            snapshot: {
              data: {
                wizard,
              },
            },
          }),
        },
      ],
    });

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      getByText,
    };
  }

  it('should render a FirstLoginWizardComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display title of the sign in wizard', async () => {
    const { getByText } = await setup();
    expect(getByText(wizard.data[0].title)).toBeTruthy();
  });

  it('should display content of the sign in wizard', async () => {
    const { getByText } = await setup();
    expect(getByText(wizard.data[0].content)).toBeTruthy();
  });

  it('should have correct href on the Close button', async () => {
    const { getByText } = await setup();

    const closeButton = getByText('Close', { exact: false });

    expect(closeButton.getAttribute('href')).toEqual('/dashboard');
  });
});
