import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { MockWorkplaceServiceWithMainService } from '@core/test-utils/MockWorkplaceService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { AddWorkplaceModule } from '../add-workplace.module';
import { ConfirmWorkplaceDetailsComponent } from './confirm-workplace-details.component';

describe('ConfirmWorkplaceDetailsComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, queryByText, getByTestId } = await render(
      ConfirmWorkplaceDetailsComponent,
      {
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
        ],
      },
    );

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      getAllByText,
      queryByText,
      getByText,
      getByTestId,
      spy,
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

  it('should show "Name" field and "Address" field when it is not CQC regulated and does not have a location ID', async () => {
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

  it('should show the location ID when it is CQC regulated with a location ID', async () => {
    const { component, fixture, getByText } = await setup();
    const locationId = '123';

    component.workplace.isCQC = true;
    component.locationAddress.locationId = '123';

    component.setWorkplaceDetails();
    fixture.detectChanges();

    expect(getByText(locationId)).toBeTruthy();
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

    const expectedMainService = 'Shared lives';

    component.setWorkplaceDetails();
    fixture.detectChanges();

    expect(getByText(expectedMainService, { exact: false })).toBeTruthy();
  });

  it('should navigate to thank-you page when you click Submit details', async () => {
    const { fixture, spy, getByText } = await setup();

    fixture.detectChanges();

    const submitButton = getByText('Submit details');
    fireEvent.click(submitButton);

    expect(spy).toHaveBeenCalledWith(['/add-workplace/thank-you']);
  });

  describe('Back link', () => {
    it('should set the back link to add-total-staff', async () => {
      const { component, fixture } = await setup();
      const backLinkSpy = spyOn(component.backService, 'setBackLink');

      fixture.detectChanges();

      component.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['/add-workplace', 'add-total-staff'],
      });
    });
  });

  describe('Change links', () => {
    it('should always display three change links', async () => {
      const { getAllByText } = await setup();

      const changeLinks = getAllByText('Change');

      expect(changeLinks.length).toEqual(3);
    });

    it('should set the change link for location ID to `find-workplace` when CQC regulated with location ID', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.workplace.isCQC = true;
      component.locationAddress.locationId = '123';

      component.setWorkplaceDetails();
      fixture.detectChanges();

      const workplaceNameAddressSummaryList = within(getByTestId('workplaceNameAddress'));
      const changeLink = workplaceNameAddressSummaryList.getByText('Change');

      expect(changeLink.getAttribute('href')).toBe('/add-workplace/find-workplace');
    });

    it('should set the change link for workplace address to `find-workplace` when location ID is null and workplace is CQC regulated', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.workplace.isCQC = true;
      component.locationAddress.locationId = null;

      component.setWorkplaceDetails();
      fixture.detectChanges();

      const workplaceNameAddressSummaryList = within(getByTestId('workplaceNameAddress'));
      const changeLink = workplaceNameAddressSummaryList.getByText('Change');

      expect(changeLink.getAttribute('href')).toBe('/add-workplace/find-workplace');
    });

    it('should set the change link for workplace address to `workplace-name-address` when workplace is not CQC regulated', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.workplace.isCQC = false;
      component.locationAddress.locationId = null;

      component.setWorkplaceDetails();
      fixture.detectChanges();

      const workplaceNameAddressSummaryList = within(getByTestId('workplaceNameAddress'));
      const changeLink = workplaceNameAddressSummaryList.getByText('Change');

      expect(changeLink.getAttribute('href')).toBe('/add-workplace/workplace-name-address');
    });

    it('should set the change link for main service to `select-main-service`', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.setWorkplaceDetails();
      fixture.detectChanges();

      const workplaceNameAddressSummaryList = within(getByTestId('mainService'));
      const changeLink = workplaceNameAddressSummaryList.getByText('Change');

      expect(changeLink.getAttribute('href')).toEqual('/add-workplace/select-main-service');
    });
  });
});
