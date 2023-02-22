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
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerService, qualificationsByGroup } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

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
    fragment = 'all-records',
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
            useValue: new MockActivatedRoute({
              fragment: of(fragment),
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
                  mandatoryTrainingCategories: {
                    allJobRolesCount: 29,
                    lastUpdated: new Date(),
                    mandatoryTraining: [
                      {
                        trainingCategoryId: 123,
                        allJobRoles: false,
                        category: 'Autism',
                        selectedJobRoles: true,
                        jobs: [
                          {
                            id: 15,
                            title: 'Activities worker, coordinator',
                          },
                        ],
                      },

                      {
                        trainingCategoryId: 9,
                        allJobRoles: false,
                        category: 'Coshh',
                        selectedJobRoles: true,
                        jobs: [
                          {
                            id: 21,
                            title: 'Other (not directly involved in providing care)',
                          },
                          {
                            id: 20,
                            title: 'Other (directly involved in providing care)',
                          },
                          {
                            id: 29,
                            title: 'Technician',
                          },
                          {
                            id: 28,
                            title: 'Supervisor',
                          },
                          {
                            id: 27,
                            title: 'Social worker',
                          },
                          {
                            id: 26,
                            title: 'Senior management',
                          },
                          {
                            id: 25,
                            title: 'Senior care worker',
                          },
                          {
                            id: 24,
                            title: 'Safeguarding and reviewing officer',
                          },
                          {
                            id: 23,
                            title: 'Registered Nurse',
                          },
                          {
                            id: 22,
                            title: 'Registered Manager',
                          },
                          {
                            id: 19,
                            title: 'Occupational therapist assistant',
                          },
                          {
                            id: 18,
                            title: 'Occupational therapist',
                          },
                          {
                            id: 17,
                            title: 'Nursing associate',
                          },
                          {
                            id: 16,
                            title: 'Nursing assistant',
                          },
                          {
                            id: 15,
                            title: 'Middle management',
                          },
                          {
                            id: 14,
                            title: 'Managers and staff (care-related, but not care-providing)',
                          },
                          {
                            id: 13,
                            title: 'First-line manager',
                          },
                          {
                            id: 12,
                            title: 'Employment support',
                          },
                          {
                            id: 11,
                            title: 'Community, support and outreach work',
                          },
                          {
                            id: 10,
                            title: 'Care worker',
                          },
                          {
                            id: 9,
                            title: 'Care navigator',
                          },
                          {
                            id: 8,
                            title: 'Care coordinator',
                          },
                          {
                            id: 7,
                            title: 'Assessment officer',
                          },
                          {
                            id: 6,
                            title: `Any children's, young people's job role`,
                          },
                          {
                            id: 5,
                            title: 'Ancillary staff (non care-providing)',
                          },
                          {
                            id: 4,
                            title: 'Allied health professional (not occupational therapist)',
                          },
                          {
                            id: 3,
                            title: 'Advice, guidance and advocacy',
                          },
                          {
                            id: 2,
                            title: 'Administrative, office staff (non care-providing)',
                          },
                          {
                            id: 1,
                            title: 'Activities worker, coordinator',
                          },
                        ],
                      },
                    ],
                    mandatoryTrainingCount: 2,
                  },
                },
                params: {
                  establishmentuid: '123',
                },
              },
            }),
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

  describe('page rendering', async () => {
    it('should render a TrainingAndQualificationsRecordComponent', async () => {
      const { component } = await setup();
      expect(component).toBeTruthy();
    });

    it('should display the worker name', async () => {
      const { component, getByText } = await setup();

      expect(getByText(component.worker.nameOrId, { exact: false })).toBeTruthy();
    });

    it('should display the last updated date in the correct format', async () => {
      const { component, getByText, fixture } = await setup();

      component.lastUpdatedDate = new Date('2020-01-01');

      fixture.detectChanges();

      expect(getByText('Last update, 1 January 2020', { exact: false })).toBeTruthy();
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
  });

  describe('Long-Term Absence', async () => {
    it('should display the Long-Term Absence if the worker is currently flagged as long term absent', async () => {
      const { component, fixture, getByText, queryByText } = await setup();

      component.worker.longTermAbsence = 'Illness';
      fixture.detectChanges();

      expect(getByText('Long-term absent')).toBeTruthy();
      expect(queryByText('Flag long-term absence')).toBeFalsy();
    });

    it('should navigate to `/long-term-absence` when pressing the "view" button', async () => {
      const { component, routerSpy, fixture, getByTestId } = await setup();

      component.worker.longTermAbsence = 'Illness';
      fixture.detectChanges();

      const longTermAbsenceLink = getByTestId('longTermAbsence');
      fireEvent.click(longTermAbsenceLink);
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'training-and-qualifications-record',
        123,
        'long-term-absence',
        { returnToTrainingAndQuals: 'true' },
      ]);
    });
  });

  describe('Flag long-term absence', async () => {
    it('should display the "Flag long-term absence" link if the worker is not currently flagged as long term absent', async () => {
      const { component, fixture, getByText } = await setup();

      component.worker.longTermAbsence = null;
      component.canEditWorker = true;
      fixture.detectChanges();

      expect(getByText('Flag long-term absence')).toBeTruthy();
    });

    it('should navigate to `/long-term-absence` when pressing the "Flag long-term absence" button', async () => {
      const { component, fixture, getByTestId, routerSpy } = await setup();

      component.worker.longTermAbsence = null;
      component.canEditWorker = true;
      fixture.detectChanges();

      const flagLongTermAbsenceLink = getByTestId('flagLongTermAbsence');
      fireEvent.click(flagLongTermAbsenceLink);
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'training-and-qualifications-record',
        123,
        'long-term-absence',
        { returnToTrainingAndQuals: 'true' },
      ]);
    });
  });

  describe('getLastUpdatedDate', async () => {
    it('should set last updated date to valid date when null passed in (in case of no qualification records)', async () => {
      const { component, getByText, fixture } = await setup();

      component.getLastUpdatedDate([new Date('2021/01/01'), null]);
      fixture.detectChanges();

      expect(getByText('Last update, 1 January 2021', { exact: false })).toBeTruthy();
    });

    it('should set last updated date to valid date when null passed in (in case of no training records)', async () => {
      const { component, getByText, fixture } = await setup();

      component.getLastUpdatedDate([null, new Date('2021/05/01')]);
      fixture.detectChanges();

      expect(getByText('Last update, 1 May 2021', { exact: false })).toBeTruthy();
    });

    it('should set last updated date to null when there is no lastUpdated date for training or quals', async () => {
      const { component } = await setup();

      component.getLastUpdatedDate([null, null]);

      expect(component.lastUpdatedDate).toBe(null);
    });
  });

  describe('records summary', async () => {
    it('should render the training and qualifications summary component', async () => {
      const { fixture } = await setup();
      expect(
        fixture.debugElement.nativeElement.querySelector('app-new-training-and-qualifications-record-summary'),
      ).not.toBe(null);
    });
  });

  describe('actions list', async () => {
    it('should render the actions list heading', async () => {
      const { getByText } = await setup();
      expect(getByText('Actions list')).toBeTruthy();
    });

    it('should render a actions table with the correct headers', async () => {
      const { fixture } = await setup();
      const headerRow = fixture.nativeElement.querySelectorAll('tr')[0];
      expect(headerRow.cells['0'].innerHTML).toBe('Training category');
      expect(headerRow.cells['1'].innerHTML).toBe('Training type');
      expect(headerRow.cells['2'].innerHTML).toBe('Status');
      expect(headerRow.cells['3'].innerHTML).toBe('');
    });

    it('should render Autism as an expired training with an update link if canEditWorker is true', async () => {
      const { component, fixture } = await setup();

      component.canEditWorker = true;
      fixture.detectChanges();
      const actionListTableRows = fixture.nativeElement.querySelectorAll('tr');
      const rowOne = actionListTableRows[1];
      expect(rowOne.cells['0'].innerHTML).toBe('Autism');
      expect(rowOne.cells['1'].innerHTML).toBe('Non-mandatory');
      expect(rowOne.cells['2'].innerHTML).toContain('Expired');
      expect(rowOne.cells['3'].innerHTML).toContain('Update');
    });

    it('should render Autism as an expired training without an update link if canEditWorker is false', async () => {
      const { fixture } = await setup();
      const actionListTableRows = fixture.nativeElement.querySelectorAll('tr');
      const rowOne = actionListTableRows[1];
      expect(rowOne.cells['0'].innerHTML).toBe('Autism');
      expect(rowOne.cells['1'].innerHTML).toBe('Non-mandatory');
      expect(rowOne.cells['2'].innerHTML).toContain('Expired');
      expect(rowOne.cells['3'].innerHTML).not.toContain('Update');
    });

    it('should render Coshh as an expiring soon training with an update link if canEditWorker is true', async () => {
      const { component, fixture } = await setup();

      component.canEditWorker = true;
      fixture.detectChanges();
      const actionListTableRows = fixture.nativeElement.querySelectorAll('tr');
      const rowTwo = actionListTableRows[2];
      expect(rowTwo.cells['0'].innerHTML).toBe('Coshh');
      expect(rowTwo.cells['1'].innerHTML).toBe('Non-mandatory');
      expect(rowTwo.cells['2'].innerHTML).toContain('Expires soon');
      expect(rowTwo.cells['3'].innerHTML).toContain('Update');
    });

    it('should render Coshh as an expiring soon training without an update link if canEditWorker is false', async () => {
      const { fixture } = await setup();
      const actionListTableRows = fixture.nativeElement.querySelectorAll('tr');
      const rowTwo = actionListTableRows[2];
      expect(rowTwo.cells['0'].innerHTML).toBe('Coshh');
      expect(rowTwo.cells['1'].innerHTML).toBe('Non-mandatory');
      expect(rowTwo.cells['2'].innerHTML).toContain('Expires soon');
      expect(rowTwo.cells['3'].innerHTML).not.toContain('Update');
    });
  });

  describe('tabs', async () => {
    it('should render the 4 training and quals tabs', async () => {
      const { getByTestId } = await setup();
      expect(getByTestId('allRecordsTab'));
      expect(getByTestId('mandatoryTrainingTab'));
      expect(getByTestId('nonMandatoryTrainingTab'));
      expect(getByTestId('qualificationsTab'));
    });

    describe('all records tab', async () => {
      it('should show the all records tab as active when on training record page with fragment all-records', async () => {
        const { getByTestId } = await setup();

        expect(getByTestId('allRecordsTab').getAttribute('class')).toContain('asc-tabs__list-item--active');
        expect(getByTestId('allRecordsTabLink').getAttribute('class')).toContain('asc-tabs__link--active');
        expect(getByTestId('mandatoryTrainingTab').getAttribute('class')).not.toContain('asc-tabs__list-item--active');
        expect(getByTestId('mandatoryTrainingTabLink').getAttribute('class')).not.toContain('asc-tabs__link--active');
        expect(getByTestId('nonMandatoryTrainingTab').getAttribute('class')).not.toContain(
          'asc-tabs__list-item--active',
        );
        expect(getByTestId('nonMandatoryTrainingTabLink').getAttribute('class')).not.toContain(
          'asc-tabs__link--active',
        );
        expect(getByTestId('qualificationsTab').getAttribute('class')).not.toContain('asc-tabs__list-item--active');
        expect(getByTestId('qualificationsTabLink').getAttribute('class')).not.toContain('asc-tabs__link--active');
      });

      it('should render 2 instances of the new-training component and 1 instance of the qualification component when on all record tab', async () => {
        const { fixture } = await setup();
        expect(fixture.debugElement.nativeElement.querySelectorAll('app-new-training').length).toBe(2);
        expect(fixture.debugElement.nativeElement.querySelector('app-new-qualifications')).not.toBe(null);
      });

      it('should navigate to the training page with fragment all-records when clicking on all-records tab', async () => {
        const { getByTestId, routerSpy, component } = await setup();
        const allRecordsTabLink = getByTestId('allRecordsTabLink');
        fireEvent.click(allRecordsTabLink);
        expect(routerSpy).toHaveBeenCalledWith(
          [
            'workplace',
            component.workplace.uid,
            'training-and-qualifications-record',
            component.worker.uid,
            'training',
          ],
          { fragment: 'all-records' },
        );
      });
    });

    describe('mandatory training tab', async () => {
      it('should show the Mandatory training tab as active when on training record page with fragment mandatory-training', async () => {
        const { getByTestId } = await setup(false, true, [], [], false, 'mandatory-training');

        expect(getByTestId('allRecordsTab').getAttribute('class')).not.toContain('asc-tabs__list-item--active');
        expect(getByTestId('allRecordsTabLink').getAttribute('class')).not.toContain('asc-tabs__link--active');
        expect(getByTestId('mandatoryTrainingTab').getAttribute('class')).toContain('asc-tabs__list-item--active');
        expect(getByTestId('mandatoryTrainingTabLink').getAttribute('class')).toContain('asc-tabs__link--active');
        expect(getByTestId('nonMandatoryTrainingTab').getAttribute('class')).not.toContain(
          'asc-tabs__list-item--active',
        );
        expect(getByTestId('nonMandatoryTrainingTabLink').getAttribute('class')).not.toContain(
          'asc-tabs__link--active',
        );
        expect(getByTestId('qualificationsTab').getAttribute('class')).not.toContain('asc-tabs__list-item--active');
        expect(getByTestId('qualificationsTabLink').getAttribute('class')).not.toContain('asc-tabs__link--active');
      });

      it('should render 1 instances of the new-training component when on mandatory training tab', async () => {
        const { fixture } = await setup(false, true, [], [], false, 'mandatory-training');

        expect(fixture.debugElement.nativeElement.querySelector('app-new-training')).not.toBe(null);
      });

      it('should navigate to the training page with the fragment mandatory-training when clicking on mandatory training tab', async () => {
        const { getByTestId, routerSpy, component } = await setup();
        const mandatoryTrainingTabLink = getByTestId('mandatoryTrainingTabLink');
        fireEvent.click(mandatoryTrainingTabLink);
        expect(routerSpy).toHaveBeenCalledWith(
          [
            'workplace',
            component.workplace.uid,
            'training-and-qualifications-record',
            component.worker.uid,
            'training',
          ],
          { fragment: 'mandatory-training' },
        );
      });
    });

    describe('non mandatory training tab', async () => {
      it('should show the non Mandatory training tab as active when on training record page with fragment non-mandatory-training', async () => {
        const { getByTestId } = await setup(false, true, [], [], false, 'non-mandatory-training');

        expect(getByTestId('allRecordsTab').getAttribute('class')).not.toContain('asc-tabs__list-item--active');
        expect(getByTestId('allRecordsTabLink').getAttribute('class')).not.toContain('asc-tabs__link--active');
        expect(getByTestId('mandatoryTrainingTab').getAttribute('class')).not.toContain('asc-tabs__list-item--active');
        expect(getByTestId('mandatoryTrainingTabLink').getAttribute('class')).not.toContain('asc-tabs__link--active');
        expect(getByTestId('nonMandatoryTrainingTab').getAttribute('class')).toContain('asc-tabs__list-item--active');
        expect(getByTestId('nonMandatoryTrainingTabLink').getAttribute('class')).toContain('asc-tabs__link--active');
        expect(getByTestId('qualificationsTab').getAttribute('class')).not.toContain('asc-tabs__list-item--active');
        expect(getByTestId('qualificationsTabLink').getAttribute('class')).not.toContain('asc-tabs__link--active');
      });

      it('should render 1 instances of the new-training component when on non mandatory training tab', async () => {
        const { fixture } = await setup(false, true, [], [], false, 'non-mandatory-training');

        expect(fixture.debugElement.nativeElement.querySelector('app-new-training')).not.toBe(null);
      });

      it('should navigate to the training page with the fragment non-mandatory-training when clicking on non mandatory training tab', async () => {
        const { getByTestId, routerSpy, component } = await setup();
        const nonMandatoryTrainingTab = getByTestId('nonMandatoryTrainingTabLink');
        fireEvent.click(nonMandatoryTrainingTab);
        expect(routerSpy).toHaveBeenCalledWith(
          [
            'workplace',
            component.workplace.uid,
            'training-and-qualifications-record',
            component.worker.uid,
            'training',
          ],
          { fragment: 'non-mandatory-training' },
        );
      });
    });

    describe('qualifications tab', async () => {
      it('should show the qualifications tab as active when on training record page with fragment qualifications', async () => {
        const { getByTestId } = await setup(false, true, [], [], false, 'qualifications');

        expect(getByTestId('allRecordsTab').getAttribute('class')).not.toContain('asc-tabs__list-item--active');
        expect(getByTestId('allRecordsTabLink').getAttribute('class')).not.toContain('asc-tabs__link--active');
        expect(getByTestId('mandatoryTrainingTab').getAttribute('class')).not.toContain('asc-tabs__list-item--active');
        expect(getByTestId('mandatoryTrainingTabLink').getAttribute('class')).not.toContain('asc-tabs__link--active');
        expect(getByTestId('nonMandatoryTrainingTab').getAttribute('class')).not.toContain(
          'asc-tabs__list-item--active',
        );
        expect(getByTestId('nonMandatoryTrainingTabLink').getAttribute('class')).not.toContain(
          'asc-tabs__link--active',
        );
        expect(getByTestId('qualificationsTab').getAttribute('class')).toContain('asc-tabs__list-item--active');
        expect(getByTestId('qualificationsTabLink').getAttribute('class')).toContain('asc-tabs__link--active');
      });

      it('should render 1 instances of the new-qualifications component when on qualification tab', async () => {
        const { fixture } = await setup(false, true, [], [], false, 'non-mandatory-training');

        expect(fixture.debugElement.nativeElement.querySelector('app-new-training')).not.toBe(null);
      });

      it('should navigate to the training page with the fragment qualifications when clicking on qualification tab', async () => {
        const { getByTestId, routerSpy, component } = await setup();
        const qualificationTabLink = getByTestId('qualificationsTabLink');
        fireEvent.click(qualificationTabLink);
        expect(routerSpy).toHaveBeenCalledWith(
          [
            'workplace',
            component.workplace.uid,
            'training-and-qualifications-record',
            component.worker.uid,
            'training',
          ],
          { fragment: 'qualifications' },
        );
      });
    });
  });
});
