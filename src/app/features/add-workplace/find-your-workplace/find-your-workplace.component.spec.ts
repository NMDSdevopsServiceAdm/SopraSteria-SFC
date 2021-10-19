import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { LocationService } from '@core/services/location.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockLocationService } from '@core/test-utils/MockLocationService';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { BehaviorSubject, throwError } from 'rxjs';

import { AddWorkplaceModule } from '../add-workplace.module';
import { FindYourWorkplaceComponent } from './find-your-workplace.component';

describe('FindYourWorkplaceComponent', () => {
  async function setup() {
    const component = await render(FindYourWorkplaceComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule,
        HttpClientTestingModule,
        AddWorkplaceModule,
        ReactiveFormsModule,
      ],
      providers: [
        BackService,
        {
          provide: LocationService,
          useClass: MockLocationService,
        },
        {
          provide: WorkplaceService,
          useClass: MockWorkplaceService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              parent: {
                url: [
                  {
                    path: 'add-workplace',
                  },
                ],
              },
            },
          },
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const componentInstance = component.fixture.componentInstance;
    const locationService = injector.inject(LocationService) as LocationService;

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      router,
      componentInstance,
      locationService,
      spy,
    };
  }

  it('should render a FindYourWorkplaceComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should prefill the form if postcodeOrLocationId is already set in the service', async () => {
    const { component } = await setup();

    component.fixture.componentInstance.workplaceService.postcodeOrLocationId$ = new BehaviorSubject('AB1 2CD');
    component.fixture.componentInstance.ngOnInit();

    const form = component.fixture.componentInstance.form;
    expect(form.value.postcodeOrLocationID).toEqual('AB1 2CD');
    expect(form.valid).toBeTruthy();
  });

  it('should show add-workplace flow title', async () => {
    const { component } = await setup();
    const title = 'Find the workplace';
    expect(component.getByText(title)).toBeTruthy();
  });

  it('should show add-workplace flow hint message', async () => {
    const { component } = await setup();
    const hint = `We'll use its CQC location ID or workplace postcode to find the workplace in the Care Quality Commision database.`;
    expect(component.getByText(hint)).toBeTruthy();
  });

  it('should not lookup workplaces the form if the input is empty', async () => {
    const { component, locationService } = await setup();
    const findWorkplaceButton = component.getByText('Find workplace');
    const getLocationByPostcodeOrLocationID = spyOn(
      locationService,
      'getLocationByPostcodeOrLocationID',
    ).and.callThrough();

    fireEvent.click(findWorkplaceButton);

    component.fixture.detectChanges();

    expect(getLocationByPostcodeOrLocationID).not.toHaveBeenCalled();
  });

  it('should show add-workplace version of error message if the input is empty on submit', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;
    const findWorkplaceButton = component.getByText('Find workplace');

    fireEvent.click(findWorkplaceButton);

    component.fixture.detectChanges();

    expect(form.invalid).toBeTruthy();
    expect(component.getAllByText('Enter its CQC location ID or its workplace postcode', { exact: false }).length).toBe(
      2,
    );
  });

  it('should submit the value if value is inputted', async () => {
    const { component, locationService } = await setup();
    const form = component.fixture.componentInstance.form;
    const findWorkplaceButton = component.getByText('Find workplace');
    const getLocationByPostcodeOrLocationID = spyOn(
      locationService,
      'getLocationByPostcodeOrLocationID',
    ).and.callThrough();

    form.controls['postcodeOrLocationID'].setValue('LS1 1AA');

    fireEvent.click(findWorkplaceButton);

    component.fixture.detectChanges();

    expect(form.valid).toBeTruthy();
    expect(getLocationByPostcodeOrLocationID).toHaveBeenCalledWith('LS1 1AA');
  });

  it("should submit and go to your-workplace if there's only one address", async () => {
    const { component, spy } = await setup();
    const form = component.fixture.componentInstance.form;
    const findWorkplaceButton = component.getByText('Find workplace');

    form.controls['postcodeOrLocationID'].setValue('LS1 1AA');

    component.fixture.detectChanges();

    fireEvent.click(findWorkplaceButton);

    expect(spy).toHaveBeenCalledWith(['add-workplace', 'your-workplace']);
  });

  it("should submit and go to select-workplace if there's more than one address", async () => {
    const { component, spy } = await setup();
    const form = component.fixture.componentInstance.form;
    const findWorkplaceButton = component.getByText('Find workplace');

    form.controls['postcodeOrLocationID'].setValue('LS1 1AB');

    component.fixture.detectChanges();

    fireEvent.click(findWorkplaceButton);

    expect(spy).toHaveBeenCalledWith(['add-workplace', 'select-workplace']);
  });

  it("should submit and go to workplace-not-found if there's no addresses", async () => {
    const { component, spy, locationService } = await setup();
    const form = component.fixture.componentInstance.form;
    const findWorkplaceButton = component.getByText('Find workplace');

    form.controls['postcodeOrLocationID'].setValue('LS1 1AB');

    const errorResponse = new HttpErrorResponse({
      error: { code: `some code`, message: `some message.` },
      status: 404,
      statusText: 'Not found',
    });

    spyOn(locationService, 'getLocationByPostcodeOrLocationID').and.returnValue(throwError(errorResponse));

    component.fixture.detectChanges();

    fireEvent.click(findWorkplaceButton);

    expect(spy).toHaveBeenCalledWith(['add-workplace', 'workplace-not-found']);
  });

  it("should show error if server 500's", async () => {
    const { component, locationService } = await setup();
    const form = component.fixture.componentInstance.form;
    const findWorkplaceButton = component.getByText('Find workplace');

    form.controls['postcodeOrLocationID'].setValue('LS1 1AB');

    const errorResponse = new HttpErrorResponse({
      error: { code: `some code`, message: `some message.` },
      status: 500,
      statusText: 'Server error',
    });

    spyOn(locationService, 'getLocationByPostcodeOrLocationID').and.returnValue(throwError(errorResponse));

    component.fixture.detectChanges();

    fireEvent.click(findWorkplaceButton);

    expect(component.getAllByText('Server Error. code 500', { exact: false })).toBeTruthy();
  });

  describe('setBackLink', () => {
    it('should set the back link to `regulated-by-cqc` when returnToWorkplaceNotFound is set to false', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');
      component.fixture.componentInstance.returnToWorkplaceNotFound = false;
      component.fixture.detectChanges();

      component.fixture.componentInstance.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['add-workplace', 'regulated-by-cqc'],
      });
    });

    it('should set the back link to `workplace-not-found` when returnToWorkplaceNotFound is set to true', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');
      component.fixture.componentInstance.returnToWorkplaceNotFound = true;
      component.fixture.detectChanges();

      component.fixture.componentInstance.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['add-workplace', 'workplace-not-found'],
      });
    });

    it('should set the back link to `confirm-workplace-details` when returnToConfirmDetails is not null', async () => {
      const { component } = await setup();
      const backLinkSpy = spyOn(component.fixture.componentInstance.backService, 'setBackLink');

      component.fixture.componentInstance.returnToConfirmDetails = {
        url: ['add-workplace', 'confirm-workplace-details'],
      };
      component.fixture.componentInstance.setBackLink();

      expect(backLinkSpy).toHaveBeenCalledWith({
        url: ['add-workplace', 'confirm-workplace-details'],
      });
    });
  });
});
