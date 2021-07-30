import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { MockWorkplaceServiceWithMainService } from '@core/test-utils/MockWorkplaceService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AddWorkplaceModule } from '../add-workplace.module';
import { ConfirmWorkplaceDetailsComponent } from './confirm-workplace-details.component';

describe('ConfirmWorkplaceDetailsComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, queryByText } = await render(ConfirmWorkplaceDetailsComponent, {
      imports: [
        SharedModule,
        AddWorkplaceModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        {
          provide: WorkplaceService,
          useClass: MockWorkplaceServiceWithMainService,
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

  it('should show "Name" field and "Address" field when it is not CQC regulated and does not have a location ID', async () => {
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

  it('should show the location ID when it is CQC regulated with a location ID', async () => {
    const { component, fixture, getByText } = await setup();
    const locationId = '123';

    component.workplace.isCQC = true;
    component.locationAddress.locationId = '123';

    component.createAccountNewDesign = true;
    component.setWorkplaceDetails();
    fixture.detectChanges();

    expect(getByText(locationId)).toBeTruthy();
  });

  it('should include the workplace name in nameAndAddress if CQC regulated with a location ID', async () => {
    const { component, fixture } = await setup();

    component.workplace.isCQC = true;
    component.locationAddress.locationId = '123';

    component.createAccountNewDesign = true;
    component.setAddress();
    fixture.detectChanges();

    expect(component.nameAndAddress).toContain('Test Care Home');
  });

  it('should not include the workplace name in nameAndAddress if CQC regulated with a location ID', async () => {
    const { component, fixture } = await setup();

    component.workplace.isCQC = false;
    component.locationAddress.locationId = null;

    component.createAccountNewDesign = true;
    component.setAddress();
    fixture.detectChanges();

    expect(component.nameAndAddress).not.toContain('Test Care Home');
  });

  it('should show workplace details', async () => {
    const { component, fixture, getByText } = await setup();

    const expectedLocationName = 'Test Care Home';
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

    const expectedMainService = 'Shared lives';

    component.createAccountNewDesign = true;
    component.setWorkplaceDetails();
    fixture.detectChanges();

    expect(getByText(expectedMainService, { exact: false })).toBeTruthy();
  });

  describe('Back link', () => {
    it('should set the back link to `new-select-main-service` when feature flag is on', async () => {
      const { component, fixture } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      component.createAccountNewDesign = true;
      fixture.detectChanges();

      component.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/add-workplace', 'new-select-main-service'],
      });
    });
  });

  it('should set the back link to `select-main-service` when feature flag is off', async () => {
    const { component, fixture } = await setup();
    const backLinkSpy = spyOn(component.backService, 'setBackLink');

    component.createAccountNewDesign = false;
    fixture.detectChanges();

    component.setBackLink();

    expect(backLinkSpy).toHaveBeenCalledWith({
      url: ['/add-workplace', 'select-main-service'],
    });
  });
});
