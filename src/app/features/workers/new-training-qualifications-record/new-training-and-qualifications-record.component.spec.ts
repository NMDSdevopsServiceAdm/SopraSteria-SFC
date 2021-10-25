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
import { NewTrainingAndQualificationsRecordComponent } from './new-training-and-qualifications-record.component';

describe('NewTrainingAndQualificationsRecordComponent', () => {
  const workplace = establishmentBuilder() as Establishment;

  async function setup() {
    const { fixture, getByText, getAllByText, queryByText, getByTestId } = await render(
      NewTrainingAndQualificationsRecordComponent,
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
                    mandatory: [],
                    nonMandatory: [
                      {
                        category: 'Health',
                        id: 1,
                        trainingRecords: [
                          {
                            accredited: true,
                            completed: new Date('10/20/2021'),
                            expires: new Date('10/20/2022'),
                            title: 'Health training',
                            trainingCategory: { id: 1, category: 'Health' },
                            uid: 'someuid',
                          },
                        ],
                      },
                      {
                        category: 'Autism',
                        id: 2,
                        trainingRecords: [
                          {
                            accredited: true,
                            completed: new Date('10/20/2021'),
                            expires: new Date('10/20/2022'),
                            title: 'Autism training',
                            trainingCategory: { id: 2, category: 'Autism' },
                            uid: 'someuid',
                          },
                        ],
                      },
                    ],
                    qualifications: {
                      count: 2,
                      groups: [
                        {
                          group: 'Health',
                          id: 1,
                          records: [
                            {
                              year: '2022',
                              notes: '',
                              title: 'Health training',
                              groups: { id: 1, group: 'Health' },
                              uid: 'someuid',
                            },
                          ],
                        },
                        {
                          group: 'Autism',
                          id: 2,
                          records: [
                            {
                              year: '2021',
                              notes: 'test',
                              title: 'Autism training',
                              groups: { id: 2, group: 'Autism' },
                              uid: 'someuid',
                            },
                          ],
                        },
                      ],
                    },
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

  it('should display number of training records in the title', async () => {
    const { getByText } = await setup();
    expect(getByText('Training and qualifications (4)')).toBeTruthy();
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

  describe('Non mandatory training', () => {
    it('should have non mandatory count of 2', async () => {
      const { getByText } = await setup();
      expect(getByText('Non-mandatory training records (2)')).toBeTruthy();
    });

    it('should render non-mandatory training component', async () => {
      const { getByTestId } = await setup();
      expect(getByTestId('non-mandatory-training')).toBeTruthy();
    });

    it('should render message wihen there is no non-mandatory training', async () => {
      const { component, fixture, getByText } = await setup();
      component.nonMandatoryTrainingCount = 0;
      fixture.detectChanges();

      const expectedText = 'No non-mandatory training records have been added for this person yet.';
      expect(getByText(expectedText)).toBeTruthy();
    });
  });
});
