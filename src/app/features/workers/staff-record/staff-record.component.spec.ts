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
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, screen } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { WorkersModule } from '../workers.module';
import { StaffRecordComponent } from './staff-record.component';

describe('StaffRecordComponent', () => {
  async function setup() {
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
              isParent: true,
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

  it('should render the Complete record button and correct text when worker.completed is false', async () => {
    const { component, fixture } = await setup();

    component.worker.completed = false;
    fixture.detectChanges();
    const button = screen.getByText('Confirm record details');
    const text = screen.getByText(`Check the record details you've added before you confirm them.`);
    const flagLongTermAbsenceLink = screen.queryByText('Flag long-term absence');
    const deleteRecordLink = screen.queryByText('Delete staff record');
    const trainingAndQualsLink = screen.queryByText('Training and qualifications');

    expect(button).toBeTruthy();
    expect(text).toBeTruthy();
    expect(flagLongTermAbsenceLink).toBeFalsy();
    expect(deleteRecordLink).toBeFalsy();
    expect(trainingAndQualsLink).toBeFalsy();
  });

  it('should render the completed state text, delete record link, add training link and flag long term absence link when worker.completed is true', async () => {
    const { component, fixture } = await setup();

    component.canEditWorker = true;
    component.canDeleteWorker = true;
    component.worker.longTermAbsence = null;
    component.worker.completed = true;

    fixture.detectChanges();

    const button = screen.queryByText('Confirm record details');
    const text = screen.getByText(`Check the record details you've added are correct.`);
    const flagLongTermAbsenceLink = screen.getByText('Flag long-term absence');
    const deleteRecordLink = screen.getByText('Delete staff record');
    const trainingAndQualsLink = screen.getByText('Training and qualifications');

    expect(button).toBeFalsy();
    expect(text).toBeTruthy();
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
    const { getByText, component, fixture } = await setup();

    component.canEditWorker = true;
    component.worker.completed = true;
    fixture.detectChanges();

    const workplaceUid = component.workplace.uid;
    const workerUid = component.worker.uid;
    const link = getByText('Training and qualifications');
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
      const { component, fixture, workerService } = await setup();

      component.worker.completed = false;
      fixture.detectChanges();

      const updateWorkerSpy = spyOn(workerService, 'updateWorker').and.callThrough();
      const workplaceUid = component.workplace.uid;
      const workerUid = component.worker.uid;

      const button = screen.getByText('Confirm record details');
      fireEvent.click(button);

      expect(updateWorkerSpy).toHaveBeenCalledWith(workplaceUid, workerUid, { completed: true });
    });

    it('should redirect back to the dashboard when worker is confirmed if workplace and establishment are the same', async () => {
      const { component, fixture, routerSpy } = await setup();

      component.workplace.uid = 'mock-uid';
      component.worker.completed = false;
      fixture.detectChanges();

      const button = screen.getByText('Confirm record details');
      fireEvent.click(button);

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], {
        fragment: 'staff-records',
        state: { showBanner: true },
      });
    });

    it('should redirect back to the child workplace when the worker is confirmed if a parent is in a child workplace', async () => {
      const { component, fixture, routerSpy } = await setup();

      component.worker.completed = false;
      fixture.detectChanges();

      const button = screen.getByText('Confirm record details');
      fireEvent.click(button);

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', component.workplace.uid], {
        fragment: 'staff-records',
        state: { showBanner: true },
      });
    });
  });
});
