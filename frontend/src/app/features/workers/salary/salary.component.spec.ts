import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { SalaryComponent } from './salary.component';

describe('SalaryComponent', () => {
  async function setup(insideFlow = true) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId, queryByText } = await render(
      SalaryComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          UntypedFormBuilder,
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
          {
            provide: WorkerService,
            useClass: MockWorkerServiceWithUpdateWorker,
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
      router,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByTestId,
      submitSpy,
      routerSpy,
      workerServiceSpy,
      queryByText,
    };
  }

  it('should render the SalaryComponent', async () => {
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

  describe('submit buttons and links', () => {
    it(`should show 'Save and continue' cta button, 'Skip this question'and 'View this staff record' lins, if inside the flow`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it(`should call submit data and navigate with the correct url when 'Save and continue' is clicked`, async () => {
      const { component, fixture, getByText, getByLabelText, submitSpy, workerServiceSpy, routerSpy } = await setup();

      const form = component.form;
      form.controls.terms.setValue(null);
      form.controls.hourlyRate.setValue(null);
      form.controls.annualRate.setValue(null);

      fireEvent.click(getByLabelText('I do not know'));
      fireEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({ terms: `Don't know`, hourlyRate: null, annualRate: null });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        annualHourlyPay: { value: `Don't know`, rate: null },
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'staff-record',
        component.worker.uid,
        'care-certificate',
      ]);
    });

    it('allows the user to view the staff record summary', async () => {
      const { component, fixture, getByText, submitSpy, workerServiceSpy, routerSpy } = await setup();

      fireEvent.click(getByText('View this staff record'));
      fixture.detectChanges();

      expect(submitSpy).toHaveBeenCalledWith({ action: 'summary', save: false });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'staff-record',
        component.worker.uid,
        'staff-record-summary',
      ]);
      expect(workerServiceSpy).not.toHaveBeenCalled();
    });

    it('allows the user to skip the question', async () => {
      const { component, getByText, submitSpy, routerSpy, workerServiceSpy } = await setup();

      fireEvent.click(getByText('Skip this question'));
      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: false });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'staff-record',
        component.worker.uid,
        'care-certificate',
      ]);
      expect(workerServiceSpy).not.toHaveBeenCalled();
    });

    it('should call submit data and continue to care-certificate when in flow and Hourly is selected, an in-range hourly salary is entered and save and continue is clicked', async () => {
      const { fixture, getByLabelText, component, getByText, submitSpy, routerSpy, workerServiceSpy } = await setup();

      const form = component.form;
      form.controls.terms.setValue('');
      form.controls.hourlyRate.setValue('4');
      form.controls.annualRate.setValue('');
      fixture.detectChanges();
      fireEvent.click(getByLabelText('Hourly'));
      fixture.detectChanges();
      fireEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;

      expect(updatedFormData).toEqual({ terms: 'Hourly', hourlyRate: '4', annualRate: '' });
      userEvent.click(getByText('Save and continue'));
      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        annualHourlyPay: { value: 'Hourly', rate: '4' },
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'staff-record',
        component.worker.uid,
        'care-certificate',
      ]);
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if outside the flow`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should call submit data and return to the staff record summary when Annual salary is selected, in-range annual salary is entered and save and return is clicked', async () => {
      const { fixture, getByLabelText, component, getByText, submitSpy, routerSpy, workerServiceSpy } = await setup(
        false,
      );

      const form = component.form;
      form.controls.terms.setValue('');
      form.controls.hourlyRate.setValue('');
      form.controls.annualRate.setValue('20000');
      fixture.detectChanges();
      fireEvent.click(getByLabelText('Annual salary'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({ terms: 'Annually', hourlyRate: '', annualRate: '20000' });
      userEvent.click(getByText('Save and return'));
      expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        annualHourlyPay: { value: 'Annually', rate: '20000' },
      });

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'staff-record',
        component.worker.uid,
        'staff-record-summary',
      ]);
    });

    it('return to the staff record summary when cancel is clicked', async () => {
      const { component, getByText, submitSpy, routerSpy, workerServiceSpy } = await setup(false);

      userEvent.click(getByText('Cancel'));
      expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: false });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'staff-record',
        component.worker.uid,
        'staff-record-summary',
      ]);
      expect(workerServiceSpy).not.toHaveBeenCalled();
    });

    it('should call submit data and return to the wdf staff record summary when Annual salary is selected, in-range annual salary is entered and save and return is clicked in wdf version of page', async () => {
      const { fixture, router, getByLabelText, component, getByText, submitSpy, routerSpy, workerServiceSpy } =
        await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();

      const form = component.form;
      form.controls.terms.setValue('');
      form.controls.hourlyRate.setValue('');
      form.controls.annualRate.setValue('20000');
      fixture.detectChanges();
      fireEvent.click(getByLabelText('Annual salary'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({ terms: 'Annually', hourlyRate: '', annualRate: '20000' });
      userEvent.click(getByText('Save and return'));
      expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        annualHourlyPay: { value: 'Annually', rate: '20000' },
      });

      expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'staff-record', component.worker.uid]);
    });

    it('return to the wdf staff record summary when cancel is clicked in wdf version of page', async () => {
      const { component, getByText, submitSpy, routerSpy, workerServiceSpy, fixture, router } = await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();

      userEvent.click(getByText('Cancel'));
      expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: false });
      expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'staff-record', component.worker.uid]);
      expect(workerServiceSpy).not.toHaveBeenCalled();
    });
  });

  describe('error messages', () => {
    it('returns an error if Hourly is selected and no hourly rate is entered', async () => {
      const { component, fixture, getByText, getAllByText, getByLabelText } = await setup(false);
      const form = component.form;
      form.controls.terms.setValue('');
      form.controls.hourlyRate.setValue('');
      form.controls.annualRate.setValue('');
      fixture.detectChanges();
      fireEvent.click(getByLabelText('Hourly'));
      fixture.detectChanges();
      fireEvent.click(getByText('Save and return'));
      fixture.detectChanges();
      expect(getAllByText('Enter their standard hourly rate').length).toEqual(2);
    });

    it('returns an error if Hourly is selected and an out of range hourly salary is entered', async () => {
      const { component, fixture, getByText, getAllByText, getByLabelText } = await setup(false);

      const form = component.form;
      form.controls.terms.setValue('');
      form.controls.hourlyRate.setValue('400');
      form.controls.annualRate.setValue('');

      fixture.detectChanges();
      fireEvent.click(getByLabelText('Hourly'));
      fixture.detectChanges();
      fireEvent.click(getByText('Save and return'));
      fixture.detectChanges();
      expect(getAllByText('Standard hourly rate must be between £2.50 and £200.00').length).toEqual(2);
    });

    it('returns an error if Hourly is selected and more than 2 decimal places are entered', async () => {
      const { component, fixture, getByText, getAllByText, getByLabelText } = await setup(false);

      const form = component.form;
      form.controls.terms.setValue('');
      form.controls.hourlyRate.setValue('4.444');
      form.controls.annualRate.setValue('');

      fixture.detectChanges();
      fireEvent.click(getByLabelText('Hourly'));
      fixture.detectChanges();
      fireEvent.click(getByText('Save and return'));
      fixture.detectChanges();
      expect(
        getAllByText('Standard hourly rate can only have 1 or 2 digits after the decimal point when you include pence')
          .length,
      ).toEqual(2);
    });

    it('returns an error if Annual salary is selected and no Annual salary is entered', async () => {
      const { component, fixture, getByText, getAllByText, getByLabelText } = await setup(false);
      const form = component.form;
      form.controls.terms.setValue('');
      form.controls.hourlyRate.setValue('');
      form.controls.annualRate.setValue('');
      fixture.detectChanges();
      fireEvent.click(getByLabelText('Annual salary'));
      fixture.detectChanges();
      fireEvent.click(getByText('Save and return'));
      fixture.detectChanges();
      expect(getAllByText('Enter their standard annual salary').length).toEqual(2);
    });

    it('returns an error if Annual salary is selected and an out of range annual salary is entered when job role is senior management', async () => {
      const { component, fixture, getByText, getAllByText, getByLabelText } = await setup(false);
      const form = component.form;
      component.worker.mainJob.jobId = 26;
      component.initiated = false;
      component.ngOnInit();

      form.controls.terms.setValue('');
      form.controls.hourlyRate.setValue('');
      form.controls.annualRate.setValue('5000000');
      fixture.detectChanges();
      fireEvent.click(getByLabelText('Annual salary'));
      fixture.detectChanges();
      fireEvent.click(getByText('Save and return'));
      fixture.detectChanges();
      expect(getAllByText('Standard annual salary must be between £500 and £250,000').length).toEqual(2);
    });

    it('returns an error if Annual salary is selected and a decimal number is entered', async () => {
      const { component, fixture, getByText, getAllByText, getByLabelText } = await setup();
      const form = component.form;
      form.controls.terms.setValue('');
      form.controls.hourlyRate.setValue('');
      form.controls.annualRate.setValue('50000.50');
      fixture.detectChanges();
      fireEvent.click(getByLabelText('Annual salary'));
      fixture.detectChanges();
      fireEvent.click(getByText('Save and continue'));
      fixture.detectChanges();
      expect(getAllByText('Standard annual salary must not include pence').length).toEqual(2);
    });
  });
});
