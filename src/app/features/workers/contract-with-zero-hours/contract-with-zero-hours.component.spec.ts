import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Contracts } from '@core/model/contracts.enum';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithoutReturnUrl } from '@core/test-utils/MockWorkerService';
import { build, fake } from '@jackfranklin/test-data-bot';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { ContractWithZeroHoursComponent } from './contract-with-zero-hours.component';

const workerBuilder = build('Worker', {
  fields: {
    uid: fake((f) => f.datatype.uuid()),
    contract: null,
  },
});

const worker = (contract) => {
  return workerBuilder({
    overrides: {
      contract,
    },
  });
};

describe('ContractWithZeroHoursComponent', () => {
  async function setup(insideFlow = true, contractType = Contracts.Permanent, wdfEditPageFlag = false) {
    const workerWithContract = worker(contractType) as Worker;

    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      ContractWithZeroHoursComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          FormBuilder,
          {
            provide: ActivatedRoute,
            useValue: {
              parent: {
                parent: {
                  snapshot: {
                    url: [{ path: wdfEditPageFlag ? 'wdf' : '' }],
                  },
                },
                snapshot: {
                  url: [{ path: insideFlow ? 'staff-uid' : 'staff-record-summary' }],
                  data: {
                    establishment: { uid: 'mocked-uid' },
                    primaryWorkplace: {},
                  },
                },
              },
            },
          },
          {
            provide: WorkerService,
            useFactory: MockWorkerServiceWithoutReturnUrl.factory(workerWithContract),
            deps: [HttpClient],
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

  it('should render the ContractWithZeroHoursComponent', async () => {
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
    it(`should show 'Save and continue' cta button and 'View this staff record' link, if a return url is not provided`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if a return url is provided`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link if in wdf version of the page`, async () => {
      const { getByText } = await setup(false, Contracts.Permanent, true);

      expect(getByText('Save')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    describe('contract type is Permanent', () => {
      describe('insideFlow', () => {
        it(`should call submit data and navigate with the 'weekly-contracted-hours' url when 'Save and continue' is clicked, all radios unselected`, async () => {
          const { component, getByText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            true,
            Contracts.Permanent,
          );

          const button = getByText('Save and continue');
          fireEvent.click(button);

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).not.toHaveBeenCalled();
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'weekly-contracted-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'weekly-contracted-hours' url when 'Save and continue' is clicked, 'No' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            true,
            Contracts.Permanent,
          );

          const radio = getByLabelText('No');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save and continue');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: 'No' });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: 'No',
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'weekly-contracted-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'weekly-contracted-hours' url when 'Save and continue' is clicked, 'I do not know' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            true,
            Contracts.Permanent,
          );

          const radio = getByLabelText('I do not know');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save and continue');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: `Don't know` });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: `Don't know`,
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'weekly-contracted-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save and continue' is clicked, 'Yes' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            true,
            Contracts.Permanent,
          );

          const radio = getByLabelText('Yes');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save and continue');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: 'Yes' });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: 'Yes',
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'average-weekly-hours',
          ]);
        });

        it(`should navigate to 'weekly-contracted-hours' url when 'Skip this question' is clicked`, async () => {
          const { component, getByText, routerSpy } = await setup(true, Contracts.Permanent);

          const button = getByText('Skip this question');
          fireEvent.click(button);

          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'weekly-contracted-hours',
          ]);
        });
      });

      describe('outsideFlow', () => {
        it(`should call submit data and navigate with the 'weekly-contracted-hours' url when 'Save' is clicked, all radios unselected`, async () => {
          const { component, getByText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            false,
            Contracts.Permanent,
          );

          const button = getByText('Save');
          fireEvent.click(button);

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).not.toHaveBeenCalled();
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
            'weekly-contracted-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'weekly-contracted-hours' url when 'Save' is clicked, 'No' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            false,
            Contracts.Permanent,
          );

          const radio = getByLabelText('No');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: 'No' });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: 'No',
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
            'weekly-contracted-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'weekly-contracted-hours' url when 'Save' is clicked, 'I do not know' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            false,
            Contracts.Permanent,
          );

          const radio = getByLabelText('I do not know');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: `Don't know` });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: `Don't know`,
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
            'weekly-contracted-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save' is clicked, 'Yes' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            false,
            Contracts.Permanent,
          );

          const radio = getByLabelText('Yes');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: 'Yes' });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: 'Yes',
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
            'average-weekly-hours',
          ]);
        });
      });
    });

    describe('contract type is Temporary', () => {
      describe('insideFlow', () => {
        it(`should call submit data and navigate with the 'weekly-contracted-hours' url when 'Save and continue' is clicked, all radios unselected`, async () => {
          const { component, getByText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            true,
            Contracts.Temporary,
          );

          const button = getByText('Save and continue');
          fireEvent.click(button);

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).not.toHaveBeenCalled();
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'weekly-contracted-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'weekly-contracted-hours' url when 'Save and continue' is clicked, 'No' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            true,
            Contracts.Temporary,
          );

          const radio = getByLabelText('No');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save and continue');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: 'No' });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: 'No',
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'weekly-contracted-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'weekly-contracted-hours' url when 'Save and continue' is clicked, 'I do not know' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            true,
            Contracts.Temporary,
          );

          const radio = getByLabelText('I do not know');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save and continue');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: `Don't know` });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: `Don't know`,
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'weekly-contracted-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save and continue' is clicked, 'Yes' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            true,
            Contracts.Temporary,
          );

          const radio = getByLabelText('Yes');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save and continue');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: 'Yes' });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: 'Yes',
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'average-weekly-hours',
          ]);
        });

        it(`should navigate to 'weekly-contracted-hours' url when 'Skip this question' is clicked`, async () => {
          const { component, getByText, routerSpy } = await setup(true, Contracts.Temporary);

          const button = getByText('Skip this question');
          fireEvent.click(button);

          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'weekly-contracted-hours',
          ]);
        });
      });

      describe('outsideFlow', () => {
        it(`should call submit data and navigate with the 'weekly-contracted-hours' url when 'Save' is clicked, all radios unselected`, async () => {
          const { component, getByText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            false,
            Contracts.Temporary,
          );

          const button = getByText('Save');
          fireEvent.click(button);

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).not.toHaveBeenCalled();
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
            'weekly-contracted-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'weekly-contracted-hours' url when 'Save' is clicked, 'No' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            false,
            Contracts.Temporary,
          );

          const radio = getByLabelText('No');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: 'No' });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: 'No',
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
            'weekly-contracted-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'weekly-contracted-hours' url when 'Save' is clicked, 'I do not know' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            false,
            Contracts.Temporary,
          );

          const radio = getByLabelText('I do not know');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: `Don't know` });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: `Don't know`,
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
            'weekly-contracted-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save' is clicked, 'Yes' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            false,
            Contracts.Temporary,
          );

          const radio = getByLabelText('Yes');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: 'Yes' });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: 'Yes',
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
            'average-weekly-hours',
          ]);
        });
      });
    });

    describe('contract type is Pool/Bank', () => {
      describe('insideFlow', () => {
        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save and continue' is clicked, all radios unselected`, async () => {
          const { component, getByText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            true,
            Contracts.Pool_Bank,
          );

          const button = getByText('Save and continue');
          fireEvent.click(button);

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).not.toHaveBeenCalled();
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'average-weekly-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save and continue' is clicked, 'No' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            true,
            Contracts.Pool_Bank,
          );

          const radio = getByLabelText('No');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save and continue');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: 'No' });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: 'No',
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'average-weekly-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save and continue' is clicked, 'I do not know' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            true,
            Contracts.Pool_Bank,
          );

          const radio = getByLabelText('I do not know');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save and continue');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: `Don't know` });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: `Don't know`,
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'average-weekly-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save and continue' is clicked, 'Yes' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            true,
            Contracts.Pool_Bank,
          );

          const radio = getByLabelText('Yes');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save and continue');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: 'Yes' });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: 'Yes',
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'average-weekly-hours',
          ]);
        });

        it(`should navigate to 'averate-weekly-hours' url when 'Skip this question' is clicked`, async () => {
          const { component, getByText, routerSpy } = await setup(true, Contracts.Pool_Bank);

          const button = getByText('Skip this question');
          fireEvent.click(button);

          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'average-weekly-hours',
          ]);
        });
      });

      describe('outsideFlow', () => {
        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save' is clicked, all radios unselected`, async () => {
          const { component, getByText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            false,
            Contracts.Pool_Bank,
          );

          const button = getByText('Save');
          fireEvent.click(button);

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).not.toHaveBeenCalled();
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
            'average-weekly-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save' is clicked, 'No' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            false,
            Contracts.Pool_Bank,
          );

          const radio = getByLabelText('No');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: 'No' });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: 'No',
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
            'average-weekly-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save' is clicked, 'I do not know' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            false,
            Contracts.Pool_Bank,
          );

          const radio = getByLabelText('I do not know');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: `Don't know` });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: `Don't know`,
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
            'average-weekly-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save' is clicked, 'Yes' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            false,
            Contracts.Pool_Bank,
          );

          const radio = getByLabelText('Yes');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: 'Yes' });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: 'Yes',
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
            'average-weekly-hours',
          ]);
        });
      });
    });

    describe('contract type is Agency', () => {
      describe('insideFlow', () => {
        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save and continue' is clicked, all radios unselected`, async () => {
          const { component, getByText, routerSpy, submitSpy, workerServiceSpy } = await setup(true, Contracts.Agency);

          const button = getByText('Save and continue');
          fireEvent.click(button);

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).not.toHaveBeenCalled();
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'average-weekly-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save and continue' is clicked, 'No' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            true,
            Contracts.Agency,
          );

          const radio = getByLabelText('No');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save and continue');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: 'No' });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: 'No',
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'average-weekly-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save and continue' is clicked, 'I do not know' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            true,
            Contracts.Agency,
          );

          const radio = getByLabelText('I do not know');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save and continue');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: `Don't know` });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: `Don't know`,
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'average-weekly-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save and continue' is clicked, 'Yes' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            true,
            Contracts.Agency,
          );

          const radio = getByLabelText('Yes');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save and continue');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: 'Yes' });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: 'Yes',
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'average-weekly-hours',
          ]);
        });

        it(`should navigate to 'averate-weekly-hours' url when 'Skip this question' is clicked`, async () => {
          const { component, getByText, routerSpy } = await setup(true, Contracts.Agency);

          const button = getByText('Skip this question');
          fireEvent.click(button);

          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'average-weekly-hours',
          ]);
        });
      });

      describe('outsideFlow', () => {
        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save' is clicked, all radios unselected`, async () => {
          const { component, getByText, routerSpy, submitSpy, workerServiceSpy } = await setup(false, Contracts.Agency);

          const button = getByText('Save');
          fireEvent.click(button);

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).not.toHaveBeenCalled();
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
            'average-weekly-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save' is clicked, 'No' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            false,
            Contracts.Agency,
          );

          const radio = getByLabelText('No');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: 'No' });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: 'No',
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
            'average-weekly-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save' is clicked, 'I do not know' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            false,
            Contracts.Agency,
          );

          const radio = getByLabelText('I do not know');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: `Don't know` });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: `Don't know`,
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
            'average-weekly-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save' is clicked, 'Yes' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            false,
            Contracts.Agency,
          );

          const radio = getByLabelText('Yes');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: 'Yes' });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: 'Yes',
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
            'average-weekly-hours',
          ]);
        });
      });
    });

    describe('contract type is Other', () => {
      describe('insideFlow', () => {
        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save and continue' is clicked, all radios unselected`, async () => {
          const { component, getByText, routerSpy, submitSpy, workerServiceSpy } = await setup(true, Contracts.Other);

          const button = getByText('Save and continue');
          fireEvent.click(button);

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).not.toHaveBeenCalled();
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'average-weekly-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save and continue' is clicked, 'No' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            true,
            Contracts.Other,
          );

          const radio = getByLabelText('No');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save and continue');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: 'No' });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: 'No',
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'average-weekly-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save and continue' is clicked, 'I do not know' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            true,
            Contracts.Other,
          );

          const radio = getByLabelText('I do not know');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save and continue');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: `Don't know` });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: `Don't know`,
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'average-weekly-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save and continue' is clicked, 'Yes' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            true,
            Contracts.Other,
          );

          const radio = getByLabelText('Yes');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save and continue');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: 'Yes' });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: 'Yes',
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'average-weekly-hours',
          ]);
        });

        it(`should navigate to 'averate-weekly-hours' url when 'Skip this question' is clicked`, async () => {
          const { component, getByText, routerSpy } = await setup(true, Contracts.Other);

          const button = getByText('Skip this question');
          fireEvent.click(button);

          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'average-weekly-hours',
          ]);
        });
      });

      describe('outsideFlow', () => {
        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save' is clicked, all radios unselected`, async () => {
          const { component, getByText, routerSpy, submitSpy, workerServiceSpy } = await setup(false, Contracts.Other);

          const button = getByText('Save');
          fireEvent.click(button);

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).not.toHaveBeenCalled();
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
            'average-weekly-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save' is clicked, 'No' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            false,
            Contracts.Other,
          );

          const radio = getByLabelText('No');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: 'No' });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: 'No',
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
            'average-weekly-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save' is clicked, 'I do not know' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            false,
            Contracts.Other,
          );

          const radio = getByLabelText('I do not know');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: `Don't know` });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: `Don't know`,
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
            'average-weekly-hours',
          ]);
        });

        it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save' is clicked, 'Yes' is selected`, async () => {
          const { component, fixture, getByText, getByLabelText, routerSpy, submitSpy, workerServiceSpy } = await setup(
            false,
            Contracts.Other,
          );

          const radio = getByLabelText('Yes');
          fireEvent.click(radio);
          fixture.detectChanges();
          const button = getByText('Save');
          fireEvent.click(button);

          const updatedFormData = component.form.value;
          expect(updatedFormData).toEqual({ zeroHoursContract: 'Yes' });

          expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
          expect(workerServiceSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
            zeroHoursContract: 'Yes',
          });
          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            'mocked-uid',
            'staff-record',
            component.worker.uid,
            'staff-record-summary',
            'average-weekly-hours',
          ]);
        });
      });
    });

    it(`should navigate to 'staff-summary-page' page when clicking 'View this staff record' link `, async () => {
      const { component, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const viewStaffRecord = getByText('View this staff record');
      fireEvent.click(viewStaffRecord);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
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

    it('should navigate to wdf average-weekly hours when yes is selected and save is clicked in wdf version of page', async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText } = await setup(
        false,
        Contracts.Permanent,
        true,
      );

      const workerId = component.worker.uid;

      const radioButton = getByLabelText('Yes');
      fireEvent.click(radioButton);
      const link = getByText('Save');
      fireEvent.click(link);

      fixture.detectChanges();
      expect(routerSpy).toHaveBeenCalledWith(['wdf', 'staff-record', workerId, 'average-weekly-hours']);
    });

    it('should navigate to wdf contracted-weekly-hours when no is selected and save is clicked in wdf version of page', async () => {
      const { component, routerSpy, getByText, getByLabelText } = await setup(false, Contracts.Permanent, true);

      const workerId = component.worker.uid;

      const radioButton = getByLabelText('No');
      fireEvent.click(radioButton);
      const link = getByText('Save');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith(['wdf', 'staff-record', workerId, 'weekly-contracted-hours']);
    });

    it('should navigate to wdf contracted-weekly-hours when I do not know is selected and save is clicked in wdf version of page', async () => {
      const { component, routerSpy, getByText, getByLabelText } = await setup(false, Contracts.Permanent, true);

      const workerId = component.worker.uid;

      const radioButton = getByLabelText('I do not know');
      fireEvent.click(radioButton);
      const link = getByText('Save');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith(['wdf', 'staff-record', workerId, 'weekly-contracted-hours']);
    });

    it('should navigate to wdf staff-summary-page page when pressing cancel in wdf version of page', async () => {
      const { component, routerSpy, getByText } = await setup(false, Contracts.Permanent, true);

      const workerId = component.worker.uid;

      const link = getByText('Cancel');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith(['wdf', 'staff-record', workerId]);
    });
  });
});
