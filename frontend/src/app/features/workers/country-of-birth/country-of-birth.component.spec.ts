import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Worker } from '@core/model/worker.model';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithUpdateWorker, workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { CountryOfBirthComponent } from './country-of-birth.component';

describe('CountryOfBirthComponent', () => {
  async function setup(insideFlow = true, workerFields = {}) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      CountryOfBirthComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          UntypedFormBuilder,
          InternationalRecruitmentService,
          {
            provide: WorkerService,
            useFactory: MockWorkerServiceWithUpdateWorker.factory({ ...workerBuilder(), ...workerFields } as Worker),
            deps: [HttpClient],
          },
          {
            provide: ActivatedRoute,
            useValue: {
              parent: {
                snapshot: {
                  data: {
                    establishment: { uid: 'mocked-uid' },
                  },
                  url: [{ path: insideFlow ? 'staff-uid' : 'staff-record-summary' }],
                },
              },
              snapshot: {
                params: {},
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
      router,
    };
  }

  it('should render the CountryOfBirthComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('progress bar', () => {
    it('should render the progress bar when in the flow', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('progress-bar')).toBeTruthy();
    });

    it('should not render the progress bar when outside the flow', async () => {
      const { queryByTestId } = await setup(false);

      expect(queryByTestId('progress-bar')).toBeFalsy();
    });
  });

  describe('submit buttons', () => {
    it(`should show 'Save and continue' cta button , skip this question  and 'View this staff record' link, if a return url is not provided`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it(`should show 'Save' cta button and 'Cancel' link if a return url is provided`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it(`should call submit data and navigate to main-job-start-date page when 'United Kingdom' radio button is selected and 'Save and continue' is clicked`, async () => {
      const { component, fixture, getByText, getByLabelText, submitSpy, workerServiceSpy, routerSpy } = await setup();

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

    it(`should navigate to health-and-care-visa page when 'United Kingdom' is selected and worker has other nationality and British citizenship not known`, async () => {
      const workerFields = {
        nationality: { value: 'Other' },
        britishCitizenship: 'No',
      };

      const { component, fixture, getByText, getByLabelText, routerSpy } = await setup(true, workerFields);

      component.worker.nationality = { value: 'Other' };
      component.worker.britishCitizenship = 'No';
      fixture.detectChanges();

      fireEvent.click(getByLabelText('United Kingdom'));
      fireEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'staff-record',
        component.worker.uid,
        'health-and-care-visa',
      ]);
    });

    it(`should navigate to health-and-care-visa page when 'United Kingdom' is selected and worker nationality not known and not British citizen`, async () => {
      const workerFields = {
        nationality: { value: "Don't know" },
        britishCitizenship: 'No',
      };

      const { component, fixture, getByText, getByLabelText, routerSpy } = await setup(true, workerFields);

      fireEvent.click(getByLabelText('United Kingdom'));
      fireEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'staff-record',
        component.worker.uid,
        'health-and-care-visa',
      ]);
    });

    it(`should call submit data and navigate to year-arrived-uk page when 'Save and continue' is clicked and 'Other' radio is selected`, async () => {
      const { component, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup();

      fireEvent.click(getByLabelText('Other'));
      const button = getByText('Save and continue');
      fireEvent.click(button);

      const updatedFormData = component.form.value;

      expect(updatedFormData).toEqual({ countryOfBirthKnown: 'Other', countryOfBirthName: null });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        countryOfBirth: { value: 'Other' },
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'year-arrived-uk',
      ]);
    });

    it(`should call submit data and navigate to year-arrived-uk page when 'Save and continue' is clicked and 'Other' radio is selected and optional input is filled out`, async () => {
      const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup();

      component.availableCountries = [{ id: 1, country: 'France' }];
      fireEvent.click(getByLabelText('Other'));
      fixture.detectChanges();
      userEvent.type(getByLabelText('Country (optional)'), 'France');
      fireEvent.click(getByText('Save and continue'));

      const updatedFormData = component.form.value;

      expect(updatedFormData).toEqual({ countryOfBirthKnown: 'Other', countryOfBirthName: 'France' });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        countryOfBirth: { value: 'Other', other: { country: 'France' } },
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'year-arrived-uk',
      ]);
    });

    it(`should call submit data and navigate to year-arrived-uk page when 'Save and continue' is clicked and 'I do not know' radio is selected`, async () => {
      const { component, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup();

      fireEvent.click(getByLabelText('I do not know'));
      const button = getByText('Save and continue');
      fireEvent.click(button);

      const updatedFormData = component.form.value;

      expect(updatedFormData).toEqual({ countryOfBirthKnown: `Don't know`, countryOfBirthName: null });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        countryOfBirth: { value: `Don't know` },
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'year-arrived-uk',
      ]);
    });

    it('should navigate to year-arrived-uk page when skipping the question in the flow', async () => {
      const { component, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const skipButton = getByText('Skip this question');
      fireEvent.click(skipButton);

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceId, 'staff-record', workerId, 'year-arrived-uk']);
    });

    it('should navigate to staff-summary-page page when pressing Save and no value is entered', async () => {
      const { component, routerSpy, getByText } = await setup(false);
      component.form.setValue({ countryOfBirthKnown: null, countryOfBirthName: null });
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
        'year-arrived-uk',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing Save and United Kingdom is selected', async () => {
      const { component, fixture, routerSpy, getByLabelText, getByText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const radioButton = getByLabelText('United Kingdom');
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

    it('should navigate to year-arrived-uk-summary page when pressing Save and other country is selected', async () => {
      const { component, fixture, routerSpy, getByLabelText, getByText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const radioButton = getByLabelText('Other');
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
        'year-arrived-uk',
      ]);
    });

    it(`should navigate to year-arrived-uk page when pressing Save and Other is selected with optional input`, async () => {
      const { component, fixture, getByText, getByLabelText, routerSpy } = await setup(false);

      component.availableCountries = [{ id: 1, country: 'France' }];
      fireEvent.click(getByLabelText('Other'));
      fixture.detectChanges();
      userEvent.type(getByLabelText('Country (optional)'), 'France');
      fireEvent.click(getByText('Save'));

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'staff-record-summary',
        'year-arrived-uk',
      ]);
    });

    it('should navigate to year-arrived-uk page when pressing Save and I do not know is selected', async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const radioButton = getByLabelText('I do not know');
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
        'year-arrived-uk',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing cancel', async () => {
      const { component, routerSpy, getByText } = await setup(false);

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

    it('should navigate to funding staff-summary-page page when pressing cancel in funding version of the page', async () => {
      const { component, router, fixture, routerSpy, getByText } = await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const link = getByText('Cancel');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId]);
    });

    it('should navigate to funding year-arrived-uk page when pressing Save and I do not know is selected in funding version of page', async () => {
      const { component, fixture, router, routerSpy, getByText, getByLabelText } = await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const radioButton = getByLabelText('I do not know');
      fireEvent.click(radioButton);

      const link = getByText('Save');
      fireEvent.click(link);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId, 'year-arrived-uk']);
    });

    it(`should navigate to funding year-arrived-uk page when pressing Save and Other is selected with optional input in funding version of the page`, async () => {
      const { component, fixture, router, getByText, getByLabelText, routerSpy } = await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      component.availableCountries = [{ id: 1, country: 'France' }];
      fireEvent.click(getByLabelText('Other'));
      fixture.detectChanges();
      userEvent.type(getByLabelText('Country (optional)'), 'France');
      fireEvent.click(getByText('Save'));

      expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', component.worker.uid, 'year-arrived-uk']);
    });

    it('should navigate to funding staff-summary-page page when pressing Save and United Kingdom is selected in funding version of page', async () => {
      const { component, router, fixture, routerSpy, getByLabelText, getByText } = await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const radioButton = getByLabelText('United Kingdom');
      fireEvent.click(radioButton);

      const link = getByText('Save');
      fireEvent.click(link);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId]);
    });

    it('should navigate to funding year-arrived-uk-summary page when pressing Save and other country is selected in funding version of page', async () => {
      const { component, router, fixture, routerSpy, getByLabelText, getByText } = await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const radioButton = getByLabelText('Other');
      fireEvent.click(radioButton);

      const link = getByText('Save');
      fireEvent.click(link);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', workerId, 'year-arrived-uk']);
    });
  });

  describe('error messages', () => {
    it('returns an error if an invalid country is entered', async () => {
      const { component, fixture, getByText, getAllByText, getByLabelText } = await setup();

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
