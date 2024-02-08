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

import { NationalityComponent } from './nationality.component';

describe('NationalityComponent', () => {
  async function setup(insideFlow = true) {
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      NationalityComponent,
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
      routerSpy,
      workerServiceSpy,
      submitSpy,
    };
  }

  it('should render the NationalityComponent', async () => {
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
    it(`should show 'Save and continue' cta button, 'View this staff record' and 'Skip this question' link if in the flow`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it(`should call submit data and navigate with the correct url when 'Save and continue' is clicked`, async () => {
      const { component, fixture, getByText, getByLabelText, submitSpy, workerServiceSpy, routerSpy } = await setup();

      fireEvent.click(getByLabelText('I do not know'));
      fireEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({ nationalityKnown: `Don't know`, nationalityName: null });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        nationality: { value: `Don't know` },
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'staff-record',
        component.worker.uid,
        'british-citizenship',
      ]);
    });

    it(`should call submit data and navigate with the correct url when 'British' radio button is selected and 'Save and continue' is clicked`, async () => {
      const { component, fixture, getByText, getByLabelText, submitSpy, workerServiceSpy, routerSpy } = await setup();

      fireEvent.click(getByLabelText('British'));
      fireEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({ nationalityKnown: 'British', nationalityName: null });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        nationality: { value: 'British' },
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'staff-record',
        component.worker.uid,
        'country-of-birth',
      ]);
    });

    it(`should call submit data and navigate with the correct url when 'Other' radio button is selected, dropdown input is left blank and 'Save and continue' is clicked`, async () => {
      const { component, fixture, getByText, getByLabelText, submitSpy, workerServiceSpy, routerSpy } = await setup();

      fireEvent.click(getByLabelText('Other'));
      fireEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({ nationalityKnown: 'Other', nationalityName: null });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        nationality: { value: 'Other' },
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'staff-record',
        component.worker.uid,
        'british-citizenship',
      ]);
    });

    it(`should call submit data and navigate with the correct url when 'Other' radio button is selected, dropdown input is filled out correctly and 'Save and continue' is clicked`, async () => {
      const { component, fixture, getByText, getByLabelText, submitSpy, workerServiceSpy, routerSpy } = await setup();

      fireEvent.click(getByLabelText('Other'));
      fixture.detectChanges();
      userEvent.type(getByLabelText('Nationality (optional)'), 'French');
      fireEvent.click(getByText('Save and continue'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({ nationalityKnown: 'Other', nationalityName: 'French' });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        nationality: { value: 'Other', other: { nationality: 'French' } },
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'staff-record',
        component.worker.uid,
        'british-citizenship',
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
        'british-citizenship',
      ]);
      expect(workerServiceSpy).not.toHaveBeenCalled();
    });

    it(`should show 'Save' cta button and 'Cancel' link if outside the flow`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it(`should call submit data and navigate with the correct url when 'British' radio button is selected and 'Save' is clicked`, async () => {
      const { component, fixture, getByText, getByLabelText, submitSpy, workerServiceSpy, routerSpy } = await setup(
        false,
      );

      fireEvent.click(getByLabelText('British'));
      fireEvent.click(getByText('Save'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({ nationalityKnown: 'British', nationalityName: null });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        nationality: { value: 'British' },
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'staff-record',
        component.worker.uid,
        'staff-record-summary',
      ]);
    });

    it(`should call submit data and navigate to british-citizenship-summary-flow when 'Other' radio button is selected, dropdown input is filled out correctly and 'Save' is clicked`, async () => {
      const { component, fixture, getByText, getByLabelText, submitSpy, workerServiceSpy, routerSpy } = await setup(
        false,
      );

      component.availableNationalities = [{ id: 1, nationality: 'French' }];
      fireEvent.click(getByLabelText('Other'));
      fixture.detectChanges();
      userEvent.type(getByLabelText('Nationality (optional)'), 'French');
      fireEvent.click(getByText('Save'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      component.availableNationalities = [{ id: 1, nationality: 'French' }];
      expect(updatedFormData).toEqual({ nationalityKnown: 'Other', nationalityName: 'French' });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        nationality: { value: 'Other', other: { nationality: 'French' } },
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'staff-record',
        component.worker.uid,
        'staff-record-summary',
        'british-citizenship',
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

    it(`should call submit data and navigate with the wdf url when 'British' radio button is selected and 'Save' is clicked`, async () => {
      const { component, fixture, router, getByText, getByLabelText, submitSpy, workerServiceSpy, routerSpy } =
        await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();

      fireEvent.click(getByLabelText('British'));
      fireEvent.click(getByText('Save'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({ nationalityKnown: 'British', nationalityName: null });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        nationality: { value: 'British' },
      });
      expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'staff-record', component.worker.uid]);
    });

    it(`should call submit data and navigate to the wdf british-citizenship-summary-flow when 'Other' radio button is selected, dropdown input is filled out correctly and 'Save' is clicked`, async () => {
      const { component, router, fixture, getByText, getByLabelText, submitSpy, workerServiceSpy, routerSpy } =
        await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();

      component.availableNationalities = [{ id: 1, nationality: 'French' }];
      fireEvent.click(getByLabelText('Other'));
      fixture.detectChanges();
      userEvent.type(getByLabelText('Nationality (optional)'), 'French');
      fireEvent.click(getByText('Save'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      component.availableNationalities = [{ id: 1, nationality: 'French' }];
      expect(updatedFormData).toEqual({ nationalityKnown: 'Other', nationalityName: 'French' });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        nationality: { value: 'Other', other: { nationality: 'French' } },
      });
      expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'staff-record', component.worker.uid, 'british-citizenship']);
    });

    it('return to the wdf staff record summary when cancel is clicked', async () => {
      const { component, fixture, router, getByText, submitSpy, routerSpy, workerServiceSpy } = await setup(false);
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
    it('returns an error if an incorrect country is inputted', async () => {
      const { component, fixture, getByText, getAllByText, getByLabelText } = await setup(false);

      component.availableNationalities = [{ id: 1, nationality: 'French' }];
      fireEvent.click(getByLabelText('Other'));
      fixture.detectChanges();
      userEvent.type(getByLabelText('Nationality (optional)'), 'asdf');
      fireEvent.click(getByText('Save'));
      fixture.detectChanges();

      expect(getAllByText('Enter a valid nationality').length).toEqual(2);
    });
  });
});
