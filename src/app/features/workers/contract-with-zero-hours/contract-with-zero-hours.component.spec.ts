import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithoutReturnUrl } from '@core/test-utils/MockWorkerService';
import { build, fake } from '@jackfranklin/test-data-bot';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { ContractWithZeroHoursComponent } from './contract-with-zero-hours.component';

const workerBuilder = build('Worker', {
  fields: {
    uid: fake((f) => f.datatype.uuid()),
    contract: 'Permanent',
  },
});

const noPermanentContract = () =>
  workerBuilder({
    overrides: {
      contract: 'Other',
    },
  });

fdescribe('ContractWithZeroHoursComponent', () => {
  async function setup(insideFlow = true, contractType = 'permanent') {
    let contract;

    if (contractType === 'permanent') {
      contract = workerBuilder();
    } else if (contractType === 'other') {
      contract = noPermanentContract();
    }

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
            useFactory: MockWorkerServiceWithoutReturnUrl.factory(contract),
            deps: [HttpClient],
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

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByLabelText,
      routerSpy,
      getByTestId,
      queryByTestId,
    };
  }

  it('should render the ContractWithZeroHoursComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
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

    it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Save and continue' is clicked and contract type is 'other' ,'Agency' or 'Pool,Bank' `, async () => {
      const { component, getByText, routerSpy } = await setup(true, 'other');

      const button = getByText('Save and continue');
      fireEvent.click(button);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'average-weekly-hours',
      ]);
    });

    it(`should call submit data and navigate with the  'weekly-contracted-hours' url when 'Save and continue' is clicked and contract type is permanent or temporary`, async () => {
      const { component, getByText, routerSpy } = await setup(true, 'permanent');

      const button = getByText('Save and continue');
      fireEvent.click(button);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'weekly-contracted-hours',
      ]);
    });

    it(`should call submit data and navigate with the   'weekly-contracted-hours' url when 'Skip this question' is clicked and contract type is permanent or temporary`, async () => {
      const { component, getByText, routerSpy } = await setup(true, 'permanent');

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

    it(`should call submit data and navigate with the 'average-weekly-hours' url when 'Skip this question' is clicked and the contract typs is not permanent or temporary`, async () => {
      const { component, getByText, routerSpy } = await setup(true, 'other');

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

    it('should navigate to average-weekly hours when yes is selected and save is clicked', async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const radioButton = getByLabelText('Yes');
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
        'average-weekly-hours',
      ]);
    });

    it('should navigate to contracted-weekly-hours when no is selected and save is clicked', async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const radioButton = getByLabelText('No');
      fireEvent.click(radioButton);
      const link = getByText('Save');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
        'weekly-contracted-hours',
      ]);
    });

    it('should navigate to contracted-weekly-hours when I do not know is selected and save is clicked', async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const radioButton = getByLabelText('I do not know');
      fireEvent.click(radioButton);
      const link = getByText('Save');
      fireEvent.click(link);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
        'weekly-contracted-hours',
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
});
