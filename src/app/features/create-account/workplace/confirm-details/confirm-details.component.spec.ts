import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationService } from '@core/services/registration.service';
import { UserService } from '@core/services/user.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockRegistrationService } from '@core/test-utils/MockRegistrationService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { RegistrationModule } from '@features/registration/registration.module';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { queryByText, render } from '@testing-library/angular';

import { ConfirmDetailsComponent } from './confirm-details.component';

describe('ConfirmDetailsComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, queryByText } = await render(ConfirmDetailsComponent, {
      imports: [
        SharedModule,
        RegistrationModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        {
          provide: RegistrationService,
          useClass: MockRegistrationService,
        },
        {
          provide: UserService,
          useClass: MockUserService,
        },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      spy,
      getAllByText,
      queryByText,
      getByText,
    };
  }

  it('should create ConfirmDetailsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should have the title Confirm your details before you submit them', async () => {
    const { fixture, queryByText } = await setup();

    fixture.detectChanges();
    const expectedTitle = 'Confirm your details before you submit them';
    expect(queryByText(expectedTitle, { exact: false })).toBeTruthy();
  });

  it('should display the text to agree to terms and conditions', async () => {
    const { getAllByText } = await setup();

    const expectedText = 'I agree to the ';
    const termsAndConditionsLink = 'terms and conditions';

    expect(getAllByText(expectedText, { exact: false })).toBeTruthy();
    expect(getAllByText(termsAndConditionsLink, { exact: false })).toBeTruthy();
  });
});
