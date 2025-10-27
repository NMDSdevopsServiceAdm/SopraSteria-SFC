import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { QualificationsByGroup } from '@core/model/qualification.model';
import { TrainingRecord, TrainingRecordCategory, TrainingRecords } from '@core/model/training.model';
import { TrainingAndQualificationRecords } from '@core/model/trainingAndQualifications.model';
import { AlertService } from '@core/services/alert.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import {
  DownloadCertificateService,
  QualificationCertificateService,
  TrainingCertificateService,
} from '@core/services/certificate.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PdfTrainingAndQualificationService } from '@core/services/pdf-training-and-qualification.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import {
  mockCertificateFileBlob,
  MockQualificationCertificateService,
  mockTrainingCertificates,
  MockTrainingCertificateService,
} from '@core/test-utils/MockCertificateService';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerService, qualificationsByGroup } from '@core/test-utils/MockWorkerService';
import { FileUtil } from '@core/utils/file-util';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { cloneDeep } from 'lodash';
import { of, throwError } from 'rxjs';

import { mockQualificationCertificates } from '../../../core/test-utils/MockCertificateService';
import { WorkersModule } from '../../workers/workers.module';
import { NewTrainingAndQualificationsRecordComponent } from './new-training-and-qualifications-record.component';

describe('NewTrainingAndQualificationsRecordComponent', () => {
  const workplace = establishmentBuilder() as Establishment;

  const yesterday = new Date();
  const tomorrow = new Date();
  const activeDate = new Date();

  yesterday.setDate(yesterday.getDate() - 1);
  tomorrow.setDate(tomorrow.getDate() + 1);
  activeDate.setDate(activeDate.getDate() + 93); // 3 months in the future

  const mockTrainingData: TrainingRecords = {
    lastUpdated: new Date('2020-01-01'),
    mandatory: [],
    jobRoleMandatoryTrainingCount: [],
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
            trainingCertificates: [],
            trainingStatus: 0,
            uid: 'someHealthuid',
            created: new Date('10/20/2021'),
            updated: new Date('10/20/2021'),
            updatedBy: '',
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
            created: new Date('10/20/2021'),
            updated: new Date('10/20/2021'),
            updatedBy: '',
            trainingCertificates: [
              {
                filename: 'test certificate.pdf',
                uid: '1872ec19-510d-41de-995d-6abfd3ae888a',
                uploadDate: '2024-09-20T08:57:45.000Z',
              },
            ],
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
            trainingCertificates: [],
            trainingStatus: 1,
            uid: 'someCoshhuid',
            created: new Date('10/20/2021'),
            updated: new Date('10/20/2021'),
            updatedBy: '',
          },
        ],
      },
    ],
  };

  interface SetupOptions {
    otherJob: boolean;
    careCert: boolean;
    mandatoryTraining: TrainingRecordCategory[];
    nonMandatoryTraining: TrainingRecordCategory[];
    fragment: 'all-records' | 'mandatory-training' | 'non-mandatory-training' | 'qualifications';
    isOwnWorkplace: boolean;
    qualifications: QualificationsByGroup;
  }
  const defaults: SetupOptions = {
    otherJob: false,
    careCert: true,
    mandatoryTraining: [],
    nonMandatoryTraining: mockTrainingData.nonMandatory,
    fragment: 'all-records',
    isOwnWorkplace: true,
    qualifications: { count: 0, groups: [], lastUpdated: qualificationsByGroup.lastUpdated },
  };

  async function setup(options: Partial<SetupOptions> = {}) {
    const { otherJob, careCert, mandatoryTraining, nonMandatoryTraining, fragment, isOwnWorkplace, qualifications } = {
      ...defaults,
      ...options,
    };

    const { fixture, getByText, getAllByText, getByRole, queryByText, getByTestId } = await render(
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
                      ...mockTrainingData,
                      mandatory: mandatoryTraining,
                      nonMandatory: nonMandatoryTraining,
                    },
                    qualifications: qualifications,
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
          { provide: PermissionsService, useFactory: MockPermissionsService.factory(['canEditWorker']) },
          { provide: TrainingCertificateService, useClass: MockTrainingCertificateService },
          { provide: QualificationCertificateService, useClass: MockQualificationCertificateService },
          // suppress the distracting error msg of "reading 'nativeElement'" from PdfTrainingAndQualificationService
          { provide: PdfTrainingAndQualificationService, useValue: { BuildTrainingAndQualsPdf: () => {} } },
          DownloadCertificateService,
        ],
      },
    );

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    const parentSubsidiaryViewService = injector.inject(ParentSubsidiaryViewService) as ParentSubsidiaryViewService;
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    spyOn(establishmentService, 'isOwnWorkplace').and.returnValue(isOwnWorkplace);

    const workerService = injector.inject(WorkerService) as WorkerService;
    const trainingService = injector.inject(TrainingService) as TrainingService;
    const trainingCertificateService = injector.inject(TrainingCertificateService) as TrainingCertificateService;
    const qualificationCertificateService = injector.inject(
      QualificationCertificateService,
    ) as QualificationCertificateService;

    const workerSpy = spyOn(workerService, 'setReturnTo');
    workerSpy.and.callThrough();

    const workplaceUid = component.workplace.uid;
    const workerUid = component.worker.uid;
    const pdfTrainingAndQualsService = injector.inject(
      PdfTrainingAndQualificationService,
    ) as PdfTrainingAndQualificationService;

    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    return {
      component,
      fixture,
      routerSpy,
      workerSpy,
      workerService,
      trainingService,
      getByText,
      getAllByText,
      getByRole,
      getByTestId,
      queryByText,
      workplaceUid,
      workerUid,
      alertSpy,
      pdfTrainingAndQualsService,
      parentSubsidiaryViewService,
      trainingCertificateService,
      qualificationCertificateService,
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
      const { getByText } = await setup();

      expect(getByText('View staff record', { exact: false })).toBeTruthy();
    });

    it('should have correct href on the View staff record button', async () => {
      const { component, getByText } = await setup();

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
      const { getByText } = await setup({ otherJob: false, careCert: false });

      expect(getByText('Care Certificate:', { exact: false })).toBeTruthy();
      expect(getByText('Not answered', { exact: false })).toBeTruthy();
    });

    it('should display the "Add a training record" button', async () => {
      const { getByRole } = await setup();
      const button = getByRole('button', { name: 'Add a training record' });

      expect(button).toBeTruthy();
    });

    it('should have correct href on the "Add a training record" button', async () => {
      const { workplaceUid, workerUid, getByRole } = await setup();
      const button = getByRole('button', { name: 'Add a training record' });

      expect(button.getAttribute('href')).toEqual(
        `/workplace/${workplaceUid}/training-and-qualifications-record/${workerUid}/add-qualification`,
      );
    });

    it('should display the "Add a qualification record" button', async () => {
      const { getByRole } = await setup();
      const button = getByRole('button', { name: 'Add a qualification record' });

      expect(button).toBeTruthy();
    });

    it('should have correct href on the "Add a qualification record" button', async () => {
      const { workplaceUid, workerUid, getByRole } = await setup();
      const button = getByRole('button', { name: 'Add a qualification record' });
      const expectedHref = `workplace/${workplaceUid}/training-and-qualifications-record/${workerUid}/add-qualification`

      expect(button.getAttribute('href')).toEqual(expectedHref);
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
      expect(routerSpy).toHaveBeenCalledWith(
        ['/workplace', component.workplace.uid, 'training-and-qualifications-record', 123, 'long-term-absence'],
        { queryParams: { returnToTrainingAndQuals: 'true' } },
      );
    });
  });

  describe('Flag long-term absence', async () => {
    it('should display the "Flag long-term absence" link if the worker is not currently flagged as long term absent', async () => {
      const { component, fixture, getByText } = await setup();

      component.worker.longTermAbsence = null;
      fixture.detectChanges();

      expect(getByText('Flag long-term absence')).toBeTruthy();
    });

    it('should navigate to `/long-term-absence` when pressing the "Flag long-term absence" button', async () => {
      const { component, fixture, getByTestId, routerSpy } = await setup();

      component.worker.longTermAbsence = null;
      fixture.detectChanges();

      const flagLongTermAbsenceLink = getByTestId('flagLongTermAbsence');
      fireEvent.click(flagLongTermAbsenceLink);
      expect(routerSpy).toHaveBeenCalledWith(
        ['/workplace', component.workplace.uid, 'training-and-qualifications-record', 123, 'long-term-absence'],
        { queryParams: { returnToTrainingAndQuals: 'true' } },
      );
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
      const { component, fixture } = await setup();

      component.canEditWorker = false;
      fixture.detectChanges();

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
      const { component, fixture } = await setup();

      component.canEditWorker = false;
      fixture.detectChanges();

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
        const { getByTestId } = await setup({ fragment: 'mandatory-training' });

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
        const { fixture } = await setup({ fragment: 'mandatory-training' });

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
        const { getByTestId } = await setup({ fragment: 'non-mandatory-training' });

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
        const { fixture } = await setup({ fragment: 'non-mandatory-training' });

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
        const { getByTestId } = await setup({ fragment: 'qualifications' });

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
        const { fixture } = await setup({ fragment: 'non-mandatory-training' });

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

  describe('BuildTrainingAndQualsPdf', async () => {
    it('should download the page as a pdf when the the download as pdf link is clicked', async () => {
      const { component, getByText, pdfTrainingAndQualsService, fixture } = await setup();
      const downloadFunctionSpy = spyOn(component, 'downloadAsPDF').and.callThrough();
      const pdfTrainingAndQualsServiceSpy = spyOn(
        pdfTrainingAndQualsService,
        'BuildTrainingAndQualsPdf',
      ).and.callThrough();

      fixture.detectChanges();

      fireEvent.click(getByText('Download this training and qualifications summary'));

      expect(downloadFunctionSpy).toHaveBeenCalled();
      expect(pdfTrainingAndQualsServiceSpy).toHaveBeenCalled();
    });
  });

  describe('getBreadcrumbsJourney', () => {
    it('should return mandatory training journey when viewing sub as parent', async () => {
      const { component, parentSubsidiaryViewService } = await setup();
      spyOn(parentSubsidiaryViewService, 'getViewingSubAsParent').and.returnValue(true);
      expect(component.getBreadcrumbsJourney()).toBe(JourneyType.MY_WORKPLACE);
    });

    it('should return mandatory training journey when is own workplace', async () => {
      const { component } = await setup();

      expect(component.getBreadcrumbsJourney()).toBe(JourneyType.MY_WORKPLACE);
    });

    it('should return all workplaces journey when is not own workplace and not in parent sub view', async () => {
      const { component } = await setup({ isOwnWorkplace: false });

      expect(component.getBreadcrumbsJourney()).toBe(JourneyType.ALL_WORKPLACES);
    });
  });

  describe('training certificates', () => {
    describe('Download button', () => {
      const mockTrainings: TrainingRecordCategory[] = [
        {
          category: 'HealthWithCertificate',
          id: 1,
          trainingRecords: [
            {
              accredited: true,
              completed: new Date('10/20/2021'),
              expires: activeDate,
              title: 'Health training',
              trainingCategory: { id: 1, category: 'HealthWithCertificate' },
              trainingCertificates: [
                {
                  filename: 'test.pdf',
                  uid: '1872ec19-510d-41de-995d-6abfd3ae888a',
                  uploadDate: '2024-09-20T08:57:45.000Z',
                },
              ],
              trainingStatus: 0,
              uid: 'someHealthuidWithCertificate',
            },
          ] as TrainingRecord[],
        },
      ];

      it('should download a certificate file when download link of a certificate row is clicked', async () => {
        const { getByTestId, component, trainingCertificateService } = await setup({
          mandatoryTraining: mockTrainings,
        });
        const uidForTrainingRecord = 'someHealthuidWithCertificate';

        const trainingRecordRow = getByTestId(uidForTrainingRecord);
        const downloadLink = within(trainingRecordRow).getByText('Download');

        const downloadCertificatesSpy = spyOn(trainingCertificateService, 'downloadCertificates').and.returnValue(
          of(null),
        );

        userEvent.click(downloadLink);
        expect(downloadCertificatesSpy).toHaveBeenCalledWith(
          component.workplace.uid,
          component.worker.uid,
          mockTrainings[0].trainingRecords[0].uid,
          mockTrainings[0].trainingRecords[0].trainingCertificates,
        );
      });

      it('should call triggerCertificateDownloads with file returned from downloadCertificates', async () => {
        const { getByTestId, trainingCertificateService } = await setup({ mandatoryTraining: mockTrainings });
        const uidForTrainingRecord = 'someHealthuidWithCertificate';

        const trainingRecordRow = getByTestId(uidForTrainingRecord);
        const downloadLink = within(trainingRecordRow).getByText('Download');
        const filesReturnedFromDownloadCertificates = [
          { filename: 'test.pdf', signedUrl: 'signedUrl.com/1872ec19-510d-41de-995d-6abfd3ae888a' },
        ];

        const triggerCertificateDownloadsSpy = spyOn(
          trainingCertificateService,
          'triggerCertificateDownloads',
        ).and.returnValue(of(null));
        spyOn(trainingCertificateService, 'getCertificateDownloadUrls').and.returnValue(
          of({ files: filesReturnedFromDownloadCertificates }),
        );

        userEvent.click(downloadLink);

        expect(triggerCertificateDownloadsSpy).toHaveBeenCalledWith(filesReturnedFromDownloadCertificates);
      });

      it('should display an error message on the training category when certificate download fails', async () => {
        const { fixture, getByTestId, trainingCertificateService, getByText } = await setup({
          mandatoryTraining: mockTrainings,
        });

        const uidForTrainingRecord = 'someHealthuidWithCertificate';

        const trainingRecordRow = getByTestId(uidForTrainingRecord);
        const downloadLink = within(trainingRecordRow).getByText('Download');

        spyOn(trainingCertificateService, 'downloadCertificates').and.returnValue(throwError('403 forbidden'));

        userEvent.click(downloadLink);
        fixture.detectChanges();

        expect(getByText("There's a problem with this download. Try again later or contact us for help.")).toBeTruthy();
      });
    });

    describe('Upload button', () => {
      const mockUploadFile = new File(['some file content'], 'certificate.pdf');

      it('should upload a file when a file is selected from Upload file button', async () => {
        const { component, getByTestId, trainingCertificateService } = await setup();
        const uploadCertificateSpy = spyOn(trainingCertificateService, 'addCertificates').and.returnValue(of(null));

        const trainingRecordRow = getByTestId('someHealthuid');

        const uploadButton = within(trainingRecordRow).getByTestId('fileInput');

        userEvent.upload(uploadButton, mockUploadFile);

        expect(uploadCertificateSpy).toHaveBeenCalledWith(
          component.workplace.uid,
          component.worker.uid,
          'someHealthuid',
          [mockUploadFile],
        );
      });

      it('should show an error message when a non pdf file is selected', async () => {
        const invalidFile = new File(['some file content'], 'certificate.csv');

        const { fixture, getByTestId, trainingCertificateService, getByText } = await setup();
        const uploadCertificateSpy = spyOn(trainingCertificateService, 'addCertificates');

        const trainingRecordRow = getByTestId('someHealthuid');

        const uploadButton = within(trainingRecordRow).getByTestId('fileInput');

        userEvent.upload(uploadButton, invalidFile);

        fixture.detectChanges();

        expect(getByText('The certificate must be a PDF file')).toBeTruthy();
        expect(uploadCertificateSpy).not.toHaveBeenCalled();
      });

      it('should show an error message when a file of > 5MB is selected', async () => {
        const invalidFile = new File(['some file content'], 'certificate.pdf');
        Object.defineProperty(invalidFile, 'size', {
          value: 6 * 1024 * 1024, // 6MB
        });

        const { fixture, getByTestId, trainingCertificateService, getByText } = await setup();
        const uploadCertificateSpy = spyOn(trainingCertificateService, 'addCertificates');

        const trainingRecordRow = getByTestId('someHealthuid');

        const uploadButton = within(trainingRecordRow).getByTestId('fileInput');

        userEvent.upload(uploadButton, invalidFile);

        fixture.detectChanges();

        expect(getByText('The certificate must be no larger than 5MB')).toBeTruthy();
        expect(uploadCertificateSpy).not.toHaveBeenCalled();
      });

      it('should refresh the training record and display an alert of "Certificate uploaded" on successful upload', async () => {
        const { fixture, alertSpy, getByTestId, workerService, trainingCertificateService } = await setup();
        const mockUpdatedData = {
          training: mockTrainingData,
          qualifications: { count: 0, groups: [], lastUpdated: null },
        } as TrainingAndQualificationRecords;
        const workerSpy = spyOn(workerService, 'getAllTrainingAndQualificationRecords').and.returnValue(
          of(mockUpdatedData),
        );
        spyOn(trainingCertificateService, 'addCertificates').and.returnValue(of(null));

        const trainingRecordRow = getByTestId('someHealthuid');
        const uploadButton = within(trainingRecordRow).getByTestId('fileInput');

        userEvent.upload(uploadButton, mockUploadFile);

        await fixture.whenStable();

        expect(workerSpy).toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalledWith({
          type: 'success',
          message: 'Certificate uploaded',
        });
      });

      it('should reset the actions list with returned training data when file successfully uploaded', async () => {
        const { fixture, getByTestId, workerService, trainingCertificateService } = await setup({
          mandatoryTraining: [],
        });
        const mockUpdatedData = {
          training: mockTrainingData,
          qualifications: { count: 0, groups: [], lastUpdated: null },
        } as TrainingAndQualificationRecords;
        spyOn(workerService, 'getAllTrainingAndQualificationRecords').and.returnValue(of(mockUpdatedData));
        spyOn(trainingCertificateService, 'addCertificates').and.returnValue(of(null));

        const trainingRecordRow = getByTestId('someHealthuid');
        const uploadButton = within(trainingRecordRow).getByTestId('fileInput');

        userEvent.upload(uploadButton, mockUploadFile);

        await fixture.whenStable();

        const actionsListTable = getByTestId('actions-list-table');
        const actionListTableRows = actionsListTable.querySelectorAll('tr');

        const rowOne = actionListTableRows[1];
        expect(rowOne.cells['0'].innerHTML).toBe('Autism');

        const rowTwo = actionListTableRows[2];
        expect(rowTwo.cells['0'].innerHTML).toBe('Coshh');

        expect(actionListTableRows.length).toBe(3);
      });

      it('should display an error message on the training category when certificate upload fails', async () => {
        const { fixture, getByTestId, trainingCertificateService, getByText } = await setup();
        spyOn(trainingCertificateService, 'addCertificates').and.returnValue(throwError('failed to upload'));

        const trainingRecordRow = getByTestId('someHealthuid');
        const uploadButton = within(trainingRecordRow).getByTestId('fileInput');

        userEvent.upload(uploadButton, mockUploadFile);

        fixture.detectChanges();

        expect(getByText("There's a problem with this upload. Try again later or contact us for help.")).toBeTruthy();
      });
    });
  });

  describe('qualification certificates', () => {
    const mockQualifications = cloneDeep(qualificationsByGroup);
    mockQualifications.groups[0].records[0].qualificationCertificates = [
      {
        filename: 'Award 2024.pdf',
        uid: 'quals-cert-uid1',
        uploadDate: '2024-09-20T08:57:45.000Z',
      },
    ];

    const uidForRecordWithOneCert = mockQualifications.groups[0].records[0].uid;
    const uidForRecordWithNoCerts = mockQualifications.groups[1].records[0].uid;

    const setupWithQualificationCerts = () => setup({ qualifications: mockQualifications });

    describe('Download button', () => {
      it('should download a certificate file when download link of a certificate row is clicked', async () => {
        const { component, getByTestId, qualificationCertificateService } = await setupWithQualificationCerts();
        const recordRow = getByTestId(uidForRecordWithOneCert);
        const downloadLink = within(recordRow).getByText('Download');

        const downloadCertificatesSpy = spyOn(qualificationCertificateService, 'downloadCertificates').and.returnValue(
          of(null),
        );

        userEvent.click(downloadLink);
        expect(downloadCertificatesSpy).toHaveBeenCalledWith(
          component.workplace.uid,
          component.worker.uid,
          uidForRecordWithOneCert,
          [
            {
              filename: 'Award 2024.pdf',
              uid: 'quals-cert-uid1',
            },
          ],
        );
      });

      it('should call triggerCertificateDownloads with file returned from downloadCertificates', async () => {
        const { getByTestId, qualificationCertificateService } = await setupWithQualificationCerts();

        const recordRow = getByTestId(uidForRecordWithOneCert);
        const downloadLink = within(recordRow).getByText('Download');
        const filesReturnedFromDownloadCertificates = [{ filename: 'test.pdf', signedUrl: 'localhost/mock-sign-url' }];

        const triggerCertificateDownloadsSpy = spyOn(
          qualificationCertificateService,
          'triggerCertificateDownloads',
        ).and.returnValue(of(null));

        spyOn(qualificationCertificateService, 'getCertificateDownloadUrls').and.returnValue(
          of({ files: filesReturnedFromDownloadCertificates }),
        );

        userEvent.click(downloadLink);

        expect(triggerCertificateDownloadsSpy).toHaveBeenCalledWith(filesReturnedFromDownloadCertificates);
      });

      it('should display an error message on the training category when certificate download fails', async () => {
        const { fixture, getByText, getByTestId, qualificationCertificateService } =
          await setupWithQualificationCerts();
        const recordRow = getByTestId(uidForRecordWithOneCert);
        const downloadLink = within(recordRow).getByText('Download');

        spyOn(qualificationCertificateService, 'downloadCertificates').and.returnValue(
          throwError('404 file not found'),
        );

        userEvent.click(downloadLink);
        fixture.detectChanges();

        expect(getByText("There's a problem with this download. Try again later or contact us for help.")).toBeTruthy();
      });
    });

    describe('Upload button', () => {
      const mockUploadFile = new File(['some file content'], 'certificate.pdf');

      it('should upload a file when a file is selected from Upload file button', async () => {
        const { component, getByTestId, qualificationCertificateService } = await setupWithQualificationCerts();
        const uploadCertificateSpy = spyOn(qualificationCertificateService, 'addCertificates').and.returnValue(
          of(null),
        );

        const recordRow = getByTestId(uidForRecordWithNoCerts);

        const uploadButton = within(recordRow).getByTestId('fileInput');

        userEvent.upload(uploadButton, mockUploadFile);

        expect(uploadCertificateSpy).toHaveBeenCalledWith(
          component.workplace.uid,
          component.worker.uid,
          uidForRecordWithNoCerts,
          [mockUploadFile],
        );
      });

      it('should show an error message when a non pdf file is selected', async () => {
        const invalidFile = new File(['some file content'], 'certificate.csv');

        const { fixture, getByText, getByTestId, qualificationCertificateService } =
          await setupWithQualificationCerts();
        const uploadCertificateSpy = spyOn(qualificationCertificateService, 'addCertificates');

        const recordRow = getByTestId(uidForRecordWithNoCerts);

        const uploadButton = within(recordRow).getByTestId('fileInput');

        userEvent.upload(uploadButton, invalidFile);

        fixture.detectChanges();

        expect(getByText('The certificate must be a PDF file')).toBeTruthy();
        expect(uploadCertificateSpy).not.toHaveBeenCalled();
      });

      it('should show an error message when a file of > 5MB is selected', async () => {
        const invalidFile = new File(['some file content'], 'certificate.pdf');
        Object.defineProperty(invalidFile, 'size', {
          value: 6 * 1024 * 1024, // 6MB
        });

        const { fixture, getByText, getByTestId, qualificationCertificateService } =
          await setupWithQualificationCerts();
        const uploadCertificateSpy = spyOn(qualificationCertificateService, 'addCertificates');

        const recordRow = getByTestId(uidForRecordWithNoCerts);

        const uploadButton = within(recordRow).getByTestId('fileInput');

        userEvent.upload(uploadButton, invalidFile);

        fixture.detectChanges();

        expect(getByText('The certificate must be no larger than 5MB')).toBeTruthy();
        expect(uploadCertificateSpy).not.toHaveBeenCalled();
      });

      it('should refresh the qualification record and display an alert of "Certificate uploaded" on successful upload', async () => {
        const { fixture, alertSpy, getByTestId, workerService, qualificationCertificateService } =
          await setupWithQualificationCerts();
        const updatedQualifications: QualificationsByGroup = cloneDeep(mockQualifications);
        updatedQualifications.groups[1].records[0].qualificationCertificates = [
          { uid: 'mock-uid', filename: mockUploadFile.name, uploadDate: '2024-10-15' },
        ];

        const mockUpdatedData = {
          training: mockTrainingData,
          qualifications: updatedQualifications,
        } as TrainingAndQualificationRecords;

        const workerSpy = spyOn(workerService, 'getAllTrainingAndQualificationRecords').and.returnValue(
          of(mockUpdatedData),
        );
        spyOn(qualificationCertificateService, 'addCertificates').and.returnValue(of(null));

        const recordRow = getByTestId(uidForRecordWithNoCerts);
        const uploadButton = within(recordRow).getByTestId('fileInput');

        userEvent.upload(uploadButton, mockUploadFile);

        await fixture.whenStable();
        fixture.detectChanges();

        expect(workerSpy).toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalledWith({
          type: 'success',
          message: 'Certificate uploaded',
        });

        // the record that had no certs now should have one cert and display a download link
        const updatedRow = getByTestId(uidForRecordWithNoCerts);
        expect(within(updatedRow).getByText('Download')).toBeTruthy();
      });

      it('should display an error message on the training category when certificate upload fails', async () => {
        const { fixture, getByText, getByTestId, qualificationCertificateService } =
          await setupWithQualificationCerts();
        spyOn(qualificationCertificateService, 'addCertificates').and.returnValue(throwError('403 forbidden'));

        const recordRow = getByTestId(uidForRecordWithNoCerts);
        const uploadButton = within(recordRow).getByTestId('fileInput');

        userEvent.upload(uploadButton, mockUploadFile);

        fixture.detectChanges();

        expect(getByText("There's a problem with this upload. Try again later or contact us for help.")).toBeTruthy();
      });
    });
  });

  describe('download all certificates', () => {
    it('should display a link for downloading all certificates', async () => {
      const { getByText } = await setup();

      expect(getByText('Download all their training and qualification certificates')).toBeTruthy();
    });

    it('should not display the download all link if worker has got no certificates', async () => {
      const nonMandatorytrainingWithNoCerts = cloneDeep(mockTrainingData.nonMandatory);
      nonMandatorytrainingWithNoCerts.forEach((category) =>
        category.trainingRecords.forEach((record) => (record.trainingCertificates = [])),
      );

      const { queryByText } = await setup({
        nonMandatoryTraining: nonMandatorytrainingWithNoCerts,
      });

      expect(queryByText('Download all their training and qualification certificates')).toBeFalsy();
    });

    it('should download all training and qualification certificates for the worker when clicked', async () => {
      const { component, getByText, trainingCertificateService, qualificationCertificateService } = await setup();

      spyOn(trainingCertificateService, 'downloadAllCertificatesAsBlobs').and.callThrough();
      spyOn(qualificationCertificateService, 'downloadAllCertificatesAsBlobs').and.callThrough();

      const downloadAllButton = getByText('Download all their training and qualification certificates');
      userEvent.click(downloadAllButton);

      expect(trainingCertificateService.downloadAllCertificatesAsBlobs).toHaveBeenCalledWith(
        component.workplace.uid,
        component.worker.uid,
      );
      expect(qualificationCertificateService.downloadAllCertificatesAsBlobs).toHaveBeenCalledWith(
        component.workplace.uid,
        component.worker.uid,
      );
    });

    it('should call saveFilesAsZip with all the downloaded certificates', async () => {
      const { component, getByText } = await setup();
      const expectedZipFileName = `All certificates - ${component.worker.nameOrId}.zip`;

      const fileUtilSpy = spyOn(FileUtil, 'saveFilesAsZip').and.callThrough();

      const downloadAllButton = getByText('Download all their training and qualification certificates');
      userEvent.click(downloadAllButton);

      expect(fileUtilSpy).toHaveBeenCalled();

      const contentsOfZipFile = fileUtilSpy.calls.mostRecent().args[0];
      const nameOfZipFile = fileUtilSpy.calls.mostRecent().args[1];

      expect(nameOfZipFile).toEqual(expectedZipFileName);

      mockTrainingCertificates.forEach((certificate) => {
        expect(contentsOfZipFile).toContain(
          jasmine.objectContaining({
            filename: 'Training certificates/' + certificate.filename,
            fileBlob: mockCertificateFileBlob,
          }),
        );
      });
      mockQualificationCertificates.forEach((certificate) => {
        expect(contentsOfZipFile).toContain(
          jasmine.objectContaining({
            filename: 'Qualification certificates/' + certificate.filename,
            fileBlob: mockCertificateFileBlob,
          }),
        );
      });
    });

    it('should not start a new download on click if still downloading certificates in the background', async () => {
      const { getByText, trainingCertificateService, qualificationCertificateService } = await setup();

      const downloadAllButton = getByText('Download all their training and qualification certificates');
      spyOn(trainingCertificateService, 'downloadAllCertificatesAsBlobs').and.callThrough();
      spyOn(qualificationCertificateService, 'downloadAllCertificatesAsBlobs').and.callThrough();

      userEvent.click(downloadAllButton);
      userEvent.click(downloadAllButton);

      expect(trainingCertificateService.downloadAllCertificatesAsBlobs).toHaveBeenCalledTimes(1);
      expect(qualificationCertificateService.downloadAllCertificatesAsBlobs).toHaveBeenCalledTimes(1);
    });
  });
});
