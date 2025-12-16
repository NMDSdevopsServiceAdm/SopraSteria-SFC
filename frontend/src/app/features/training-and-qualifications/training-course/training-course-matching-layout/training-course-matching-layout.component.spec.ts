import { of } from 'rxjs';

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
import { render } from '@testing-library/angular';

import { SelectUploadFileComponent } from '../../../../shared/components/select-upload-file/select-upload-file.component';
import { TrainingCourseMatchingLayoutComponent } from './training-course-matching-layout.component';
import userEvent from '@testing-library/user-event';

fdescribe('TrainingCourseMatchingLayoutComponent', () => {
  const mockTrainingRecordData = {
    completed: '2024-01-01',
    expires: '2025-01-01',
    notes: 'Test notes',
    trainingCertificates: [],
  };

  const defaultSelectedTraining = {
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

  async function setup(overrides: any = {}) {
    const defaultTrainingRecord = { ...mockTrainingRecordData };

    const selectedTraining = overrides?.selectedTraining ?? defaultSelectedTraining;
    const trainingRecordId = overrides?.trainingRecordId !== undefined ? overrides.trainingRecordId : '1';

    const mockTrainingRecord =
      overrides?.trainingRecord !== undefined ? overrides.trainingRecord : defaultTrainingRecord;
    const workerServiceSpy = jasmine.createSpy().and.returnValue(of(mockTrainingRecord));
    const mockWorker = {
      uid: '2',
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
              params: { trainingRecordId, establishmentuid: '24', id: 2 },
              data: {
                trainingRecord: mockTrainingRecordData,
                trainingCourses: mockTrainingCourses,
              },
            },
            parent: {
              snapshot: {
                data: {
                  establishment: {
                    uid: '1',
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
          useFactory: MockTrainingServiceWithOverrides.factory({ selectedTraining }),
        },
        {
          provide: WorkerService,
          useFactory: MockWorkerServiceWithOverrides.factory({
            getTrainingRecord: workerServiceSpy,
            worker: mockWorker,
          }),
        },
        {
          provide: EstablishmentService,
          useFactory: () => ({
            establishment: { uid: '24' },
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
    spyOn(trainingService, 'getSelectedTrainingCourse').and.returnValue(selectedTraining);

    component.selectedTrainingCourse = selectedTraining;
    component.trainingRecord = mockTrainingRecord;
    setupTools.fixture.detectChanges();
    await setupTools.fixture.whenStable();
    setupTools.fixture;

    return {
      ...setupTools,
      component,
      routerSpy,
      updateSpy,
      createTrainingRecordSpy,
      workerService,
      workerServiceSpy,
      alertServiceSpy,
      trainingService,
      certificateService,
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
        };

        const { component } = await setup({ trainingRecord: mockRecord });

        component.form.patchValue({
          completed: { day: 1, month: 1, year: 2024 },
          expires: null,
        });

        component.autoFillExpiry();

        const expiry = component.form.value.expires;
        expect(expiry.year).toBe(2025);
        expect(expiry.month).toBe(1);
        expect(expiry.day).toBe(1);
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
      const overrides = { trainingRecordId: null, selectedTraining: null };

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
      const { component, getByTestId } = await setup();

      const span = getByTestId('includeTraining');
      const link = span.closest('a');
      expect(link).toBeTruthy();

      const href = link.getAttribute('href');

      expect(href).toContain(
        `/workplace/${component.workplace.uid}/training-and-qualifications-record/${component.worker.uid}/training/${component.trainingRecordId}/include-training-course-details`,
      );
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
        const { getByRole, updateSpy } = await setup({});

        userEvent.click(getByRole('button', { name: 'Save and return' }));

        expect(updateSpy).toHaveBeenCalled();
      });

      it('should navigate to home page and show banner after successful submit', async () => {
        const { fixture, routerSpy, alertServiceSpy, getByRole } = await setup();

        userEvent.click(getByRole('button', { name: 'Save and return' }));
        await fixture.whenStable();

        expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'home' });
        expect(alertServiceSpy).toHaveBeenCalledWith({
          type: 'success',
          message: 'Training record updated',
        });
      });
    });

    describe('when adding a new training record', () => {
      const overrides = { trainingRecordId: null, selectedTraining: null };

      it('should call createTrainingRecord when form is valid', async () => {
        const { getByRole, createTrainingRecordSpy } = await setup(overrides);

        userEvent.click(getByRole('button', { name: 'Save training record' }));

        expect(createTrainingRecordSpy).toHaveBeenCalled();
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
    it('should navigate to delete record page', async () => {
      const { component, routerSpy } = await setup();
      component.navigateToDeleteTrainingRecord();
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        '24',
        'training-and-qualifications-record',
        '2',
        'training',
        '1',
        'delete',
      ]);
    });
  });

  describe('Cancel', () => {
    it('should cancel and navigate to dashboard', async () => {
      const { component, routerSpy } = await setup();
      const event = { preventDefault: jasmine.createSpy() };
      component.onCancel(event as any);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'home' });
    });
  });
});
