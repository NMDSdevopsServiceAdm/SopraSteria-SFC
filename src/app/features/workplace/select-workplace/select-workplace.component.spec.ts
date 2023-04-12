import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { BehaviorSubject, of } from 'rxjs';

import { SelectWorkplaceComponent } from './select-workplace.component';

describe('SelectWorkplaceComponent', () => {
  async function setup(manyLocationAddresses = false) {
    const { fixture, getByText, getAllByText, queryByText, getByTestId, queryByTestId } = await render(
      SelectWorkplaceComponent,
      {
        imports: [SharedModule, RouterTestingModule, HttpClientTestingModule, FormsModule, ReactiveFormsModule],
        providers: [
          UntypedFormBuilder,
          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService,
          },
          {
            provide: WorkplaceService,
            useFactory: MockWorkplaceService.factory({ value: 'Private Sector' }, manyLocationAddresses),
            deps: [HttpClient],
          },
        ],
      },
    );

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const workplaceService = injector.inject(WorkplaceService) as WorkplaceService;
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;

    const spy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      spy,
      getAllByText,
      queryByText,
      getByText,
      getByTestId,
      queryByTestId,
      workplaceService,
      establishmentService,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the radio button form if there are less than 5 location addresses for a given postcode', async () => {
    const { getByTestId, queryByTestId } = await setup();

    expect(getByTestId('radio-button-form')).toBeTruthy();
    expect(queryByTestId('dropdown-form')).toBeFalsy();
  });

  it('should render the dropdown form if there are 5 or more location addresses for a given postcode', async () => {
    const { getByTestId, queryByTestId } = await setup(true);

    expect(getByTestId('dropdown-form')).toBeTruthy();
    expect(queryByTestId('radio-button-form')).toBeFalsy();
  });

  it('should show the Save and return button and a Cancel link', async () => {
    const { getByText } = await setup();

    expect(getByText('Save and return')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('should render the go back and try again link with the correct url', async () => {
    const { component, getByText } = await setup();

    const link = getByText('go back and try again');
    expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/regulated-by-cqc`);
  });

  it('should show the names and towns/cities of the companies listed', async () => {
    const { component, fixture, queryByText, getAllByText } = await setup();

    component.locationAddresses[0].locationName = 'Workplace Name';
    component.locationAddresses[1].locationName = 'Test Care Home';
    fixture.detectChanges();
    const firstLocationName = 'Workplace Name';
    const secondLocationName = 'Test Care Home';
    const townCity = 'Manchester';

    expect(queryByText(firstLocationName, { exact: false })).toBeTruthy();
    expect(queryByText(secondLocationName, { exact: false })).toBeTruthy();
    expect(getAllByText(townCity, { exact: false }).length).toBe(2);
  });

  describe('submitting data', () => {
    it('should call the establishmentExistsCheck when selecting workplace', async () => {
      const { component, fixture, getByText, workplaceService } = await setup();

      const workplaceSpy = spyOn(workplaceService, 'checkIfEstablishmentExists').and.returnValue(of({ exists: false }));

      const locationId = component.locationAddresses[0].locationId;
      const workplaceRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="0"]`);
      fireEvent.click(workplaceRadioButton);

      const continueButton = getByText('Save and return');
      fireEvent.click(continueButton);

      expect(workplaceSpy).toHaveBeenCalledWith(locationId);
    });

    it('should navigate to the cannot-create-account url when selecting the workplace, if the establishment already exists in the service', async () => {
      const { component, fixture, getByText, spy, workplaceService } = await setup();

      spyOn(workplaceService, 'checkIfEstablishmentExists').and.returnValue(of({ exists: true }));

      const workplaceRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="0"]`);
      fireEvent.click(workplaceRadioButton);

      const continueButton = getByText('Save and return');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(
        [`workplace/${component.establishmentService.establishmentId}`, 'cannot-create-account'],
        {
          state: { returnTo: `workplace/${component.establishmentService.establishmentId}/select-workplace` },
        },
      );
    });

    it('should navigate to the back to the workplace page when workplace selected and the establishment does not already exists in the service', async () => {
      const { getByText, fixture, spy, establishmentService } = await setup();

      const establishmentServiceSpy = spyOn(establishmentService, 'updateLocationDetails').and.returnValue(of({}));
      const firstWorkplaceRadioButton = fixture.nativeElement.querySelector(`input[ng-reflect-value="0"]`);
      fireEvent.click(firstWorkplaceRadioButton);

      const continueButton = getByText('Save and return');
      fireEvent.click(continueButton);

      expect(establishmentServiceSpy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace' });
    });

    it('should navigate back to workplace page when the cancel link is clicked', async () => {
      const { getByText, spy } = await setup();

      fireEvent.click(getByText('Cancel'));
      expect(spy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    });
  });

  describe('error messages', () => {
    it('should display an error message when the address has not been selected and the button is clicked', async () => {
      const { component, getByText, getAllByText, fixture } = await setup();

      component.workplaceService.selectedLocationAddress$ = new BehaviorSubject(null);
      component.ngOnInit();
      const form = component.form;
      fireEvent.click(getByText('Save and return'));
      fixture.detectChanges();

      expect(form.invalid).toBeTruthy();
      expect(getAllByText(`Select your workplace if it's displayed`).length).toEqual(2);
    });
  });

  describe('setBackLink()', () => {
    it('should set the back link to the create-account url when no returnTo state is passed, while in the registration flow', async () => {
      const { component } = await setup();
      const backService = TestBed.inject(BackService) as BackService;
      const backLinkSpy = spyOn(backService, 'setBackLink');

      component.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: [`workplace/${component.establishmentService.establishmentId}/regulated-by-cqc`],
      });
    });
  });
});
