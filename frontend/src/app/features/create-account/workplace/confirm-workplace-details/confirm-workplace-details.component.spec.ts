import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { EmployerType } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { RegistrationService } from '@core/services/registration.service';
import { UserService } from '@core/services/user.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockRegistrationServiceWithMainService } from '@core/test-utils/MockRegistrationService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { RegistrationModule } from '@features/registration/registration.module';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { ConfirmWorkplaceDetailsComponent } from './confirm-workplace-details.component';

describe('ConfirmWorkplaceDetailsComponent', () => {
  async function setup(typeOfEmployer: EmployerType = { value: 'Private Sector' }) {
    const { fixture, getByText, getAllByText, queryByText, getByTestId } = await render(
      ConfirmWorkplaceDetailsComponent,
      {
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
            useFactory: MockRegistrationServiceWithMainService.factory(typeOfEmployer),
            deps: [HttpClient],
          },
          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService,
          },
          {
            provide: UserService,
            useClass: MockUserService,
          },
        ],
      },
    );

    const component = fixture.componentInstance;
    const setTypeOfEmployerSpy = spyOn(component, 'setTypeOfEmployer').and.callThrough();

    return {
      fixture,
      component,
      getAllByText,
      queryByText,
      getByText,
      getByTestId,
      setTypeOfEmployerSpy,
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

    component.setWorkplaceDetails();
    fixture.detectChanges();

    expect(getByText(nameField)).toBeTruthy();
    expect(getByText(addressField)).toBeTruthy();
  });

  it('should include the workplace name in nameAndAddress if CQC regulated with a location ID', async () => {
    const { component, fixture } = await setup();

    component.workplace.isCQC = true;
    component.locationAddress.locationId = '123';

    component.setNameAndAddress();
    fixture.detectChanges();

    expect(component.nameAndAddress).toContain('Workplace Name');
  });

  it('should not include the workplace name in nameAndAddress if CQC regulated with a location ID', async () => {
    const { component, fixture } = await setup();

    component.workplace.isCQC = false;
    component.locationAddress.locationId = null;

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

    component.setWorkplaceDetails();
    fixture.detectChanges();

    expect(getByText(expectedMainService, { exact: false })).toBeTruthy();
  });

  it('should show total staff details', async () => {
    const { component, fixture, getByText } = await setup();

    const expectedTotalStaff = 4;

    component.setWorkplaceDetails();
    fixture.detectChanges();

    expect(getByText(expectedTotalStaff, { exact: false })).toBeTruthy();
  });

  it('should show type of employer with correct text when Local authority (adult services) is selected', async () => {
    const { component, fixture, setTypeOfEmployerSpy, getByText } = await setup({
      value: 'Local Authority (adult services)',
    });

    component.ngOnInit();
    fixture.detectChanges();
    const expectedTypeOfEmployer = 'Local authority (adult services)';

    component.setWorkplaceDetails();
    fixture.detectChanges();

    expect(getByText(expectedTypeOfEmployer)).toBeTruthy();
    expect(setTypeOfEmployerSpy).toHaveBeenCalled();
  });

  it('should show type of employer with correct text when Local authority (generic, other) is selected', async () => {
    const { component, fixture, setTypeOfEmployerSpy, getByText } = await setup({
      value: 'Local Authority (generic/other)',
    });

    component.ngOnInit();
    fixture.detectChanges();
    const expectedTypeOfEmployer = 'Local authority (generic, other)';

    component.setWorkplaceDetails();
    fixture.detectChanges();

    expect(getByText(expectedTypeOfEmployer)).toBeTruthy();
    expect(setTypeOfEmployerSpy).toHaveBeenCalled();
  });

  it('should show type of employer with correct text when Private sector is selected', async () => {
    const { component, fixture, setTypeOfEmployerSpy, getByText } = await setup();

    component.ngOnInit();
    fixture.detectChanges();
    const expectedTypeOfEmployer = 'Private sector';

    component.setWorkplaceDetails();
    fixture.detectChanges();

    expect(getByText(expectedTypeOfEmployer)).toBeTruthy();
    expect(setTypeOfEmployerSpy).toHaveBeenCalled();
  });

  it('should show type of employer with correct text when Voluntary, charity, not for profit is selected', async () => {
    const { component, fixture, setTypeOfEmployerSpy, getByText } = await setup({ value: 'Voluntary / Charity' });

    component.ngOnInit();
    fixture.detectChanges();
    const expectedTypeOfEmployer = 'Voluntary, charity, not for profit';

    component.setWorkplaceDetails();
    fixture.detectChanges();

    expect(getByText(expectedTypeOfEmployer)).toBeTruthy();
    expect(setTypeOfEmployerSpy).toHaveBeenCalled();
  });

  it('should show type of employer with correct text when Other is selected and no input', async () => {
    const { component, fixture, setTypeOfEmployerSpy, getByText } = await setup({ value: 'Other' });

    component.ngOnInit();
    fixture.detectChanges();
    const expectedTypeOfEmployer = 'Other';

    component.setWorkplaceDetails();
    fixture.detectChanges();

    expect(getByText(expectedTypeOfEmployer)).toBeTruthy();
    expect(setTypeOfEmployerSpy).toHaveBeenCalled();
  });

  it('should show type of employer with correct text when Other is selected and there is an input', async () => {
    const { component, fixture, setTypeOfEmployerSpy, getByText } = await setup({
      value: 'Other',
      other: 'other employer type',
    });

    component.ngOnInit();
    fixture.detectChanges();
    const expectedTypeOfEmployer = 'other employer type';

    component.setWorkplaceDetails();
    fixture.detectChanges();

    expect(getByText(expectedTypeOfEmployer)).toBeTruthy();
    expect(setTypeOfEmployerSpy).toHaveBeenCalled();
  });

  describe('Change links', () => {
    it('should set the change link for location ID to `find-workplace` when CQC regulated with location ID', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.workplace.isCQC = true;
      component.locationAddress.locationId = '123';

      component.setWorkplaceDetails();
      fixture.detectChanges();

      const workplaceNameAddressSummaryList = within(getByTestId('workplaceNameAddress'));
      const changeLink = workplaceNameAddressSummaryList.getByText('Change');

      expect(changeLink.getAttribute('href')).toBe('/registration/confirm-details/find-workplace');
    });

    it('should set the change link for workplace address to `find-workplace` when location ID is null and workplace is CQC regulated', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.workplace.isCQC = true;
      component.locationAddress.locationId = null;

      component.setWorkplaceDetails();
      fixture.detectChanges();

      const workplaceNameAddressSummaryList = within(getByTestId('workplaceNameAddress'));
      const changeLink = workplaceNameAddressSummaryList.getByText('Change');

      expect(changeLink.getAttribute('href')).toBe('/registration/confirm-details/find-workplace');
    });

    it('should set the change link for workplace address to `workplace-name-address` when workplace is not CQC regulated', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.workplace.isCQC = false;
      component.locationAddress.locationId = null;

      component.setWorkplaceDetails();
      fixture.detectChanges();

      const workplaceNameAddressSummaryList = within(getByTestId('workplaceNameAddress'));
      const changeLink = workplaceNameAddressSummaryList.getByText('Change');

      expect(changeLink.getAttribute('href')).toBe('/registration/confirm-details/workplace-name-address');
    });

    it('should set the change link for main service to `select-main-service`', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.setWorkplaceDetails();
      fixture.detectChanges();

      const mainServiceSummaryList = within(getByTestId('mainService'));
      const changeLink = mainServiceSummaryList.getByText('Change');

      expect(changeLink.getAttribute('href')).toBe('/registration/confirm-details/select-main-service');
    });

    it('should set the change link for total staff to `add-total-staff`', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.setWorkplaceDetails();
      fixture.detectChanges();

      const totalStaffSummaryList = within(getByTestId('totalStaff'));
      const changeLink = totalStaffSummaryList.getByText('Change');

      expect(changeLink.getAttribute('href')).toBe('/registration/confirm-details/add-total-staff');
    });

    it('should set the change link for type of employer to `type-of-employer`', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.setWorkplaceDetails();
      fixture.detectChanges();

      const typeOfEmployerSummaryList = within(getByTestId('typeOfEmployer'));
      const changeLink = typeOfEmployerSummaryList.getByText('Change');

      expect(changeLink.getAttribute('href')).toBe('/registration/confirm-details/type-of-employer');
    });
  });
});
