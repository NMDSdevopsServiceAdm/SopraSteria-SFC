import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationService } from '@core/services/registration.service';
import { UserService } from '@core/services/user.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockRegistrationServiceWithMainService } from '@core/test-utils/MockRegistrationService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { RegistrationModule } from '@features/registration/registration.module';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { queryByText, render } from '@testing-library/angular';

import { ConfirmWorkplaceDetailsComponent } from './confirm-workplace-details.component';

describe('ConfirmWorkplaceDetailsComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, queryByText } = await render(ConfirmWorkplaceDetailsComponent, {
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
          useClass: MockRegistrationServiceWithMainService,
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
        // {
        //   provide: ActivatedRoute,
        //   useValue: {
        //     snapshot: {
        //       parent: {
        //         url: [
        //           {
        //             path: 'registration',
        //           },
        //         ],
        //       },
        //     },
        //   },
        // },
        // FormBuilder,
      ],
    });

    const injector = getTestBed();
    // const router = injector.inject(Router) as Router;

    // const spy = spyOn(router, 'navigate');
    // spy.and.returnValue(Promise.resolve(true));

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      // spy,
      getAllByText,
      queryByText,
      getByText,
    };
  }

  it('should create ConfirmWorkplaceDetailsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show "CQC location ID" field and "Name and address" field when it is CQC regulated with a location ID', async () => {
    const { component, fixture, getByText } = await setup();
    const locationIdField = 'CQC location ID';
    const nameAndAddressField = 'Name and address';

    component.createAccountNewDesign = true;
    component.setWorkplaceDetails();
    fixture.detectChanges();

    expect(getByText(locationIdField)).toBeTruthy();
    expect(getByText(nameAndAddressField)).toBeTruthy();
  });

  it('should show "Name" field and "Address" field when it is CQC regulated without a location ID', async () => {
    const { component, fixture, getByText } = await setup();
    const nameField = 'Name';
    const addressField = 'Address';

    component.locationAddress.locationId = null;
    component.createAccountNewDesign = true;
    component.setWorkplaceDetails();
    fixture.detectChanges();

    expect(getByText(nameField)).toBeTruthy();
    expect(getByText(addressField)).toBeTruthy();
  });

  it('should show workplace details', async () => {
    const { component, fixture, getByText } = await setup();

    const expectedLocationName = 'Workplace Name';
    const expectedAddressLine1 = '1 Street';
    const expectedTownCity = 'Manchester';
    const expectedPostalCode = 'ABC 123';
    const expectedCounty = 'Greater Manchester';

    component.createAccountNewDesign = true;
    component.setWorkplaceDetails();
    fixture.detectChanges();

    expect(getByText(expectedLocationName, { exact: false })).toBeTruthy();
    expect(getByText(expectedAddressLine1, { exact: false })).toBeTruthy();
    expect(getByText(expectedTownCity, { exact: false })).toBeTruthy();
    expect(getByText(expectedPostalCode, { exact: false })).toBeTruthy();
    expect(getByText(expectedCounty, { exact: false })).toBeTruthy();
  });
});
