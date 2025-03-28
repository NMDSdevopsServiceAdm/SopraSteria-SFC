import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { QualificationService } from '@core/services/qualification.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockQualificationService } from '@core/test-utils/MockQualificationsService';
import { MockWorkerServiceWithoutReturnUrl, MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { WorkersModule } from '../workers.module';
import { OtherQualificationsLevelComponent } from './other-qualifications-level.component';

describe('OtherQualificationsLevelComponent', () => {
  async function setup(returnUrl = true) {
    const setupTools = await render(OtherQualificationsLevelComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, WorkersModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                url: [{ path: returnUrl ? 'staff-record-summary' : 'staff-uid' }],
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
          useClass: returnUrl ? MockWorkerServiceWithUpdateWorker : MockWorkerServiceWithoutReturnUrl,
        },
        {
          provide: QualificationService,
          useClass: MockQualificationService,
        },
        AlertService,
        WindowRef,
      ],
    });
    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.stub();

    const workerService = injector.inject(WorkerService) as WorkerService;
    const hasCompletedStaffRecordFlowSpy = spyOnProperty(workerService, 'hasCompletedStaffRecordFlow', 'set');

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
      router,
      routerSpy,
      alertSpy,
      hasCompletedStaffRecordFlowSpy,
    };
  }

  it('should render a OtherQualificationsLevelComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the OtherQualificationsLevelComponent heading, subheading and select box', async () => {
    const { getByText, getByLabelText, getByTestId } = await setup();

    expect(getByText(`What's the highest level of their other qualifications?`)).toBeTruthy;
    expect(getByTestId('section-heading')).toBeTruthy();
    expect(getByLabelText('Qualification level')).toBeTruthy();
  });

  describe('submit buttons', () => {
    it('should render the page with a save button when the return value is null', async () => {
      const { getByText } = await setup(false);

      const button = getByText('Save');
      const viewRecordLink = getByText('View this staff record');

      expect(button).toBeTruthy();
      expect(viewRecordLink).toBeTruthy();
    });

    it('should render the page with a save and return button and an cancel link when there is a return value', async () => {
      const { getByText } = await setup();

      const button = getByText('Save and return');
      const exitLink = getByText('Cancel');

      expect(button).toBeTruthy();
      expect(exitLink).toBeTruthy();
    });
  });

  describe('progress bar', () => {
    it('should render the workplace progress bar', async () => {
      const { getByTestId } = await setup(false);

      expect(getByTestId('progress-bar-1')).toBeTruthy();
    });

    it('should not render the progress bars when accessed from outside the flow', async () => {
      const { queryByTestId } = await setup();

      expect(queryByTestId('progress-bar-1')).toBeFalsy();
    });
  });

  describe('navigation', () => {
    it('should navigate to confirm-staff-record page when submitting from flow', async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const select = getByLabelText('Qualification level', { exact: false });
      fireEvent.change(select, { target: { value: '1' } });

      const saveButton = getByText('Save');
      fireEvent.click(saveButton);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'confirm-staff-record',
      ]);
    });

    it('should navigate to confirm-staff-record page when skipping the question in the flow', async () => {
      const { component, routerSpy, getByText } = await setup(false);

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const skipButton = getByText('Skip this question');
      fireEvent.click(skipButton);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'confirm-staff-record',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing save and return', async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const select = getByLabelText('Qualification level', { exact: false });
      fireEvent.change(select, { target: { value: '1' } });

      const skipButton = getByText('Save and return');
      fireEvent.click(skipButton);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should navigate to staff-summary-page page when pressing cancel', async () => {
      const { component, routerSpy, getByText } = await setup();

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      const skipButton = getByText('Cancel');
      fireEvent.click(skipButton);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('should navigate to wdf staff-summary-page page when pressing save and return in wdf version of page', async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText, router } = await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const select = getByLabelText('Qualification level', { exact: false });
      fireEvent.change(select, { target: { value: '1' } });

      const skipButton = getByText('Save and return');
      fireEvent.click(skipButton);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'staff-record', workerId]);
    });

    it('should navigate to wdf staff-summary-page page when pressing cancel in wdf version of page', async () => {
      const { component, routerSpy, getByText, router, fixture } = await setup(false);
      spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      const workerId = component.worker.uid;

      const skipButton = getByText('Cancel');
      fireEvent.click(skipButton);

      expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'staff-record', workerId]);
    });
  });

  describe('Completing Add details to staff record flow', () => {
    it('should add Staff record added alert when submitting from flow', async () => {
      const { getByText, getByLabelText, alertSpy } = await setup(false);

      const select = getByLabelText('Qualification level', { exact: false });
      fireEvent.change(select, { target: { value: '1' } });

      const saveButton = getByText('Save');
      fireEvent.click(saveButton);

      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Staff record saved',
      });
    });

    it('should set hasCompletedStaffRecordFlow in worker service when submitting in flow', async () => {
      const { getByText, getByLabelText, hasCompletedStaffRecordFlowSpy } = await setup(false);

      const select = getByLabelText('Qualification level', { exact: false });
      fireEvent.change(select, { target: { value: '1' } });

      const saveButton = getByText('Save');
      fireEvent.click(saveButton);

      expect(hasCompletedStaffRecordFlowSpy).toHaveBeenCalled();
    });

    it('should not add Staff record added alert when user submits but not in flow', async () => {
      const { getByText, getByLabelText, alertSpy } = await setup();

      const select = getByLabelText('Qualification level', { exact: false });
      fireEvent.change(select, { target: { value: '1' } });

      const saveButton = getByText('Save and return');
      fireEvent.click(saveButton);

      expect(alertSpy).not.toHaveBeenCalled();
    });
  });
});
