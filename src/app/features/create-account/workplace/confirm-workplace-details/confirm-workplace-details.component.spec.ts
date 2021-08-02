import { HttpClientTestingModule } from '@angular/common/http/testing';
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
import { fireEvent, render } from '@testing-library/angular';

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

  it('should create ConfirmWorkplaceDetailsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show "CQC location ID" field and "Name and address" field when it is CQC regulated with a location ID', async () => {
    const { component, fixture, getByText } = await setup();
    const locationIdField = 'CQC location ID';
    const nameAndAddressField = 'Name and address';

    component.workplace.isCQC = true;
    component.locationAddress.locationId = '123';

    component.createAccountNewDesign = true;
    component.setWorkplaceDetails();
    fixture.detectChanges();

    expect(getByText(locationIdField)).toBeTruthy();
    expect(getByText(nameAndAddressField)).toBeTruthy();
  });

  it('should show "Name" field and "Address" field when it does not have a location ID', async () => {
    const { component, fixture, getByText } = await setup();
    const nameField = 'Name';
    const addressField = 'Address';

    component.workplace.isCQC = true;
    component.locationAddress.locationId = null;

    component.createAccountNewDesign = true;
    component.setWorkplaceDetails();
    fixture.detectChanges();

    expect(getByText(nameField)).toBeTruthy();
    expect(getByText(addressField)).toBeTruthy();
  });

  it('should include the workplace name in nameAndAddress if CQC regulated with a location ID', async () => {
    const { component, fixture } = await setup();

    component.workplace.isCQC = true;
    component.locationAddress.locationId = '123';

    component.createAccountNewDesign = true;
    component.setNameAndAddress();
    fixture.detectChanges();

    expect(component.nameAndAddress).toContain('Workplace Name');
  });

  it('should not include the workplace name in nameAndAddress if CQC regulated with a location ID', async () => {
    const { component, fixture } = await setup();

    component.workplace.isCQC = false;
    component.locationAddress.locationId = null;

    component.createAccountNewDesign = true;
    component.setNameAndAddress();
    fixture.detectChanges();

    expect(component.nameAndAddress).not.toContain('Workplace Name');
  });

  it('should show workplace details', async () => {
    const { component, fixture, getByText } = await setup();

    const expectedLocationName = 'Workplace Name';
    const expectedAddressLine1 = '1 Street';
    const expectedAddressLine2 = 'Second Line';
    const expectedAddressLine3 = 'Third Line';
    const expectedTownCity = 'Manchester';
    const expectedPostalCode = 'ABC 123';
    const expectedCounty = 'Greater Manchester';

    component.createAccountNewDesign = true;
    component.setWorkplaceDetails();
    fixture.detectChanges();

    expect(getByText(expectedLocationName, { exact: false })).toBeTruthy();
    expect(getByText(expectedAddressLine1, { exact: false })).toBeTruthy();
    expect(getByText(expectedAddressLine2, { exact: false })).toBeTruthy();
    expect(getByText(expectedAddressLine3, { exact: false })).toBeTruthy();
    expect(getByText(expectedTownCity, { exact: false })).toBeTruthy();
    expect(getByText(expectedPostalCode, { exact: false })).toBeTruthy();
    expect(getByText(expectedCounty, { exact: false })).toBeTruthy();
  });

  it('should show main service details', async () => {
    const { component, fixture, getByText } = await setup();

    const expectedMainService = 'Name of service';

    component.createAccountNewDesign = true;
    component.setWorkplaceDetails();
    fixture.detectChanges();

    expect(getByText(expectedMainService, { exact: false })).toBeTruthy();
  });

  describe('Change links', () => {
    it('should always display two change links', async () => {
      const { getAllByText } = await setup();

      const changeLinks = getAllByText('Change');

      expect(changeLinks.length).toEqual(2);
    });

    it('should set the change link for workplace address to `find-your-workplace` when CQC regulated with location ID', async () => {
      const { component, fixture, getAllByText } = await setup();

      component.locationAddress.locationId = '123';
      component.createAccountNewDesign = true;
      fixture.detectChanges();

      const changeWorkplaceAddressLink = getAllByText('Change')[0];
      fireEvent.click(changeWorkplaceAddressLink);

      expect(changeWorkplaceAddressLink.getAttribute('href')).toBe('/registration/find-workplace');
    });
  });
});
