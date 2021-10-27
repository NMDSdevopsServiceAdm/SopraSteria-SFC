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
import { fireEvent, render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { WorkersModule } from '../workers.module';
import { NewTrainingAndQualificationsRecordComponent } from './new-training-and-qualifications-record.component';

describe('NewTrainingAndQualificationsRecordComponent', () => {
  const workplace = establishmentBuilder() as Establishment;

  const yesterday = new Date();
  const tomorrow = new Date();

  yesterday.setDate(yesterday.getDate() - 1);
  tomorrow.setDate(tomorrow.getDate() + 1);

  async function setup(otherJob = false, careCert = true, mandatoryTraining = []) {
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
                  trainingRecords: {
                    lastUpdated: new Date('2020-01-01'),
                    jobRoleMandatoryTrainingCount: mandatoryTraining.length,
                    mandatory: mandatoryTraining,
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
                            uid: 'someCoshhuid',
                          },
                        ],
                      },
                    ],
                  },
                  qualifications: {
                    count: 2,
                    lastUpdated: new Date('2020-01-02'),
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
      `/workplace/${component.workplace.uid}/staff-record/123`,
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
    expect(getByText('Training and qualifications (5)')).toBeTruthy();
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
      expect(link.getAttribute('href')).toBe(`/workplace/${workplaceUid}/add-mandatory-training`);
    });

    it('should display the message and link if mandatory training has been set, but no training found', async () => {
      const { component, fixture, getByText } = await setup();

      component.canEditWorker = true;
      component.jobRoleMandatoryTrainingCount = 1;
      fixture.detectChanges();

      expect(getByText('1 mandatory training record is missing.')).toBeTruthy();
      expect(getByText('Add mandatory training record')).toBeTruthy();
    });

    it('should call the setReturnRoute function when the add mandatory record link is clicked', async () => {
      const { component, fixture, getByText } = await setup();

      const spy = spyOn(component, 'setReturnRoute').and.callThrough();

      component.canEditWorker = true;
      component.jobRoleMandatoryTrainingCount = 1;
      fixture.detectChanges();

      const link = getByText('Add mandatory training record');
      fireEvent.click(link);

      expect(spy).toHaveBeenCalled();
    });

    it('should display the message pluralised and link if multiple mandatory training has been set, but no training found', async () => {
      const { component, fixture, getByText } = await setup();

      component.canEditWorker = true;
      component.jobRoleMandatoryTrainingCount = 2;
      fixture.detectChanges();

      expect(getByText('2 mandatory training records are missing.')).toBeTruthy();
      expect(getByText('Add mandatory training record')).toBeTruthy();
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

    it('shoud display the mandatory training that exists and text and link when other mandatory training is missing', async () => {
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
      const { component, fixture, getByText, getByTestId } = await setup(false, true, mandatoryTraining);

      component.canEditWorker = true;
      component.jobRoleMandatoryTrainingCount = 2;
      fixture.detectChanges();

      expect(getByText('1 mandatory training record is missing.')).toBeTruthy();
      expect(getByText('Add mandatory training record')).toBeTruthy();
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
});
