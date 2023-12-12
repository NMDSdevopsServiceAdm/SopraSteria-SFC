import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DATE_DISPLAY_DEFAULT } from '@core/constants/constants';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { DateOfBirthComponent } from './date-of-birth.component';

describe('DateOfBirthComponent', () => {
  async function setup(insideFlow = true) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      DateOfBirthComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          UntypedFormBuilder,
          {
            provide: ActivatedRoute,
            useValue: {
              parent: {
                snapshot: {
                  url: [{ path: insideFlow ? 'staff-uid' : 'staff-record-summary' }],
                  data: {
                    establishment: { uid: 'mocked-uid' },
                    primaryWorkplace: {},
                  },
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

    const submitSpy = spyOn(component, 'setSubmitAction').and.callThrough();
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const workerServiceSpy = spyOn(workerService, 'updateWorker').and.callThrough();

    return {
      component,
      fixture,
      router,
      workerService,
      routerSpy,
      submitSpy,
      workerServiceSpy,
      getByText,
      getAllByText,
      getByLabelText,
      getByTestId,
      queryByTestId,
    };
  }

  it('should render the DateOfBirthComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the reveal', async () => {
    const { getByText } = await setup();

    const reveal = getByText('Why we ask for this information');
    const revealText = getByText(
      `Knowing the age of the workforce is very important for workforce planning. This date of birth will also be mixed with their National Insurance number to create a unique reference number for them in ASC-WDS.`,
    );

    expect(reveal).toBeTruthy();
    expect(revealText).toBeTruthy();
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
    it(`should show 'Save and continue' cta button and 'View this staff record' and 'Skip this question' link if in the flow`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it(`should call submit data and navigate with the correct url when 'Save and continue' is clicked`, async () => {
      const { component, fixture, getByText, getByLabelText, submitSpy, workerServiceSpy, routerSpy } = await setup();

      userEvent.type(getByLabelText('Day'), '11');
      userEvent.type(getByLabelText('Month'), '6');
      userEvent.type(getByLabelText('Year'), '1993');
      userEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({ dob: { day: 11, month: 6, year: 1993 } });

      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        dateOfBirth: '1993-06-11',
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        fixture.componentInstance.worker.uid,
        'national-insurance-number',
      ]);
    });

    it('allows the user to view the staff record summary', async () => {
      const { fixture, getByText, submitSpy, routerSpy, workerServiceSpy } = await setup();

      userEvent.click(getByText('View this staff record'));
      expect(submitSpy).toHaveBeenCalledWith({ action: 'summary', save: false });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        fixture.componentInstance.worker.uid,
        'staff-record-summary',
      ]);
      expect(workerServiceSpy).not.toHaveBeenCalled();
    });

    it('allows the user to skip the question', async () => {
      const { fixture, getByText, submitSpy, routerSpy, workerServiceSpy } = await setup();

      userEvent.click(getByText('Skip this question'));
      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: false });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        fixture.componentInstance.worker.uid,
        'national-insurance-number',
      ]);
      expect(workerServiceSpy).not.toHaveBeenCalled();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if outside the flow`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it(`should call submit data and navigate with the correct url when 'Save and return' is clicked`, async () => {
      const { component, fixture, getByText, getByLabelText, submitSpy, workerServiceSpy, routerSpy } = await setup(
        false,
      );

      userEvent.type(getByLabelText('Day'), '11');
      userEvent.type(getByLabelText('Month'), '6');
      userEvent.type(getByLabelText('Year'), '1993');
      userEvent.click(getByText('Save and return'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({ dob: { day: 11, month: 6, year: 1993 } });

      expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        dateOfBirth: '1993-06-11',
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        fixture.componentInstance.worker.uid,
        'staff-record-summary',
      ]);
    });

    it('return to the staff record summary when cancel is clicked', async () => {
      const { fixture, getByText, submitSpy, routerSpy, workerServiceSpy } = await setup(false);

      userEvent.click(getByText('Cancel'));
      expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: false });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        fixture.componentInstance.worker.uid,
        'staff-record-summary',
      ]);
      expect(workerServiceSpy).not.toHaveBeenCalled();
    });

    it('should return to the wdf staff record summary when cancel is clicked and in wdf edit version of the page', async () => {
      const { fixture, router, component, getByText, submitSpy, routerSpy, workerServiceSpy } = await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      userEvent.click(getByText('Cancel'));
      expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: false });
      expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'staff-record', fixture.componentInstance.worker.uid]);
      expect(workerServiceSpy).not.toHaveBeenCalled();
    });

    it('should return to the wdf staff record summary when save and return is clicked and in wdf edit version of the page', async () => {
      const { fixture, router, component, getByText, submitSpy, routerSpy, workerServiceSpy } = await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      userEvent.click(getByText('Save and return'));
      expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: true });
      expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'staff-record', fixture.componentInstance.worker.uid]);
      expect(workerServiceSpy).toHaveBeenCalled();
    });
  });

  describe('error messages', () => {
    it('returns an error if an invalid date is entered', async () => {
      const { fixture, getByText, getAllByText, getByLabelText } = await setup();

      userEvent.type(getByLabelText('Day'), '55555');
      userEvent.type(getByLabelText('Month'), '12');
      userEvent.type(getByLabelText('Year'), '2000');
      userEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      const errors = getAllByText('Enter a valid date of birth, like 31 3 1980');

      expect(errors.length).toBe(2);
    });

    it('returns an error if an out-of-range date is entered', async () => {
      const { component, fixture, getByText, getAllByText, getByLabelText } = await setup();

      userEvent.type(getByLabelText('Day'), '1');
      userEvent.type(getByLabelText('Month'), '12');
      userEvent.type(getByLabelText('Year'), '1000');
      userEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      const errors = getAllByText(
        `Date of birth must to be between ${component.minDate.format(
          DATE_DISPLAY_DEFAULT,
        )} and ${component.maxDate.format(DATE_DISPLAY_DEFAULT)}`,
      );

      expect(errors.length).toBe(2);
    });
  });
});
