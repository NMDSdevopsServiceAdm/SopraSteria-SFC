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
import { MockWorkerService, qualificationsByGroup } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { WorkersModule } from '../workers.module';
import { NewTrainingAndQualificationsRecordComponent } from './new-training-and-qualifications-record.component';

describe('NewTrainingAndQualificationsRecordComponent', () => {
  const workplace = establishmentBuilder() as Establishment;

  const yesterday = new Date();
  const tomorrow = new Date();
  const activeDate = new Date();

  yesterday.setDate(yesterday.getDate() - 1);
  tomorrow.setDate(tomorrow.getDate() + 1);
  activeDate.setDate(activeDate.getDate() + 93); // 3 months in the future

  async function setup(
    otherJob = false,
    careCert = true,
    mandatoryTraining = [],
    jobRoleMandatoryTraining = [],
    noQualifications = false,
  ) {
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
                    mainJob: {
                      title: 'Care Worker',
                      other: otherJob ? 'Care taker' : undefined,
                    },
                    careCertificate: careCert ? 'Yes, in progress or partially completed' : null,
                  },
                  trainingAndQualificationRecords: {
                    training: {
                      lastUpdated: new Date('2020-01-01'),
                      jobRoleMandatoryTraining,
                      mandatory: mandatoryTraining,
                      nonMandatory: [
                        {
                          category: 'Health',
                          id: 1,
                          trainingRecords: [
                            {
                              accredited: true,
                              completed: new Date('10/20/2021'),
                              expires: activeDate,
                              title: 'Health training',
                              trainingCategory: { id: 1, category: 'Health' },
                              trainingStatus: 0,
                              uid: 'someHealthuid',
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
                              expires: yesterday,
                              title: 'Autism training',
                              trainingCategory: { id: 2, category: 'Autism' },
                              trainingStatus: 3,
                              uid: 'someAutismuid',
                            },
                          ],
                        },
                        {
                          category: 'Coshh',
                          id: 3,
                          trainingRecords: [
                            {
                              accredited: true,
                              completed: new Date('01/01/2010'),
                              expires: tomorrow,
                              title: 'Coshh training',
                              trainingCategory: { id: 3, category: 'Coshh' },
                              trainingStatus: 1,
                              uid: 'someCoshhuid',
                            },
                          ],
                        },
                      ],
                    },
                    qualifications: noQualifications
                      ? { count: 0, groups: [], lastUpdated: null }
                      : qualificationsByGroup,
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
      workerService,
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

    expect(getByText(component.worker.nameOrId, { exact: false })).toBeTruthy();
  });

  it('should display the worker job role', async () => {
    const { component, getByTestId } = await setup();

    expect(getByTestId('workerNameAndRole').textContent).toContain(component.worker.mainJob.title);
  });

  it('should display the other worker job role', async () => {
    const { component, getByTestId } = await setup(true);

    expect(getByTestId('workerNameAndRole').textContent).toContain(component.worker.mainJob.other);
  });

  it('should display the last updated date in the correct format', async () => {
    const { component, getByText, fixture } = await setup();

    component.lastUpdatedDate = new Date('2020-01-01');

    fixture.detectChanges();

    expect(getByText('Last updated 1 January 2020', { exact: false })).toBeTruthy();
  });

  it('should display the View staff record button', async () => {
    const { component, getByText, fixture } = await setup();

    component.canEditWorker = true;

    fixture.detectChanges();

    expect(getByText('View staff record', { exact: false })).toBeTruthy();
  });

  it('should have correct href on the View staff record button', async () => {
    const { component, getByText, fixture } = await setup();

    component.canEditWorker = true;

    fixture.detectChanges();

    const viewStaffRecordButton = getByText('View staff record', { exact: false });

    expect(viewStaffRecordButton.getAttribute('href')).toEqual(
      `/workplace/${component.workplace.uid}/staff-record/123/staff-record-summary`,
    );
  });

  it('should get the latest update date', async () => {
    const { component } = await setup();

    expect(component.lastUpdatedDate).toEqual(new Date('2020-01-02'));
  });

  it('should show the care certificate value', async () => {
    const { getByText } = await setup();

    expect(getByText('Care Certificate:', { exact: false })).toBeTruthy();
    expect(getByText('Yes, in progress or partially completed', { exact: false })).toBeTruthy();
  });

  it('should show not answered if no care certificate value', async () => {
    const { getByText } = await setup(false, false);

    expect(getByText('Care Certificate:', { exact: false })).toBeTruthy();
    expect(getByText('Not answered', { exact: false })).toBeTruthy();
  });

  it('should display number of training records in the title', async () => {
    const { getByText } = await setup();
    expect(getByText('Training and qualifications (6)')).toBeTruthy();
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

  describe('Mandatory training', () => {
    it('should display the mandatory training count', async () => {
      const mandatoryTraining = [
        {
          category: 'Management',
          id: 1,
          trainingRecords: [
            {
              accredited: true,
              completed: new Date('10/20/2021'),
              expires: new Date('10/20/2022'),
              title: 'Management training',
              trainingCategory: { id: 1, category: 'Management' },
              uid: 'someManagementuid',
            },
          ],
        },
      ];
      const { getByText } = await setup(false, true, mandatoryTraining);
      expect(getByText('Mandatory training records (1)')).toBeTruthy();
    });

    it('should display the message and link if no mandatory training has been set', async () => {
      const { component, fixture, getByText } = await setup();

      component.canEditWorker = true;
      fixture.detectChanges();

      const message = `No mandatory training has been set for the ${component.worker.mainJob.title} job role yet.`;

      expect(getByText(message)).toBeTruthy();
      expect(getByText('Manage mandatory training')).toBeTruthy();
    });

    it('should render the manage mandatory training link the correct href', async () => {
      const { component, fixture, getByText, workplaceUid } = await setup();

      component.canEditWorker = true;
      fixture.detectChanges();

      const link = getByText('Manage mandatory training');
      expect(link.getAttribute('href')).toBe(`/workplace/${workplaceUid}/add-and-manage-mandatory-training`);
    });

    it('should display the mandatory training table when training exists', async () => {
      const mandatoryTraining = [
        {
          category: 'Management',
          id: 1,
          trainingRecords: [
            {
              accredited: true,
              completed: new Date('10/20/2021'),
              expires: new Date('10/20/2022'),
              title: 'Management training',
              trainingCategory: { id: 1, category: 'Management' },
              uid: 'someManagementuid',
            },
          ],
        },
      ];
      const { getByTestId } = await setup(false, true, mandatoryTraining);

      expect(getByTestId('mandatory-training')).toBeTruthy();
    });
  });

  describe('Non mandatory training', () => {
    it('should display the non mandatory count', async () => {
      const { getByText } = await setup();
      expect(getByText('Non-mandatory training records (3)')).toBeTruthy();
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

  describe('Qualifications', () => {
    describe('No qualification records', () => {
      it('should show qualification record count as 0 when no qualification records', async () => {
        const { getByText } = await setup(false, true, [], [], true);
        expect(getByText('Qualification records (0)')).toBeTruthy();
      });

      it('should show 0 qualifications message when no qualification records', async () => {
        const { getByText } = await setup(false, false, [], [], true);
        expect(getByText('No qualification records have been added for this person yet.')).toBeTruthy();
      });
    });

    it('should show qualification record count', async () => {
      const { getByText } = await setup();
      expect(getByText('Qualification records (3)')).toBeTruthy();
    });
  });

  describe('getTrainingStatusCount', () => {
    it('should return the number of expired records', async () => {
      const { component } = await setup();

      expect(component.expiredTraining).toEqual(1);
    });

    it('should return the number of expiring soon records', async () => {
      const { component } = await setup();

      expect(component.expiresSoonTraining).toEqual(1);
    });
  });

  describe('getLastUpdatedDate', () => {
    it('should set last updated date to valid date when null passed in (in case of no qualification records)', async () => {
      const { component, getByText, fixture } = await setup();

      component.getLastUpdatedDate([new Date('2021/01/01'), null]);
      fixture.detectChanges();

      expect(getByText('Last updated 1 January 2021', { exact: false })).toBeTruthy();
    });

    it('should set last updated date to valid date when null passed in (in case of no training records)', async () => {
      const { component, getByText, fixture } = await setup();

      component.getLastUpdatedDate([null, new Date('2021/05/01')]);
      fixture.detectChanges();

      expect(getByText('Last updated 1 May 2021', { exact: false })).toBeTruthy();
    });

    it('should set last updated date to null when there is no lastUpdated date for training or quals', async () => {
      const { component } = await setup();

      component.getLastUpdatedDate([null, null]);

      expect(component.lastUpdatedDate).toBe(null);
    });
  });
  describe('getFilterByStatus', () => {
    it('should showAll records when no filter is selected', async () => {
      const { component, fixture } = await setup();
      component.getFilterByStatus('0_showall');
      fixture.detectChanges();

      expect(component.mandatoryTraining).toEqual(component.allTrainings.mandatory);
      expect(component.nonMandatoryTraining).toEqual(component.allTrainings.nonMandatory);
    });

    it('should show return  training records with expired status', async () => {
      const mandatoryTraining = [
        {
          category: 'Management',
          id: 1,
          trainingRecords: [
            {
              accredited: true,
              completed: new Date('10/20/2021'),
              expires: new Date('10/21/2021'),
              title: 'Management training',
              trainingCategory: { id: 1, category: 'Management' },
              trainingStatus: 3,
              uid: 'someManagementuid',
            },
          ],
        },
        {
          category: 'Management',
          id: 1,
          trainingRecords: [
            {
              accredited: true,
              completed: new Date('10/20/2021'),
              expires: new Date('11/21/2021'),
              title: 'Management training',
              trainingCategory: { id: 1, category: 'Management' },
              trainingStatus: 1,
              uid: 'someManagementuid',
            },
          ],
        },
      ];

      const { component, fixture } = await setup(false, false, mandatoryTraining);

      component.getFilterByStatus('1_expired');
      fixture.detectChanges();

      const expiredStatusNonMandatory = component.filterTraining.nonMandatory.every((record) =>
        record.trainingRecords.every((status) => status.trainingStatus === 3),
      );

      const expiredStatusMandatory = component.filterTraining.nonMandatory.every((record) =>
        record.trainingRecords.every((status) => status.trainingStatus === 3),
      );

      expect(expiredStatusNonMandatory).toBeTruthy();
      expect(expiredStatusMandatory).toBeTruthy();
    });

    it('should show training records expires soon status', async () => {
      const mandatoryTraining = [
        {
          category: 'Management',
          id: 1,
          trainingRecords: [
            {
              accredited: true,
              completed: new Date('10/20/2021'),
              expires: new Date('11/10/2021'),
              title: 'Management training',
              trainingCategory: { id: 1, category: 'Management' },
              trainingStatus: 1,
              uid: 'someManagementuid',
            },
          ],
        },
        {
          category: 'Management',
          id: 1,
          trainingRecords: [
            {
              accredited: true,
              completed: new Date('10/20/2021'),
              expires: new Date('10/10/2021'),
              title: 'Management training',
              trainingCategory: { id: 1, category: 'Management' },
              trainingStatus: 3,
              uid: 'someManagementuid',
            },
          ],
        },
      ];

      const { component, fixture } = await setup(false, false, mandatoryTraining);

      component.getFilterByStatus('2_expires_soon');
      fixture.detectChanges();

      const expiresSoonStatusNonMandatory = component.filterTraining.nonMandatory.every((record) =>
        record.trainingRecords.every((status) => status.trainingStatus === 1),
      );

      const expiresSoonStatusMandatory = component.filterTraining.nonMandatory.every((record) =>
        record.trainingRecords.every((status) => status.trainingStatus === 1),
      );

      expect(expiresSoonStatusNonMandatory).toBeTruthy();
      expect(expiresSoonStatusMandatory).toBeTruthy();
    });
  });
  describe('findMissingMandatoryTraining()', () => {
    it('should filter missing mandatory training with no training', async () => {
      const { component, fixture } = await setup(false, false, [], [{ category: 'Duty of care', id: 1 }]);
      component.setTrainingAndQualifications();

      fixture.detectChanges();

      expect(component.missingMandatoryTraining).toContain({ category: 'Duty of care', id: 1 });
    });

    it('should filter missing mandatory training with some mandatory training', async () => {
      const { component, fixture } = await setup(
        false,
        false,
        [
          {
            category: 'Duty of care',
            id: 1,
            trainingRecords: [
              {
                accredited: true,
                completed: new Date('10/20/2021'),
                expires: new Date('11/10/2021'),
                title: 'Duty of care 101',
                trainingCategory: { id: 1, category: 'Duty of care' },
                trainingStatus: 1,
                uid: 'someuid',
              },
            ],
          },
        ],
        [
          { category: 'Duty of care', id: 1 },
          { category: 'Autism', id: 2 },
        ],
      );
      component.setTrainingAndQualifications();

      fixture.detectChanges();

      expect(component.missingMandatoryTraining).not.toContain({ category: 'Duty of care', id: 1 });
      expect(component.missingMandatoryTraining).toContain({ category: 'Autism', id: 2 });
    });
  });
});
