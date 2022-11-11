import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithoutReturnUrl, MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { CountryOfBirthComponent } from './country-of-birth.component';

describe('CountryOfBirthComponent', () => {
  async function setup(returnUrl = true) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      CountryOfBirthComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          FormBuilder,
          {
            provide: WorkerService,
            useClass: returnUrl ? MockWorkerServiceWithUpdateWorker : MockWorkerServiceWithoutReturnUrl,
          },
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {
                parent: {
                  url: [{ path: returnUrl ? 'staff-record-summary' : 'mocked-uid' }],
                },
              },
              parent: {
                snapshot: {
                  data: {
                    establishment: { uid: 'mocked-uid' },
                  },
                  url: [{ path: '' }],
                },
              },
            },
          },
        ],
      },
    );

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const workerService = injector.inject(WorkerService);

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const workerServiceSpy = spyOn(workerService, 'updateWorker').and.callThrough();
    const submitSpy = spyOn(component, 'setSubmitAction').and.callThrough();

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByTestId,
      routerSpy,
      submitSpy,
      workerServiceSpy,
    };
  }

  it('should render the CountryOfBirthComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('progress bar', () => {
    it('should render the progress bar when in the flow', async () => {
      const { getByTestId } = await setup(false);

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bar when outside the flow', async () => {
      const { queryByTestId } = await setup();

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button , skip this question  and 'View this staff record' link, if a return url is not provided`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it(`should show 'Save' cta button and 'Cancel' link if a return url is provided`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it(`should call submit data and navigate with the correct url when 'Save and continue' is clicked`, async () => {
      const { component, getByText, routerSpy } = await setup(false);

      const button = getByText('Save and continue');
      fireEvent.click(button);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'main-job-start-date',
      ]);
    });

    it(`should call submit data and navigate with the correct url when  'United Kingdom' radio button is selected and 'Save and continue' is clicked`, async () => {
      const { component, fixture, getByText, getByLabelText, submitSpy, workerServiceSpy, routerSpy } = await setup(
        false,
      );

      fireEvent.click(getByLabelText('United Kingdom'));
      fireEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({ countryOfBirthKnown: 'United Kingdom', countryOfBirthName: null });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        countryOfBirth: { value: 'United Kingdom' },
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'staff-record',
        component.worker.uid,
        'main-job-start-date',
      ]);
    });

    it('should navigate to year-arrived-uk page when skipping the question in the flow', async () => {
      const { component, routerSpy, getByText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const skipButton = getByText('Skip this question');
      fireEvent.click(skipButton);

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceId, 'staff-record', workerId, 'year-arrived-uk']);
    });

    it('should navigate to staff-summary-page page when pressing Save and no value is entered', async () => {
      const { component, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const link = getByText('Save');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing Save and United Kingdom is selected', async () => {
      const { component, fixture, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const radioButton = getByText('United Kingdom');
      fireEvent.click(radioButton);

      const link = getByText('Save');
      fireEvent.click(link);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should navigate to year-arrived-uk-summary-flow page when pressing Save and other country is selected', async () => {
      const { component, fixture, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const radioButton = getByText('Other');
      fireEvent.click(radioButton);

      const link = getByText('Save');
      fireEvent.click(link);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
        'year-arrived-uk-summary-flow',
      ]);
    });

    it('should navigate to year-arrived-uk-summary-flow page when pressing Save and I do not know is selected', async () => {
      const { component, fixture, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const radioButton = getByText('Other');
      fireEvent.click(radioButton);

      const link = getByText('Save');
      fireEvent.click(link);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
        'year-arrived-uk-summary-flow',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing cancel', async () => {
      const { component, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const link = getByText('Cancel');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });
  });
  describe('error messages', () => {
    it('returns an error if an invalid country is entered', async () => {
      const { component, fixture, getByText, getAllByText, getByLabelText } = await setup(false);

      component.availableCountries = [{ id: 1, country: 'France' }];
      userEvent.click(getByLabelText('Other'));
      fixture.detectChanges();
      userEvent.type(getByLabelText('Country (optional)'), 'xxxxxxx');
      userEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      expect(getAllByText('Enter a valid country').length).toEqual(2);
    });
  });
});
