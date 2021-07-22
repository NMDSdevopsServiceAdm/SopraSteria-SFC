import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationService } from '@core/services/registration.service';
import { UserService } from '@core/services/user.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
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
          // useValue: {
          //   locationAddresses$: {
          //     value: [
          //       {
          //         locationName: 'Hello Care',
          //         locationId: '1-2123313123',
          //         addressLine1: '123 Fake Ave',
          //         county: 'West Yorkshire',
          //         postalCode: 'LS1 1AA',
          //         townCity: 'Leeds',
          //       },
          //     ],
          //   },
          //   searchMethod$: {
          //     value: 'locationId',
          //   },
          // },
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: UserService,
          useClass: MockUserService,
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
        FormBuilder,
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

  it('should show details of workplace for when is CQC regulated', async () => {
    const { fixture, getByText } = await setup();

    const expectedLocationName = 'Name';
    const expectedAddressLine1 = '1 Street';
    const expectedTownCity = 'Manchester';
    const expectedPostalCode = 'ABC 123';
    const expectedCounty = 'Greater Manchester';
    const expectedLocationId = '123';

    fixture.detectChanges();

    expect(getByText(expectedLocationName)).toBeTruthy();
    expect(getByText(expectedAddressLine1)).toBeTruthy();
    expect(getByText(expectedTownCity)).toBeTruthy();
    expect(getByText(expectedPostalCode)).toBeTruthy();
    expect(getByText(expectedCounty)).toBeTruthy();
    expect(getByText(expectedLocationId)).toBeTruthy();
  });

  it('should show CQC Location ID field when is CQC regulated', async () => {
    const { fixture, queryByText } = await setup();
    const expectedField = 'CQC Location ID';

    fixture.detectChanges();
    expect(queryByText(expectedField)).toBeTruthy();
  });

  it('should show details of user', async () => {
    const { fixture, getByText } = await setup();

    const expectedFullName = 'John Appleseed';
    const expectedJobTitle = 'Software Engineer';
    const expectedEmailAddress = 'john@test.com';
    const expectedPhoneNumber = '01234 345634';

    fixture.detectChanges();

    expect(getByText(expectedFullName)).toBeTruthy();
    expect(getByText(expectedJobTitle)).toBeTruthy();
    expect(getByText(expectedEmailAddress)).toBeTruthy();
    expect(getByText(expectedPhoneNumber)).toBeTruthy();
  });

  it('should show the username', async () => {
    const { fixture, getByText } = await setup();

    const expectedUserName = 'testUser';
    fixture.detectChanges();

    expect(getByText(expectedUserName)).toBeTruthy();
  });

  it('should hide the password before clicking show', async () => {
    const { fixture, getByText } = await setup();

    const expectedHiddenPassword = '******';
    fixture.detectChanges();

    expect(getByText(expectedHiddenPassword)).toBeTruthy();
  });

  // it('should hide the password before clicking show', async () => {
  //   const { fixture, getByText } = await setup();

  //   const expectedHiddenPassword = '******';
  //   const showPasswordButton = getByText('Show password');

  //   fireEvent.click
  //   fixture.detectChanges();

  //   expect(getByText(expectedHiddenPassword)).toBeTruthy();
  // });
});
