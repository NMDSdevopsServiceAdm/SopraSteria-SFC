import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { VacanciesAndTurnoverService } from '@core/services/vacancies-and-turnover.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockVacanciesAndTurnoverService } from '@core/test-utils/MockVacanciesAndTurnoverService';
import { MockWorkerServiceWithOverrides } from '@core/test-utils/MockWorkerService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { WorkersModule } from '../workers.module';
import { StaffRecordComponent } from './staff-record.component';

describe('StaffRecordComponent', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function setup(overrides: any = {}) {
    const isParent = overrides.isParent ?? true;
    const permissions = overrides.permissions ?? ['canEditWorker', 'canDeleteWorker'];
    const clearDoYouWantToAddOrDeleteAnswerSpy = jasmine.createSpy('clearDoYouWantToAddOrDeleteAnswer');
    const thisWorkerId = overrides?.thisWorkerId ?? 'uid2';
    const listOfWorkerIds = overrides?.listOfWorkerIds ?? ['uid1', 'uid2', 'uid3'];

    const workplace = establishmentBuilder() as Establishment;

    const localStorageGetSpy = spyOn(localStorage, 'getItem');
    localStorageGetSpy.and.returnValue(JSON.stringify(listOfWorkerIds));

    const setupTools = await render(StaffRecordComponent, {
      imports: [SharedModule, RouterModule, WorkersModule],
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
            params: of({ id: thisWorkerId }),
            snapshot: {
              params: overrides.establishmentuid ? { establishmentuid: overrides.establishmentuid } : {},
              paramMap: {
                get(id) {
                  return thisWorkerId;
                },
              },
              data: {
                workerHasAnyTrainingOrQualifications: {
                  hasAnyTrainingOrQualifications: overrides?.hasAnyTrainingOrQualifications ?? false,
                },
              },
            },
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
        {
          provide: VacanciesAndTurnoverService,
          useFactory: MockVacanciesAndTurnoverService.factory({
            clearDoYouWantToAddOrDeleteAnswer: clearDoYouWantToAddOrDeleteAnswerSpy,
          }),
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    spyOn(router, 'navigateByUrl'); // suppress Error: NG04002: Cannot match any route

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
      clearDoYouWantToAddOrDeleteAnswerSpy,
      localStorageGetSpy,
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

  [true, false].forEach((completedValue) => {
    it(`should render the add training link and flag long term absence link, when worker.completed is ${completedValue}`, async () => {
      const { queryByText, getByText, getByTestId, getByRole, getAllByTestId } = await setup({
        workerService: { worker: { uid: '123', completed: completedValue, longTermAbsence: null } },
      });

      const button = queryByText('Confirm record details');
      const flagLongTermAbsenceLink = getByText('Flag long-term absence');
      const deleteRecordLink = getByRole('button', { name: 'Delete staff record' });
      const trainingAndQualsLink = getByTestId('training-and-qualifications-link');
      const pagination = getAllByTestId('worker-pagination');
      const closeButton = within(pagination[0]).getByText('Close this staff record');

      expect(button).toBeFalsy();
      expect(flagLongTermAbsenceLink).toBeTruthy();
      expect(deleteRecordLink).toBeTruthy();
      expect(trainingAndQualsLink).toBeTruthy();
      expect(closeButton).toBeTruthy();
      expect(pagination.length).toEqual(2);
    });
  });

  describe('delete staff record link', () => {
    it('should navigate to delete-staff-record page when hasAnyTrainingOrQualifications is false', async () => {
      const overrides = {
        hasAnyTrainingOrQualifications: false,
        workerService: { worker: { completed: true, longTermAbsence: null } },
      };

      const { getByRole, fixture, routerSpy, workplaceUid, workerUid } = await setup(overrides);

      const deleteRecordLink = getByRole('button', { name: 'Delete staff record' });
      fireEvent.click(deleteRecordLink);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceUid,
        'staff-record',
        workerUid,
        'delete-staff-record',
      ]);
    });

    it('should navigate to download-staff-training-and-qualifications page when hasAnyTrainingOrQualifications is true', async () => {
      const overrides = {
        hasAnyTrainingOrQualifications: true,
        workerService: { worker: { completed: true, longTermAbsence: null } },
      };

      const { getByRole, fixture, routerSpy, workplaceUid, workerUid } = await setup(overrides);

      const deleteRecordLink = getByRole('button', { name: 'Delete staff record' });

      fireEvent.click(deleteRecordLink);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceUid,
        'staff-record',
        workerUid,
        'download-staff-training-and-qualifications',
      ]);
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
    const { getByTestId, workplaceUid, workerUid } = await setup();

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

  describe('Pagination controls', () => {
    it('should set the Close this staff record buttons to navigate back to workplace staff tab', async () => {
      const { getAllByText } = await setup({
        workerService: { worker: { completed: true }, addStaffRecordInProgress: false },
      });

      const closeRecordButtons = getAllByText('Close this staff record');
      const expectedLink = `/dashboard#staff-records`;

      expect(closeRecordButtons.length).toEqual(2);

      expect((closeRecordButtons[0] as HTMLAnchorElement).href).toContain(expectedLink);
      expect((closeRecordButtons[1] as HTMLAnchorElement).href).toContain(expectedLink);
    });

    it('should set the expected previous link', async () => {
      const { getAllByText, workplaceUid } = await setup({
        workerService: { worker: { completed: true }, addStaffRecordInProgress: false },
      });

      const previousLinks = getAllByText('Previous staff record') as HTMLAnchorElement[];
      const expectedLink = `${workplaceUid}/staff-record/uid1/staff-record-summary`;

      expect(previousLinks[0].href).toContain(expectedLink);
      expect(previousLinks[1].href).toContain(expectedLink);
    });

    it('should set the expected next link', async () => {
      const { getAllByText, workplaceUid } = await setup({
        workerService: { worker: { completed: true }, addStaffRecordInProgress: false },
      });

      const nextLinks = getAllByText('Next staff record') as HTMLAnchorElement[];
      const expectedLink = `${workplaceUid}/staff-record/uid3/staff-record-summary`;

      expect(nextLinks[0].href).toContain(expectedLink);
      expect(nextLinks[1].href).toContain(expectedLink);
    });

    it('should not show a "Previous staff record" link if it is the first worker in list', async () => {
      const { queryAllByText } = await setup({
        workerService: { worker: { completed: true }, addStaffRecordInProgress: false },
        listOfWorkerIds: ['uid1', 'uid2'],
        thisWorkerId: 'uid1',
      });

      const previousLinks = queryAllByText('Previous staff record') as HTMLAnchorElement[];
      expect(previousLinks.length).toEqual(0);

      const nextLinks = queryAllByText('Next staff record') as HTMLAnchorElement[];
      expect(nextLinks.length).toEqual(2);
    });

    it('should not show a "Next staff record" link if it is the last worker in list', async () => {
      const { queryAllByText } = await setup({
        workerService: { worker: { completed: true }, addStaffRecordInProgress: false },
        listOfWorkerIds: ['uid1', 'uid2'],
        thisWorkerId: 'uid2',
      });

      const previousLinks = queryAllByText('Previous staff record') as HTMLAnchorElement[];
      expect(previousLinks.length).toEqual(2);

      const nextLinks = queryAllByText('Next staff record') as HTMLAnchorElement[];
      expect(nextLinks.length).toEqual(0);
    });
  });

  describe('Add details to worker flow', () => {
    describe('Continue buttons', () => {
      it('should render a Continue button at top and bottom of page when addStaffRecordInProgress is true', async () => {
        const { getAllByText } = await setup({
          workerService: { worker: { completed: true }, addStaffRecordInProgress: true },
        });

        const continueButtons = getAllByText('Continue');

        expect(continueButtons.length).toEqual(2);
      });

      it('should not render the Continue record button when completed is true and addStaffRecordInProgress is false', async () => {
        const { queryByText } = await setup({
          workerService: { worker: { completed: true }, addStaffRecordInProgress: false },
        });

        const button = queryByText('Continue');

        expect(button).toBeFalsy();
      });

      it('should not render the Continue record button when completed is false and addStaffRecordInProgress is false', async () => {
        const { queryByText } = await setup({
          workerService: { worker: { completed: false }, addStaffRecordInProgress: false },
        });

        const button = queryByText('Continue');

        expect(button).toBeFalsy();
      });

      [
        { index: 0, position: 'top' },
        { index: 1, position: 'bottom' },
      ].forEach((scenario) => {
        it(`should have "Add another staff record" href on Continue button at ${scenario.position} of page`, async () => {
          const { getAllByText, workplaceUid } = await setup({
            workerService: { worker: { completed: false }, addStaffRecordInProgress: true },
          });

          const continueButtons = getAllByText('Continue');
          fireEvent.click(continueButtons[scenario.index]);

          expect(continueButtons[scenario.index].getAttribute('href')).toEqual(
            `/workplace/${workplaceUid}/staff-record/add-another-staff-record`,
          );
        });
      });

      it('should clear doYouWantToAddOrDeleteAnswer when continue buttons show to ensure no side effects from previous visits', async () => {
        const { clearDoYouWantToAddOrDeleteAnswerSpy } = await setup({
          workerService: { addStaffRecordInProgress: true },
        });

        expect(clearDoYouWantToAddOrDeleteAnswerSpy).toHaveBeenCalled();
      });
    });

    describe('Pagination controls', () => {
      it('should not show Pagination controls when addStaffRecordInProgress is true', async () => {
        const { queryAllByText } = await setup({
          workerService: { worker: { completed: true }, addStaffRecordInProgress: true },
        });

        const previousLinks = queryAllByText('Previous staff record') as HTMLAnchorElement[];
        const nextLinks = queryAllByText('Next staff record') as HTMLAnchorElement[];
        const closeRecordButtons = queryAllByText('Close this staff record');

        expect(previousLinks.length).toEqual(0);
        expect(nextLinks.length).toEqual(0);
        expect(closeRecordButtons.length).toEqual(0);
      });
    });

    describe('Updating completed', () => {
      it('should call updateWorker on load of page when completed is false for worker and has come from add staff record flow', async () => {
        const updateWorkerSpy = jasmine.createSpy('updateWorker').and.returnValue(of(true));

        const { workplaceUid, workerUid } = await setup({
          workerService: {
            addStaffRecordInProgress: true,
            updateWorker: updateWorkerSpy,
            worker: { completed: false },
          },
        });

        expect(updateWorkerSpy).toHaveBeenCalledWith(workplaceUid, workerUid, { completed: true });
      });

      it("should call updateWorker on load of page when completed is false for worker and hasn't come from add staff record flow", async () => {
        const updateWorkerSpy = jasmine.createSpy('updateWorker').and.returnValue(of(true));

        const { workplaceUid, workerUid } = await setup({
          workerService: {
            addStaffRecordInProgress: false,
            updateWorker: updateWorkerSpy,
            worker: { completed: false },
          },
        });

        expect(updateWorkerSpy).toHaveBeenCalledWith(workplaceUid, workerUid, { completed: true });
      });

      it('should not call updateWorker when completed is true for worker', async () => {
        const updateWorkerSpy = jasmine.createSpy('updateWorker').and.returnValue(of(true));

        await setup({
          workerService: {
            updateWorker: updateWorkerSpy,
            worker: { completed: true },
          },
        });

        expect(updateWorkerSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('transfer staff record link', () => {
    it('should show the link when the primary workplace is a parent and has canEdit permissions', async () => {
      const { getByText } = await setup({ isParent: true });

      expect(getByText('Transfer staff record')).toBeTruthy();
    });

    it('should not show the link when there are no canEditWorker permissions', async () => {
      const { queryByText } = await setup({ permissions: [] });

      expect(queryByText('Transfer staff record')).toBeFalsy();
    });

    it('should not show the link when the workplace is not a parent', async () => {
      const { queryByText } = await setup({ isParent: false });

      expect(queryByText('Transfer staff record')).toBeFalsy();
    });
  });
});
