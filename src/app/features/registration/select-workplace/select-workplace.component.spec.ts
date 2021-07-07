import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationService } from '@core/services/registration.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { RegistrationModule } from '../registration.module';
import { SelectWorkplaceComponent } from './select-workplace.component';

describe('SelectWorkplaceComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, queryByText } = await render(SelectWorkplaceComponent, {
      imports: [SharedModule, RegistrationModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: RegistrationService,
          useClass: RegistrationService,
          deps: [HttpClient],
        },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              parent: {
                url: [
                  {
                    path: 'registration',
                  },
                ],
              },
            },
          },
        },
      ],
    });

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      getAllByText,
      queryByText,
      getByText,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display none selected error message(twice) when no radio box selected on clicking Continue', async () => {
    const { component, fixture, getAllByText, queryByText, getByText } = await setup();
    const errorMessage = `Select your workplace if it's displayed`;
    const form = component.form;
    const continueButton = getByText('Continue');

    expect(queryByText(errorMessage, { exact: false })).toBeNull();

    fireEvent.click(continueButton);
    fixture.detectChanges();
    expect(form.invalid).toBeTruthy();
    expect(getAllByText(errorMessage, { exact: false }).length).toBe(2);
  });
});
