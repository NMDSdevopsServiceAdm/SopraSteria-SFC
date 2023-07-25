import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { WorkersModule } from '../workers.module';
import { StaffRecordComponent } from './staff-record.component';

describe('StaffRecordComponent', () => {
  async function setup(isParent = true) {
    const workplace = establishmentBuilder() as Establishment;
    const { fixture, getByText, getAllByText, queryByText, getByTestId } = await render(StaffRecordComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkersModule],
      providers: [
        AlertService,
        WindowRef,
        DialogService,
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                data: {
                  establishment: workplace,
                },
                url: [{ path: '' }],
              },
            },
            snapshot: {},
          },
        },
        {
          provide: WorkerService,
          useClass: MockWorkerServiceWithUpdateWorker,
        },
        {
          provide: EstablishmentService,
          useValue: {
            establishmentId: 'mock-uid',
            isOwnWorkplace: () => true,
            primaryWorkplace: {
              isParent,
            },
          },
        },
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: PermissionsService, useClass: MockPermissionsService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
      ],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    const workerService = injector.inject(WorkerService) as WorkerService;
    const workerSpy = spyOn(workerService, 'setReturnTo');
    workerSpy.and.callThrough();

    const workplaceUid = component.workplace.uid;
    const workerUid = component.worker.uid;

    return {
      component,
      fixture,
      routerSpy,
      workerService,
      workerSpy,
      getByText,
      getAllByText,
      getByTestId,
      queryByText,
      workplaceUid,
      workerUid,
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

  it('should render the Complete record button and correct text when worker.completed is false and canEditWorker is true', async () => {
    const { component, fixture, getByText, queryByText } = await setup();
    component.canEditWorker = true;
    component.worker.completed = false;
    fixture.detectChanges();
    const button = getByText('Confirm record details');
    const text = getByText(`Check these details before you confirm them.`);
    const flagLongTermAbsenceLink = queryByText('Flag long-term absence');
    const deleteRecordLink = queryByText('Delete staff record');

    expect(button).toBeTruthy();
    expect(text).toBeTruthy();
    expect(flagLongTermAbsenceLink).toBeFalsy();
    expect(deleteRecordLink).toBeFalsy();
  });

  it('should not render the Complete record button when worker.completed is false and canEditWorker is false', async () => {
    const { component, fixture, queryByText } = await setup();

    component.worker.completed = false;
    fixture.detectChanges();
    const button = queryByText('Confirm record details');
    const text = queryByText(`Check these details before you confirm them.`);
    const flagLongTermAbsenceLink = queryByText('Flag long-term absence');
    const deleteRecordLink = queryByText('Delete staff record');

    expect(button).toBeFalsy();
    expect(text).toBeFalsy();
    expect(flagLongTermAbsenceLink).toBeFalsy();
    expect(deleteRecordLink).toBeFalsy();
  });

  it('should render the delete record link, add training link and flag long term absence link, and not correct text when worker.completed is true', async () => {
    const { component, fixture, queryByText, getByText, getByTestId } = await setup();

    component.canEditWorker = true;
    component.canDeleteWorker = true;
    component.worker.longTermAbsence = null;
    component.worker.completed = true;

    fixture.detectChanges();

    const button = queryByText('Confirm record details');
    const text = queryByText(`Check the record details you've added are correct.`);
    const flagLongTermAbsenceLink = getByText('Flag long-term absence');
    const deleteRecordLink = getByText('Delete staff record');
    const trainingAndQualsLink = getByTestId('training-and-qualifications-link');

    expect(button).toBeFalsy();
    expect(text).toBeFalsy();
    expect(flagLongTermAbsenceLink).toBeTruthy();
    expect(deleteRecordLink).toBeTruthy();
    expect(trainingAndQualsLink).toBeTruthy();
  });

  it('should set returnTo$ in the worker service to the training and qualifications record page on init', async () => {
    const { component, workerSpy, workplaceUid, workerUid } = await setup();

    component.setReturnTo();

    expect(workerSpy).toHaveBeenCalledWith({
      url: ['/workplace', workplaceUid, 'staff-record', workerUid],
      fragment: 'staff-record',
    });
  });

  it('should render the training and qualifications link with the correct href', async () => {
    const { getByTestId, component, fixture } = await setup();

    component.canEditWorker = true;
    component.worker.completed = true;
    fixture.detectChanges();

    const workplaceUid = component.workplace.uid;
    const workerUid = component.worker.uid;
    const link = getByTestId('training-and-qualifications-link');
    expect(link.getAttribute('href')).toEqual(
      `/workplace/${workplaceUid}/training-and-qualifications-record/${workerUid}/training`,
    );
  });

  describe('Long-Term Absence', () => {
    it('should display the Long-Term Absence if the worker is currently flagged as long term absent', async () => {
      const { component, fixture, getByText, queryByText } = await setup();

      component.worker.completed = true;
      component.worker.longTermAbsence = 'Illness';
      fixture.detectChanges();

      expect(getByText('Long-term absent')).toBeTruthy();
      expect(queryByText('Flag long-term absence')).toBeFalsy();
    });

    it('should navigate to `long-term-absence` when pressing the "view" button', async () => {
      const { component, fixture, getByTestId, workplaceUid, workerUid } = await setup();

      component.worker.completed = true;
      component.worker.longTermAbsence = 'Illness';
      fixture.detectChanges();

      const longTermAbsenceLink = getByTestId('longTermAbsence');
      expect(longTermAbsenceLink.getAttribute('href')).toBe(
        `/workplace/${workplaceUid}/training-and-qualifications-record/${workerUid}/long-term-absence`,
      );
    });
  });

  describe('Flag long-term absence', () => {
    it('should display the "Flag long-term absence" link if the worker is not currently flagged as long term absent', async () => {
      const { component, fixture, getByText } = await setup();

      component.worker.longTermAbsence = null;
      component.canEditWorker = true;
      component.worker.completed = true;
      fixture.detectChanges();

      expect(getByText('Flag long-term absence')).toBeTruthy();
    });

    it('should navigate to `./long-term-absence` when pressing the "Flag long-term absence" button', async () => {
      const { component, fixture, getByTestId, workplaceUid, workerUid } = await setup();

      component.worker.longTermAbsence = null;
      component.canEditWorker = true;
      component.worker.completed = true;
      fixture.detectChanges();

      const flagLongTermAbsenceLink = getByTestId('flagLongTermAbsence');
      expect(flagLongTermAbsenceLink.getAttribute('href')).toBe(
        `/workplace/${workplaceUid}/training-and-qualifications-record/${workerUid}/long-term-absence`,
      );
    });
  });

  describe('saveAndComplete', () => {
    it('should call updateWorker on the worker service when button is clicked', async () => {
      const { component, fixture, workerService, getByText } = await setup();

      component.canEditWorker = true;
      component.worker.completed = false;
      fixture.detectChanges();

      const updateWorkerSpy = spyOn(workerService, 'updateWorker').and.callThrough();
      const workplaceUid = component.workplace.uid;
      const workerUid = component.worker.uid;

      const button = getByText('Confirm record details');
      fireEvent.click(button);

      expect(updateWorkerSpy).toHaveBeenCalledWith(workplaceUid, workerUid, { completed: true });
    });

    it('should redirect back to the dashboard when worker is confirmed if workplace and establishment are the same', async () => {
      const { component, fixture, routerSpy, getByText } = await setup();

      component.canEditWorker = true;
      component.workplace.uid = 'mock-uid';
      component.worker.completed = false;
      fixture.detectChanges();

      const button = getByText('Confirm record details');
      fireEvent.click(button);

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], {
        fragment: 'staff-records',
        state: { showBanner: true },
      });
    });

    it('should redirect back to the child workplace when the worker is confirmed if a parent is in a child workplace', async () => {
      const { component, fixture, routerSpy, getByText } = await setup();

      component.canEditWorker = true;
      component.worker.completed = false;
      fixture.detectChanges();

      const button = getByText('Confirm record details');
      fireEvent.click(button);

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', component.workplace.uid], {
        fragment: 'staff-records',
        state: { showBanner: true },
      });
    });
  });

  describe('transfer staff record link', () => {
    it('should show the link when the primary workplace is a parent and has canEdit permissions', async () => {
      const { component, fixture, getByText } = await setup();

      component.worker.completed = true;
      component.canEditWorker = true;
      fixture.detectChanges();

      expect(getByText('Transfer staff record')).toBeTruthy();
    });

    it('should not show the link when there are no canEditWorker permissions', async () => {
      const { component, fixture, queryByText } = await setup();

      component.worker.completed = true;
      component.canEditWorker = false;
      fixture.detectChanges();

      expect(queryByText('Transfer staff record')).toBeFalsy();
    });

    it('should not show the link when the workplace is not a parent', async () => {
      const { component, fixture, queryByText } = await setup(false);

      component.worker.completed = true;
      component.canEditWorker = true;
      fixture.detectChanges();

      expect(queryByText('Transfer staff record')).toBeFalsy();
    });

    it('should not show the link if the worker details have not been completed', async () => {
      const { component, fixture, queryByText } = await setup();

      component.worker.completed = false;
      component.canEditWorker = true;
      fixture.detectChanges();

      expect(queryByText('Transfer staff record')).toBeFalsy();
    });
  });
});
