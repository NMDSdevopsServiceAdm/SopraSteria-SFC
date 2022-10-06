import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithoutReturnUrl } from '@core/test-utils/MockWorkerService';
import { build, fake } from '@jackfranklin/test-data-bot';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { AdultSocialCareStartedComponent } from './adult-social-care-started.component';

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

describe('AdultSocialCareStartedComponent', () => {
  async function setup(insideFlow = true, contractType = 'permanent') {
    let contract;

    if (contractType === 'permanent') {
      contract = workerBuilder();
    } else if (contractType === 'other') {
      contract = noPermanentContract();
    }

    contractType === 'permanent' ? workerBuilder : noPermanentContract;
    const { fixture, getByText, getAllByText, getByLabelText, getByTestId, queryByTestId } = await render(
      AdultSocialCareStartedComponent,
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
    const backService = injector.inject(BackService);

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const backLinkSpy = spyOn(backService, 'setBackLink');

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByLabelText,
      routerSpy,
      backLinkSpy,
      getByTestId,
      queryByTestId,
    };
  }

  it('should render the AdultSocialCareStartedComponent', async () => {
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

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  it(`should call submit data and navigate with the  'days-of-sickness' url when 'Save and continue' is clicked and contract type is permanent pr temporary`, async () => {
    const { component, getByText, routerSpy } = await setup(true, 'permanent');

    const button = getByText('Save and continue');
    fireEvent.click(button);

    expect(routerSpy).toHaveBeenCalledWith([
      '/workplace',
      'mocked-uid',
      'staff-record',
      component.worker.uid,
      'days-of-sickness',
    ]);
  });

  it(`should call submit data and navigate with the 'contract-with-zero-hours' url when 'Save and continue' is clicked and the contract typs is not permanent or temporary`, async () => {
    const { component, getByText, routerSpy } = await setup(true, 'other');

    const button = getByText('Save and continue');
    fireEvent.click(button);

    expect(routerSpy).toHaveBeenCalledWith([
      '/workplace',
      'mocked-uid',
      'staff-record',
      component.worker.uid,
      'contract-with-zero-hours',
    ]);
  });

  it(`should call submit data and navigate with the  'days-of-sickness' url when 'Skip this question' is clicked and contract type is permanent pr temporary`, async () => {
    const { component, getByText, routerSpy } = await setup(true, 'permanent');

    const button = getByText('Skip this question');
    fireEvent.click(button);

    expect(routerSpy).toHaveBeenCalledWith([
      '/workplace',
      'mocked-uid',
      'staff-record',
      component.worker.uid,
      'days-of-sickness',
    ]);
  });

  it(`should call submit data and navigate with the 'contract-with-zero-hours' url when 'Skip this question' is clicked and the contract typs is not permanent or temporary`, async () => {
    const { component, getByText, routerSpy } = await setup(true, 'other');

    const button = getByText('Skip this question');
    fireEvent.click(button);

    expect(routerSpy).toHaveBeenCalledWith([
      '/workplace',
      'mocked-uid',
      'staff-record',
      component.worker.uid,
      'contract-with-zero-hours',
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

  it('should navigate to staff-summary-page page when pressing save and return', async () => {
    const { component, routerSpy, getByText } = await setup(false);

    const workerId = component.worker.uid;
    const workplaceId = component.workplace.uid;

    const link = getByText('Save and return');
    fireEvent.click(link);

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
