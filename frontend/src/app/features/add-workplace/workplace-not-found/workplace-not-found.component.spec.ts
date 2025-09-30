import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { SanitizePostcodeUtil } from '@core/utils/sanitize-postcode-util';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { AddWorkplaceModule } from '../add-workplace.module';
import { WorkplaceNotFoundComponent } from './workplace-not-found.component';

fdescribe('WorkplaceNotFoundComponent', () => {
  async function setup(
    postcodeOrLocationId = '',
    searchMethod = '',
    workplaceNotFound = false,
    useDifferentLocationIdOrPostcode = null,
    addWorkplaceFlow = true,
  ) {
    const setupTools = await render(WorkplaceNotFoundComponent, {
      imports: [SharedModule, AddWorkplaceModule, ReactiveFormsModule],
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
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const navigateSpy = spyOn(router, 'navigate');
    navigateSpy.and.returnValue(Promise.resolve(true));

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
      navigateSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the CQC location id or postcode entered in the previous page', async () => {
    const inputtedPostcode = 'SE1 1AA';
    const { getByText } = await setup(inputtedPostcode);

    expect(getByText(inputtedPostcode)).toBeTruthy();
  });

  it('should render the workplace progress bar and the user progress bar', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('progress-bar-1')).toBeTruthy();
  });

  it('should not render the progress bars when accessed from outside the flow', async () => {
    const { queryByTestId } = await setup('', '', false, null, false);

    expect(queryByTestId('progress-bar-1')).toBeFalsy();
  });

  describe('Parent messages', () => {
    it('should display add workplace version of heading', async () => {
      const { getByText } = await setup();
      const expectedHeading = 'We could not find the workplace';

      expect(getByText(expectedHeading)).toBeTruthy();
    });

    it('should display add workplace version of question', async () => {
      const { getByText } = await setup();
      const expectedQuestion = 'Do you want to try find the workplace with a different CQC location ID or postcode?';

      expect(getByText(expectedQuestion)).toBeTruthy();
    });

    it('should display add workplace version of No answer', async () => {
      const { getByText } = await setup();
      const expectedNoAnswer = `No, I'll enter the workplace details myself`;

      expect(getByText(expectedNoAnswer)).toBeTruthy();
    });
  });

  describe('Parent journey', () => {
    it('should navigate to add-workplace/find-workplace when selecting yes', async () => {
      const { getByText, navigateSpy, getByRole } = await setup();
      const yesRadioButton = getByRole('radio', { name: 'Yes' });
      fireEvent.click(yesRadioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(navigateSpy).toHaveBeenCalledWith(['/add-workplace', 'find-workplace']);
    });

    it('should navigate to add-workplace/confirm-workplace-details/find-workplace when selecting yes when outside the flow', async () => {
      const { getByText, navigateSpy, getByRole } = await setup('', '', false, null, false);
      const yesRadioButton = getByRole('radio', { name: 'Yes' });
      fireEvent.click(yesRadioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(navigateSpy).toHaveBeenCalledWith(['/add-workplace/confirm-workplace-details', 'find-workplace']);
    });

    it('should navigate to add-workplace/workplace-name-address when selecting no', async () => {
      const { getByText, getByRole, navigateSpy } = await setup();
      const noRadioButton = getByRole('radio', { name: /^No/ });
      fireEvent.click(noRadioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(navigateSpy).toHaveBeenCalledWith(['/add-workplace', 'workplace-name-address']);
    });

    it('should navigate to add-workplace/confirm-workplace-details/workplace-name-address when selecting no', async () => {
      const { getByText, getByRole, navigateSpy } = await setup('', '', false, null, false);
      const noRadioButton = getByRole('radio', { name: /^No/ });
      fireEvent.click(noRadioButton);

      const continueButton = getByText('Continue');
      fireEvent.click(continueButton);

      expect(navigateSpy).toHaveBeenCalledWith(['/add-workplace/confirm-workplace-details', 'workplace-name-address']);
    });

    it('should display the correct heading', async () => {
      const { component, fixture, getByText } = await setup();
      const expectedHeading = 'We could not find the workplace';
      component.isParent = true;
      fixture.detectChanges();

      expect(getByText(expectedHeading)).toBeTruthy();
    });
  });

  describe('prefillForm()', () => {
    it('should preselect the "Yes" radio button if useDifferentLocationIdOrPostcode has been set to true in the service', async () => {
      const { component } = await setup('', '', false, true);

      const form = component.form;
      expect(form.valid).toBeTruthy();
      expect(form.value.useDifferentLocationIdOrPostcode).toBe('yes');
    });

    it('should preselect the "No" radio button if useDifferentLocationIdOrPostcode has been set to false in the service', async () => {
      const { component } = await setup('', '', false, false);

      const form = component.form;
      expect(form.valid).toBeTruthy();
      expect(form.value.useDifferentLocationIdOrPostcode).toBe('no');
    });

    it('should not preselect any radio buttons if useDifferentLocationIdOrPostcode has not been set in the service', async () => {
      const { component } = await setup('', '', false, null);

      const form = component.form;
      expect(form.invalid).toBeTruthy();
      expect(form.value.useDifferentLocationIdOrPostcode).not.toBe('yes');
      expect(form.value.useDifferentLocationIdOrPostcode).not.toBe('no');
    });
  });

  describe('sanitizePostcode', () => {
    it('should only sanitize the postcode if the search method is postcode', async () => {
      const { component } = await setup('se11aa', 'postcode');
      const sanitizePostcodeSpy = spyOn(SanitizePostcodeUtil, 'sanitizePostcode');
      component.sanitizePostcode();

      expect(sanitizePostcodeSpy).toHaveBeenCalled();
    });

    it('should not sanitize the postcode if the search method is locationID', async () => {
      const { component } = await setup('se11aa', 'locationID');
      const sanitizePostcodeSpy = spyOn(SanitizePostcodeUtil, 'sanitizePostcode');
      component.sanitizePostcode();

      expect(sanitizePostcodeSpy).not.toHaveBeenCalled();
    });

    it('should display the sanitized postcode entered in the previous page', async () => {
      const { getByText, component, fixture } = await setup('se11aa', 'postcode');
      component.sanitizePostcode();
      fixture.detectChanges();

      expect(getByText('SE1 1AA')).toBeTruthy();
    });
  });
});
