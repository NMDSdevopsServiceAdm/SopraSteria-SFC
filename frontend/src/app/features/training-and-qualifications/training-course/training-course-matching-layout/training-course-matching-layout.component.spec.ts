import { of } from 'rxjs';

import { Location } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DeliveredBy, HowWasItDelivered } from '@core/model/training.model';
import { YesNoDontKnow } from '@core/model/YesNoDontKnow.enum';
import { AlertService } from '@core/services/alert.service';
import { TrainingCertificateService } from '@core/services/certificate.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockTrainingCertificateService } from '@core/test-utils/MockCertificateService';
import { MockTrainingCategoryService } from '@core/test-utils/MockTrainingCategoriesService';
import { MockTrainingServiceWithOverrides } from '@core/test-utils/MockTrainingService';
import { MockWorkerServiceWithOverrides } from '@core/test-utils/MockWorkerService';
import { CertificationsTableComponent } from '@shared/components/certifications-table/certifications-table.component';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { SelectUploadFileComponent } from '../../../../shared/components/select-upload-file/select-upload-file.component';
import { TrainingCourseMatchingLayoutComponent } from './training-course-matching-layout.component';

describe('TrainingCourseMatchingLayoutComponent', () => {
  const mockTrainingRecordData = {
    completed: '2024-01-01',
    expires: '2025-01-01',
    notes: 'Test notes',
    trainingCertificates: [],
  };

  const defaultSelectedTrainingCourse = {
    id: 1,
    uid: 'course-uid-1',
    name: 'Basic Sefeguarding For support staff',
    accredited: null,
    deliveredBy: null,
    trainingProviderId: null,
    otherTrainingProviderName: null,
    howWasItDelivered: null,
    doesNotExpire: false,
    validityPeriodInMonth: 12,
    archived: false,
    category: { id: 33, seq: 0, category: 'Safeguarding adults', trainingCategoryGroup: 'Care skills and knowledge' },
    trainingProvider: null,
    trainingCategoryName: 'Safeguarding adults',
  };

  const mockTrainingCourses = [
    { id: 1, name: 'Fire Safety' },
    { id: 2, name: 'Manual Handling' },
  ];
  const mockWorkerUid = 'worker-uid';
  const mockEstablishmentUid = 'establishment-uid';

  async function setup(overrides: any = {}) {
    const defaultTrainingRecord = { ...mockTrainingRecordData };

    const selectedTrainingCourse = overrides?.selectedTrainingCourse ?? defaultSelectedTrainingCourse;
    const trainingRecordId = overrides?.trainingRecordId !== undefined ? overrides.trainingRecordId : '1';

    const mockTrainingRecord =
      overrides?.trainingRecord !== undefined ? overrides.trainingRecord : defaultTrainingRecord;
    const mockWorker = {
      uid: mockWorkerUid,
      mainJob: {
        jobId: '1',
        title: 'Admin',
      },
      nameOrId: 'Someone',
    };

    const setupTools = await render(TrainingCourseMatchingLayoutComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, ReactiveFormsModule],
      declarations: [CertificationsTableComponent, SelectUploadFileComponent],
      providers: [
        WindowRef,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { trainingRecordId, establishmentuid: mockEstablishmentUid, id: mockWorkerUid },
              data: {
                trainingRecord: mockTrainingRecord,
                trainingCourses: mockTrainingCourses,
              },
            },
            parent: {
              snapshot: {
                data: {
                  establishment: {
                    uid: mockEstablishmentUid,
                  },
                },
              },
            },
          },
        },
        UntypedFormBuilder,
        ErrorSummaryService,
        {
          provide: TrainingService,
          useFactory: MockTrainingServiceWithOverrides.factory({
            getSelectedTrainingCourse: () => selectedTrainingCourse,
          }),
        },
        {
          provide: WorkerService,
          useFactory: MockWorkerServiceWithOverrides.factory({
            worker: mockWorker,
          }),
        },
        {
          provide: EstablishmentService,
          useFactory: () => ({
            establishment: { uid: mockEstablishmentUid },
          }),
        },
        { provide: TrainingCategoryService, useClass: MockTrainingCategoryService },
        {
          provide: TrainingCertificateService,
          useClass: MockTrainingCertificateService,
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const workerService = injector.inject(WorkerService);
    const updateSpy = spyOn(workerService, 'updateTrainingRecord').and.returnValue(of(null));
    const createTrainingRecordSpy = spyOn(workerService, 'createTrainingRecord').and.returnValue(of(null));

    const component = setupTools.fixture.componentInstance;
    const alertService = injector.inject(AlertService) as AlertService;
    const alertServiceSpy = spyOn(alertService, 'addAlert');

    const trainingService = injector.inject(TrainingService) as TrainingService;
    const certificateService = injector.inject(TrainingCertificateService) as TrainingCertificateService;
    spyOn(trainingService, 'getSelectedTrainingCourse').and.returnValue(selectedTrainingCourse);

    const location = injector.inject(Location) as Location;
    const historyBackSpy = spyOn(location, 'back');

    return {
      ...setupTools,
      component,
      routerSpy,
      updateSpy,
      createTrainingRecordSpy,
      workerService,
      alertServiceSpy,
      trainingService,
      certificateService,
      historyBackSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('fillForm', () => {
    describe('when applying course detail to existing training record', () => {
      it('should populate the form on init', async () => {
        const { component } = await setup();

        expect(component.form.value.completed.day).toBe(1);
        expect(component.form.value.completed.month).toBe(1);
        expect(component.form.value.completed.year).toBe(2024);

        expect(component.form.value.notes).toBe('Test notes');
      });

      it('should auto-calc expiry when missing', async () => {
        const mockRecord = {
          ...mockTrainingRecordData,
          expires: null,
          completed: null,
        };

        const { fixture, component, getByTestId } = await setup({ trainingRecord: mockRecord });

        const completeDate = within(getByTestId('completedDate'));

        userEvent.type(completeDate.getByLabelText('Day'), '1');
        userEvent.type(completeDate.getByLabelText('Month'), '1');
        userEvent.type(completeDate.getByLabelText('Year'), '2025');

        await fixture.whenStable();

        const expiry = component.form.value.expires;
        expect(expiry.year).toBe(2026);
        expect(expiry.month).toBe(1);
        expect(expiry.day).toBe(1);
      });

      it('should not change the expiry date if it is already filled in', async () => {
        const mockRecord = {
          ...mockTrainingRecordData,
          expires: '2027-07-31',
          completed: null,
        };

        const { fixture, component, getByTestId } = await setup({ trainingRecord: mockRecord });

        const completeDate = within(getByTestId('completedDate'));

        userEvent.type(completeDate.getByLabelText('Day'), '1');
        userEvent.type(completeDate.getByLabelText('Month'), '1');
        userEvent.type(completeDate.getByLabelText('Year'), '2025');

        await fixture.whenStable();

        const expiry = component.form.value.expires;
        expect(expiry.year).toBe(2027);
        expect(expiry.month).toBe(7);
        expect(expiry.day).toBe(31);
      });

      it('should not auto fill in expiry if the value in completed date is not a valid date', async () => {
        const mockRecord = {
          ...mockTrainingRecordData,
          expires: null,
          completed: null,
        };

        const { fixture, component, getByTestId } = await setup({ trainingRecord: mockRecord });

        const completeDate = within(getByTestId('completedDate'));

        userEvent.type(completeDate.getByLabelText('Day'), '31');
        userEvent.type(completeDate.getByLabelText('Month'), '2');
        userEvent.type(completeDate.getByLabelText('Year'), '2025');

        await fixture.whenStable();

        const expiry = component.form.value.expires;
        expect(expiry.year).toEqual(null);
        expect(expiry.month).toEqual(null);
        expect(expiry.day).toEqual(null);
      });

      it('should set expiryMismatchWarning when expiry does not match validity period', async () => {
        const { component } = await setup();

        component.form.patchValue({
          completed: { day: 1, month: 1, year: 2024 },
          expires: { day: 10, month: 2, year: 2025 },
        });

        component.checkExpiryMismatch();

        expect(component.expiryMismatchWarning).toBeTrue();
      });
    });

    describe('when adding a new training record', () => {
      const overrides = { trainingRecordId: null, selectedTrainingCourse: null };

      it('should not show the input boxes for expiry date', async () => {
        const { queryByTestId } = await setup(overrides);

        expect(queryByTestId('expiresDate')).toBeFalsy();
      });
    });
  });

  describe('Training course summary row', () => {
    it('should display the selected training course name', async () => {
      const { component, getByText } = await setup();

      expect(getByText(component.selectedTrainingCourse.name)).toBeTruthy();
    });

    it('should display the "Select a different training course" link if more than one training course exists', async () => {
      const { historyBackSpy, getByTestId } = await setup();

      const span = getByTestId('includeTraining');
      const link = span.closest('a');
      expect(link).toBeTruthy();

      userEvent.click(link);

      expect(historyBackSpy).toHaveBeenCalled();
    });

    it('should NOT display the link if only one training course exists', async () => {
      const { component, fixture, queryByTestId } = await setup();

      component.trainingCourses = [
        {
          id: 1,
          uid: '1',
          name: 'Only Course',
          trainingCategoryId: 10,
          accredited: YesNoDontKnow.Yes,
          deliveredBy: DeliveredBy.ExternalProvider,
          externalProviderName: 'Provider',
          howWasItDelivered: HowWasItDelivered.FaceToFace,
          doesNotExpire: null,
          validityPeriodInMonth: 12,
        },
      ];
      component.selectedTrainingCourse = component.trainingCourses[0];
      fixture.detectChanges();

      const link = queryByTestId('includeTraining');
      expect(link).toBeNull();
    });
  });

  describe('Submit', () => {
    describe('when applying course detail to existing training record', () => {
      it('should call updateTrainingRecord when form is valid', async () => {
        const { getByRole, updateSpy } = await setup();

        userEvent.click(getByRole('button', { name: 'Save and return' }));

        expect(updateSpy).toHaveBeenCalled();
      });

      it("should navigate to worker'training and qualifications page and show banner after successful submit", async () => {
        const { fixture, routerSpy, alertServiceSpy, getByRole } = await setup();

        userEvent.click(getByRole('button', { name: 'Save and return' }));
        await fixture.whenStable();

        const expectedUrl = [
          '/workplace',
          mockEstablishmentUid,
          'training-and-qualifications-record',
          mockWorkerUid,
          'training',
        ];

        expect(routerSpy).toHaveBeenCalledWith(expectedUrl);
        expect(alertServiceSpy).toHaveBeenCalledWith({
          type: 'success',
          message: 'Training record updated',
        });
      });
    });

    describe('when adding a new training record', () => {
      const overrides = { trainingRecordId: null, trainingRecord: null };

      it('should call createTrainingRecord when form is valid', async () => {
        const { getByRole, createTrainingRecordSpy } = await setup(overrides);

        userEvent.click(getByRole('button', { name: 'Save training record' }));

        expect(createTrainingRecordSpy).toHaveBeenCalledWith(mockEstablishmentUid, mockWorkerUid, {
          ...defaultSelectedTrainingCourse,
          title: defaultSelectedTrainingCourse.name,
          trainingCategory: { id: defaultSelectedTrainingCourse.category.id },
          trainingCourseFK: 1,
          completed: null,
          expires: null,
          notes: null,
        });
      });

      it('should automatically set the expiry date of new training course', async () => {
        const { getByRole, getByTestId, createTrainingRecordSpy } = await setup(overrides);

        const completeDate = within(getByTestId('completedDate'));

        userEvent.type(completeDate.getByLabelText('Day'), '15');
        userEvent.type(completeDate.getByLabelText('Month'), '2');
        userEvent.type(completeDate.getByLabelText('Year'), '2025');

        const expectedExpiryDate = '2026-02-15';

        userEvent.click(getByRole('button', { name: 'Save training record' }));

        expect(createTrainingRecordSpy).toHaveBeenCalledWith(
          mockEstablishmentUid,
          mockWorkerUid,
          jasmine.objectContaining({ expires: expectedExpiryDate }),
        );
      });

      it('should not set the expiry date if completed date is empty', async () => {
        const { getByRole, createTrainingRecordSpy } = await setup(overrides);

        userEvent.click(getByRole('button', { name: 'Save training record' }));

        expect(createTrainingRecordSpy).toHaveBeenCalledWith(
          mockEstablishmentUid,
          mockWorkerUid,
          jasmine.objectContaining({ expires: null }),
        );
      });

      it('should not set the expiry date if the course does not have a validity period', async () => {
        const { getByRole, getByTestId, createTrainingRecordSpy } = await setup({
          ...overrides,
          selectedTrainingCourse: { ...defaultSelectedTrainingCourse, validityPeriodInMonth: null },
        });

        const completeDate = within(getByTestId('completedDate'));

        userEvent.type(completeDate.getByLabelText('Day'), '15');
        userEvent.type(completeDate.getByLabelText('Month'), '2');
        userEvent.type(completeDate.getByLabelText('Year'), '2025');

        userEvent.click(getByRole('button', { name: 'Save training record' }));

        expect(createTrainingRecordSpy).toHaveBeenCalledWith(
          mockEstablishmentUid,
          mockWorkerUid,
          jasmine.objectContaining({ expires: null }),
        );
      });
    });

    it('should handle selecting valid files', async () => {
      const { component } = await setup();
      const file = new File(['abc'], 'certificate.pdf');
      component.onSelectFiles([file]);
      expect(component.filesToUpload.length).toBe(1);
    });

    it('should handle selecting invalid files', async () => {
      const { component } = await setup();
      const invalidFile = new File(['exe'], 'malware.exe');
      component.onSelectFiles([invalidFile]);
      expect(component.certificateErrors).toBeDefined();
      expect(component.certificateErrors.length).toBeGreaterThan(0);
    });

    it('should remove a file from filesToUpload', async () => {
      const { component } = await setup();
      const file = new File(['abc'], 'certificate.pdf');
      component.onSelectFiles([file]);

      expect(component.filesToUpload.length).toBe(1);
      component.removeFileToUpload(0);
      expect(component.filesToUpload.length).toBe(0);
    });

    it('should move a saved certificate into filesToRemove', async () => {
      const { component } = await setup();
      component.trainingCertificates = [{ uid: 'cert1', filename: 'old.pdf' } as any];
      component.removeSavedFile(0);
      expect(component.trainingCertificates.length).toBe(0);
      expect(component.filesToRemove.length).toBe(1);
    });
  });

  describe('Notes', () => {
    it('should toggle notes open state', async () => {
      const { component } = await setup();
      const start = component.notesOpen;
      component.toggleNotesOpen();
      expect(component.notesOpen).toBe(!start);
    });

    it('should update notes value & remaining characters on input', async () => {
      const { component } = await setup();
      const event = { target: { value: 'hello world' } } as any;
      component.handleOnInput(event);
      expect(component.notesValue).toBe('hello world');
      expect(component.remainingCharacterCount).toBe(component.notesMaxLength - 'hello world'.length);
    });
  });

  describe('delete', () => {
    it('should navigate to delete record page when delete link is clicked', async () => {
      const { getByText, routerSpy } = await setup();

      const deleteLink = getByText('Delete this training record');
      userEvent.click(deleteLink);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        mockEstablishmentUid,
        'training-and-qualifications-record',
        mockWorkerUid,
        'training',
        '1',
        'delete',
      ]);
    });

    describe('when adding a new training record', () => {
      it('should not show the delete link when user is adding a new training record', async () => {
        const { queryByText } = await setup({ trainingRecordId: null, selectedTrainingCourse: null });

        const deleteLink = queryByText('Delete this training record');
        expect(deleteLink).toBeFalsy();
      });
    });
  });

  describe('Cancel', () => {
    it('should return to worker training and qualifications page when clicked cancel', async () => {
      const { getByRole, routerSpy } = await setup();

      const cancelLink = getByRole('button', { name: 'Cancel' });
      userEvent.click(cancelLink);

      const expectedUrl = [
        '/workplace',
        mockEstablishmentUid,
        'training-and-qualifications-record',
        mockWorkerUid,
        'training',
      ];

      expect(routerSpy).toHaveBeenCalledWith(expectedUrl);
    });
  });
});
