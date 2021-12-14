import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { WorkersModule } from '../workers.module';
import { TrainingAndQualificationsRecordComponent } from './training-and-qualifications-record.component';

describe('TrainingAndQualificationsRecordComponent', () => {
  const workplace = establishmentBuilder() as Establishment;

  async function setup() {
    const { fixture, getByText, getAllByText, queryByText, getByTestId } = await render(
      TrainingAndQualificationsRecordComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkersModule],
        providers: [
          AlertService,
          WindowRef,
          {
            provide: ActivatedRoute,
            useValue: {
              parent: {
                snapshot: {
                  data: {
                    establishment: workplace,
                  },
                },
              },
              snapshot: {
                data: {
                  worker: {
                    uid: 123,
                    nameOrId: 'John',
                  },
                  trainingRecords: {
                    count: 1,
                    training: [],
                  },
                  qualifications: {
                    count: 2,
                  },
                  expiresSoonAlertDate: {
                    expiresSoonAlertDate: '90',
                  },
                },
              },
            },
          },
          {
            provide: WorkerService,
            useClass: MockWorkerService,
          },
          { provide: EstablishmentService, useClass: MockEstablishmentService },
          { provide: BreadcrumbService, useClass: MockBreadcrumbService },
          { provide: PermissionsService, useClass: MockPermissionsService },
        ],
      },
    );

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
      workerSpy,
      getByText,
      getAllByText,
      getByTestId,
      queryByText,
      workplaceUid,
      workerUid,
    };
  }

  it('should render a TrainingAndQualificationsRecordComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the worker name', async () => {
    const { component, getByText } = await setup();

    expect(getByText(component.worker.nameOrId)).toBeTruthy();
  });

  it('should set returnTo$ in the worker service to the training and qualifications record page on init', async () => {
    const { component, workerSpy, workplaceUid, workerUid } = await setup();

    component.ngOnInit();

    expect(workerSpy).toHaveBeenCalledWith({
      url: ['/workplace', workplaceUid, 'training-and-qualifications-record', workerUid, 'training'],
    });
  });

  describe('Long-Term Absence', () => {
    it('should display the Long-Term Absence if the worker is currently flagged as long term absent', async () => {
      const { component, fixture, getByText, queryByText } = await setup();

      component.worker.longTermAbsence = 'Illness';
      fixture.detectChanges();

      expect(getByText('Long-term absent')).toBeTruthy();
      expect(queryByText('Flag long-term absence')).toBeFalsy();
    });

    it('should navigate to `/long-term-absence` when pressing the "view" button', async () => {
      const { component, fixture, getByTestId, workplaceUid, workerUid } = await setup();

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
      fixture.detectChanges();

      expect(getByText('Flag long-term absence')).toBeTruthy();
    });

    it('should navigate to `/long-term-absence` when pressing the "Flag long-term absence" button', async () => {
      const { component, fixture, getByTestId, workplaceUid, workerUid } = await setup();

      component.worker.longTermAbsence = null;
      component.canEditWorker = true;
      fixture.detectChanges();

      const flagLongTermAbsenceLink = getByTestId('flagLongTermAbsence');
      expect(flagLongTermAbsenceLink.getAttribute('href')).toBe(
        `/workplace/${workplaceUid}/training-and-qualifications-record/${workerUid}/long-term-absence`,
      );
    });
  });
});
