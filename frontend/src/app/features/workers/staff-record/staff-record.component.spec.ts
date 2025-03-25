import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerServiceWithOverrides } from '@core/test-utils/MockWorkerService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { WorkersModule } from '../workers.module';
import { StaffRecordComponent } from './staff-record.component';

describe('StaffRecordComponent', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function setup(overrides: any = {}) {
    const isParent = overrides.isParent ?? true;
    const permissions = overrides.permissions ?? ['canEditWorker', 'canDeleteWorker'];

    const workplace = establishmentBuilder() as Establishment;
    const setupTools = await render(StaffRecordComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, WorkersModule],
      providers: [
        AlertService,
        WindowRef,
        DialogService,
        InternationalRecruitmentService,
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                data: {
                  establishment: workplace,
                },
                url: [{ path: 'staff-record-summary' }],
              },
            },
            snapshot: {},
          },
        },
        {
          provide: WorkerService,
          useFactory: MockWorkerServiceWithOverrides.factory(overrides.workerService),
        },
        {
          provide: EstablishmentService,
          useValue: {
            establishmentId: 'mock-uid',
            primaryWorkplace: {
              isParent,
            },
          },
        },
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: PermissionsService, useFactory: MockPermissionsService.factory(permissions) },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    const workerService = injector.inject(WorkerService) as WorkerService;
    const workerSpy = spyOn(workerService, 'setReturnTo');
    workerSpy.and.callThrough();

    const workplaceUid = component.workplace.uid;
    const workerUid = component.worker.uid;

    const alert = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alert, 'addAlert').and.callThrough();

    return {
      ...setupTools,
      component,
      routerSpy,
      workerService,
      workerSpy,
      workplaceUid,
      workerUid,
      alertSpy,
    };
  }

  it('should render a StaffRecordComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the worker name', async () => {
    const { component, getAllByText } = await setup();

    expect(getAllByText(component.worker.nameOrId).length).toBe(2);
  });

  it('should render a Continue button at top and bottom of page when worker.completed is false and canEditWorker is true', async () => {
    const { getAllByText } = await setup({ workerService: { worker: { completed: false } } });

    const continueButtons = getAllByText('Continue');

    expect(continueButtons.length).toEqual(2);
  });

  it('should not render the Continue record button when worker.completed is false and canEditWorker is false', async () => {
    const { queryByText } = await setup({ workerService: { worker: { completed: false } }, permissions: [] });

    const button = queryByText('Continue');
    const flagLongTermAbsenceLink = queryByText('Flag long-term absence');
    const deleteRecordLink = queryByText('Delete staff record');

    expect(button).toBeFalsy();
    expect(flagLongTermAbsenceLink).toBeFalsy();
    expect(deleteRecordLink).toBeFalsy();
  });

  [true, false].forEach((completedValue) => {
    it(`should render the delete record link, add training link and flag long term absence link, when worker.completed is ${completedValue}`, async () => {
      const { queryByText, getByText, getByTestId, getByRole, workplaceUid, workerUid } = await setup({
        workerService: { worker: { completed: completedValue, longTermAbsence: null } },
      });

      const button = queryByText('Confirm record details');
      const flagLongTermAbsenceLink = getByText('Flag long-term absence');
      const deleteRecordLink = getByRole('button', { name: 'Delete staff record' });
      const trainingAndQualsLink = getByTestId('training-and-qualifications-link');

      expect(button).toBeFalsy();
      expect(flagLongTermAbsenceLink).toBeTruthy();
      expect(deleteRecordLink).toBeTruthy();
      expect(deleteRecordLink.getAttribute('href')).toEqual(
        `/workplace/${workplaceUid}/staff-record/${workerUid}/delete-staff-record`,
      );
      expect(trainingAndQualsLink).toBeTruthy();
    });
  });

  it('should set returnTo$ in the worker service to the staff record page on init', async () => {
    const { component, workerSpy, workplaceUid, workerUid } = await setup();

    component.setReturnTo();

    expect(workerSpy).toHaveBeenCalledWith({
      url: ['/workplace', workplaceUid, 'staff-record', workerUid],
      fragment: 'staff-record',
    });
  });

  it('should render the training and qualifications link with the correct href', async () => {
    const { getByTestId, workplaceUid, workerUid } = await setup({ workerService: { worker: { completed: true } } });

    const link = getByTestId('training-and-qualifications-link');
    expect(link.getAttribute('href')).toEqual(
      `/workplace/${workplaceUid}/training-and-qualifications-record/${workerUid}/training`,
    );
  });

  describe('Long-Term Absence', () => {
    it('should display the Long-Term Absence if the worker is currently flagged as long term absent', async () => {
      const { getByText, queryByText } = await setup({
        workerService: { worker: { completed: true, longTermAbsence: 'Illness' } },
      });

      expect(getByText('Long-term absent')).toBeTruthy();
      expect(queryByText('Flag long-term absence')).toBeFalsy();
    });

    it('should navigate to `long-term-absence` when pressing the "view" button', async () => {
      const { getByTestId, workplaceUid, workerUid } = await setup({
        workerService: { worker: { completed: true, longTermAbsence: 'Illness' } },
      });

      const longTermAbsenceLink = getByTestId('longTermAbsence');
      expect(longTermAbsenceLink.getAttribute('href')).toBe(
        `/workplace/${workplaceUid}/training-and-qualifications-record/${workerUid}/long-term-absence`,
      );
    });
  });

  describe('Flag long-term absence', () => {
    it('should display the "Flag long-term absence" link if the worker is not currently flagged as long term absent', async () => {
      const { getByText } = await setup({ workerService: { worker: { completed: true, longTermAbsence: null } } });

      expect(getByText('Flag long-term absence')).toBeTruthy();
    });

    it('should navigate to `./long-term-absence` when pressing the "Flag long-term absence" button', async () => {
      const { getByTestId, workplaceUid, workerUid } = await setup({
        workerService: { worker: { completed: true, longTermAbsence: null } },
      });

      const flagLongTermAbsenceLink = getByTestId('flagLongTermAbsence');
      expect(flagLongTermAbsenceLink.getAttribute('href')).toBe(
        `/workplace/${workplaceUid}/training-and-qualifications-record/${workerUid}/long-term-absence`,
      );
    });
  });

  describe('saveAndComplete', () => {
    it('should call updateWorker on the worker service when Continue button is clicked', async () => {
      const { workerService, getAllByText, workplaceUid, workerUid } = await setup({
        workerService: { worker: { completed: false } },
      });

      const updateWorkerSpy = spyOn(workerService, 'updateWorker').and.callThrough();

      const continueButtons = getAllByText('Continue');
      fireEvent.click(continueButtons[0]);

      expect(updateWorkerSpy).toHaveBeenCalledWith(workplaceUid, workerUid, { completed: true });
    });

    it('should navigate to the "Add another staff record" page when Continue button is clicked', async () => {
      const { routerSpy, getAllByText, workplaceUid } = await setup({
        workerService: { worker: { completed: false } },
      });

      const continueButtons = getAllByText('Continue');
      fireEvent.click(continueButtons[0]);

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceUid, 'staff-record', 'add-another-staff-record']);
    });
  });

  describe('transfer staff record link', () => {
    it('should show the link when the primary workplace is a parent and has canEdit permissions', async () => {
      const { getByText } = await setup({ workerService: { worker: { completed: true } } });

      expect(getByText('Transfer staff record')).toBeTruthy();
    });

    it('should not show the link when there are no canEditWorker permissions', async () => {
      const { queryByText } = await setup({ worker: { completed: true }, permissions: [] });

      expect(queryByText('Transfer staff record')).toBeFalsy();
    });

    it('should not show the link when the workplace is not a parent', async () => {
      const { queryByText } = await setup({ isParent: false, workerService: { worker: { completed: true } } });

      expect(queryByText('Transfer staff record')).toBeFalsy();
    });
  });
});
