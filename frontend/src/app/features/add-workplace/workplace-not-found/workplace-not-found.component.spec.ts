import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { SanitizePostcodeUtil } from '@core/utils/sanitize-postcode-util';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { AddWorkplaceModule } from '../add-workplace.module';
import { WorkplaceNotFoundComponent } from './workplace-not-found.component';

describe('WorkplaceNotFoundComponent', () => {
  async function setup(
    postcodeOrLocationId = '',
    searchMethod = '',
    workplaceNotFound = false,
    useDifferentLocationIdOrPostcode = null,
    addWorkplaceFlow = true,
  ) {
    const component = await render(WorkplaceNotFoundComponent, {
      imports: [SharedModule, AddWorkplaceModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: WorkplaceService,
          useClass: WorkplaceService,
          useValue: {
            postcodeOrLocationId$: {
              value: postcodeOrLocationId,
            },
            searchMethod$: {
              value: searchMethod,
            },
            workplaceNotFound$: {
              value: workplaceNotFound,
              next: () => {
                return true;
              },
            },
            useDifferentLocationIdOrPostcode$: {
              value: useDifferentLocationIdOrPostcode,
              next: () => {
                return true;
              },
            },
          },
          deps: [HttpClient],
        },
        {
          provide: EstablishmentService,
          useValue: {
            primaryWorkplace: {
              isParent: true,
            },
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              parent: {
                url: [
                  {
                    path: addWorkplaceFlow ? 'add-workplace' : 'add-workplace/confirm-workplace-details',
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

    const spy = spyOn(router, 'navigate');
    spy.and.returnValue(Promise.resolve(true));

    return {
      component,
      spy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the CQC location id or postcode entered in the previous page', async () => {
    const inputtedPostcode = 'SE1 1AA';
    const { component } = await setup(inputtedPostcode);

    expect(component.getByText(inputtedPostcode)).toBeTruthy();
  });

  it('should render the workplace progress bar and the user progress bar', async () => {
    const { component } = await setup();

    expect(component.getByTestId('progress-bar-1')).toBeTruthy();
  });

  it('should not render the progress bars when accessed from outside the flow', async () => {
    const { component } = await setup('', '', false, null, false);

    expect(component.queryByTestId('progress-bar-1')).toBeFalsy();
  });

  describe('Parent messages', () => {
    it('should display add workplace version of heading', async () => {
      const { component } = await setup();
      const expectedHeading = 'We could not find the workplace';

      expect(component.getByText(expectedHeading)).toBeTruthy();
    });

    it('should display add workplace version of question', async () => {
      const { component } = await setup();
      const expectedQuestion = 'Do you want to try find the workplace with a different CQC location ID or postcode?';

      expect(component.getByText(expectedQuestion)).toBeTruthy();
    });

    it('should display add workplace version of No answer', async () => {
      const { component } = await setup();
      const expectedNoAnswer = `No, I'll enter the workplace details myself`;

      expect(component.getByText(expectedNoAnswer)).toBeTruthy();
    });
  });

  describe('Parent journey', () => {
    it('should navigate to add-workplace/find-workplace when selecting yes', async () => {
      const { component, spy } = await setup();
      const yesRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="yes"]`);
      fireEvent.click(yesRadioButton);

      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['/add-workplace', 'find-workplace']);
    });

    it('should navigate to add-workplace/confirm-workplace-details/find-workplace when selecting yes when outside the flow', async () => {
      const { component, spy } = await setup('', '', false, null, false);
      const yesRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="yes"]`);
      fireEvent.click(yesRadioButton);

      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['/add-workplace/confirm-workplace-details', 'find-workplace']);
    });

    it('should navigate to add-workplace/workplace-name-address when selecting no', async () => {
      const { component, spy } = await setup();
      const noRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="no"]`);
      fireEvent.click(noRadioButton);

      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['/add-workplace', 'workplace-name-address']);
    });

    it('should navigate to add-workplace/confirm-workplace-details/workplace-name-address when selecting no', async () => {
      const { component, spy } = await setup('', '', false, null, false);
      const noRadioButton = component.fixture.nativeElement.querySelector(`input[ng-reflect-value="no"]`);
      fireEvent.click(noRadioButton);

      const continueButton = component.getByText('Continue');
      fireEvent.click(continueButton);

      expect(spy).toHaveBeenCalledWith(['/add-workplace/confirm-workplace-details', 'workplace-name-address']);
    });

    it('should display the correct heading', async () => {
      const { component } = await setup();
      const expectedHeading = 'We could not find the workplace';
      component.fixture.componentInstance.isParent = true;
      component.fixture.detectChanges();

      expect(component.getByText(expectedHeading)).toBeTruthy();
    });
  });

  describe('prefillForm()', () => {
    it('should preselect the "Yes" radio button if useDifferentLocationIdOrPostcode has been set to true in the service', async () => {
      const { component } = await setup('', '', false, true);

      const form = component.fixture.componentInstance.form;
      expect(form.valid).toBeTruthy();
      expect(form.value.useDifferentLocationIdOrPostcode).toBe('yes');
    });

    it('should preselect the "No" radio button if useDifferentLocationIdOrPostcode has been set to false in the service', async () => {
      const { component } = await setup('', '', false, false);

      const form = component.fixture.componentInstance.form;
      expect(form.valid).toBeTruthy();
      expect(form.value.useDifferentLocationIdOrPostcode).toBe('no');
    });

    it('should not preselect any radio buttons if useDifferentLocationIdOrPostcode has not been set in the service', async () => {
      const { component } = await setup('', '', false, null);

      const form = component.fixture.componentInstance.form;
      expect(form.invalid).toBeTruthy();
      expect(form.value.useDifferentLocationIdOrPostcode).not.toBe('yes');
      expect(form.value.useDifferentLocationIdOrPostcode).not.toBe('no');
    });
  });

  describe('sanitizePostcode', () => {
    it('should only sanitize the postcode if the search method is postcode', async () => {
      const { component } = await setup('se11aa', 'postcode');
      const sanitizePostcodeSpy = spyOn(SanitizePostcodeUtil, 'sanitizePostcode');
      component.fixture.componentInstance.sanitizePostcode();

      expect(sanitizePostcodeSpy).toHaveBeenCalled();
    });

    it('should not sanitize the postcode if the search method is locationID', async () => {
      const { component } = await setup('se11aa', 'locationID');
      const sanitizePostcodeSpy = spyOn(SanitizePostcodeUtil, 'sanitizePostcode');
      component.fixture.componentInstance.sanitizePostcode();

      expect(sanitizePostcodeSpy).not.toHaveBeenCalled();
    });

    it('should display the sanitized postcode entered in the previous page', async () => {
      const { component } = await setup('se11aa', 'postcode');
      component.fixture.componentInstance.sanitizePostcode();
      component.fixture.detectChanges();

      expect(component.getByText('SE1 1AA')).toBeTruthy();
    });
  });
});
