import { of } from 'rxjs';

import { Location } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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

import { TrainingCourseMatchingLayoutComponent } from './training-course-matching-layout.component';

describe('TrainingCourseMatchingLayoutComponent', () => {
  const defaultTrainingRecord = {
    title: 'Training record title',
    accredited: 'Yes',
    deliveredBy: 'External provider',
    trainingProviderId: null,
    otherTrainingProviderName: null,
    howWasItDelivered: 'Face to face',
    doesNotExpire: false,
    validityPeriodInMonth: 24,
    completed: '2024-01-01',
    expires: '2025-01-01',
    notes: 'Test notes',
    trainingCertificates: [],
    trainingCategory: {
      id: 33,
      seq: 0,
      category: 'Safeguarding adults',
      trainingCategoryGroup: 'Care skills and knowledge',
    },
  };

  const defaultSelectedTrainingCourse = {
    id: 1,
    uid: 'course-uid-1',
    name: 'Basic Sefeguarding For support staff',
    accredited: 'No',
    deliveredBy: 'External provider',
    trainingProviderId: 63,
    otherTrainingProviderName: 'Care skill academy',
    howWasItDelivered: null,
    doesNotExpire: false,
    validityPeriodInMonth: 12,
    archived: false,
    trainingProvider: null,
    trainingCategoryId: 33,
    trainingCategoryName: 'Safeguarding adults',
  };

  const defaultTrainingCourses = [
    { id: 1, name: 'Fire Safety' },
    { id: 2, name: 'Manual Handling' },
  ];
  const mockWorkerUid = 'worker-uid';
  const mockEstablishmentUid = 'establishment-uid';
  const mockTrainingRecordUid = 'mock-training-record-uid';
  const mockWorker = {
    uid: mockWorkerUid,
    mainJob: {
      jobId: '1',
      title: 'Admin',
    },
    nameOrId: 'Someone',
  };

  const overridesForViewingRecord = {
    selectedTrainingCourse: null,
    trainingRecord: { ...defaultTrainingRecord, isMatchedToTrainingCourse: true },
  };
  const overridesForAddingNewRecord = { trainingRecordId: null, trainingRecord: null };

  async function setup(overrides: any = {}) {
    const selectedTrainingCourse =
      overrides?.selectedTrainingCourse !== undefined
        ? overrides?.selectedTrainingCourse
        : defaultSelectedTrainingCourse;
    const trainingCourses = overrides?.trainingCourses ?? defaultTrainingCourses;

    const trainingRecordId =
      overrides?.trainingRecordId !== undefined ? overrides.trainingRecordId : mockTrainingRecordUid;
    const mockTrainingRecord =
      overrides?.trainingRecord !== undefined ? overrides.trainingRecord : { ...defaultTrainingRecord };

    const setupTools = await render(TrainingCourseMatchingLayoutComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      declarations: [CertificationsTableComponent],
      providers: [
        WindowRef,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { trainingRecordId, establishmentuid: mockEstablishmentUid, id: mockWorkerUid },
              data: {
                trainingRecord: mockTrainingRecord,
                trainingCourses: trainingCourses,
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
        provideHttpClient(),
        provideHttpClientTesting(),
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

    const route = injector.inject(ActivatedRoute) as ActivatedRoute;

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
      route,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display a page heading', async () => {
    const { getByRole } = await setup();
    expect(getByRole('heading', { level: 1, name: 'Training record details' })).toBeTruthy();
  });

  it('should display a different page heading if adding a new training record', async () => {
    const { getByRole } = await setup({ trainingRecord: null, trainingRecordId: null });
    expect(getByRole('heading', { level: 1, name: 'Add training record details' })).toBeTruthy();
  });

  describe('fillForm', () => {
    const mockTrainingRecordWithoutDates = {
      ...defaultTrainingRecord,
      expires: null,
      completed: null,
    };

    describe('when applying course detail to existing training record', () => {
      it('should populate the form on init', async () => {
        const { component } = await setup();

        expect(component.form.value.completed.day).toBe(1);
        expect(component.form.value.completed.month).toBe(1);
        expect(component.form.value.completed.year).toBe(2024);

        expect(component.form.value.notes).toBe('Test notes');
      });

      it('should auto-calc expiry date on page load if expiry date is missing', async () => {
        const mockRecord = {
          ...defaultTrainingRecord,
          expires: null,
          completed: '2025-01-01',
        };
        const { component } = await setup({ trainingRecord: mockRecord });

        const expiry = component.form.value.expires;
        expect(expiry.year).toBe(2026);
        expect(expiry.month).toBe(1);
        expect(expiry.day).toBe(1);
      });

      it('should auto-calc expiry date when user input a completed date', async () => {
        const mockRecord = {
          ...defaultTrainingRecord,
          expires: null,
          completed: null,
        };
        const { fixture, component, getByTestId } = await setup({ trainingRecord: mockRecord });

        const completedDate = within(getByTestId('completedDate'));

        userEvent.type(completedDate.getByLabelText('Day'), '1');
        userEvent.type(completedDate.getByLabelText('Month'), '1');
        userEvent.type(completedDate.getByLabelText('Year'), '2025');

        await fixture.whenStable();

        const expiry = component.form.value.expires;
        expect(expiry.year).toBe(2026);
        expect(expiry.month).toBe(1);
        expect(expiry.day).toBe(1);
      });

      it('should not change the expiry date if it is already filled in', async () => {
        const mockRecord = {
          ...defaultTrainingRecord,
          expires: '2027-07-31',
          completed: null,
        };

        const { component, getByTestId } = await setup({ trainingRecord: mockRecord });

        const completedDate = within(getByTestId('completedDate'));

        userEvent.type(completedDate.getByLabelText('Day'), '1');
        userEvent.type(completedDate.getByLabelText('Month'), '1');
        userEvent.type(completedDate.getByLabelText('Year'), '2025');

        const expiry = component.form.value.expires;
        expect(expiry.year).toBe(2027);
        expect(expiry.month).toBe(7);
        expect(expiry.day).toBe(31);
      });

      it('should not auto fill in expiry if the value in completed date is not a valid date', async () => {
        const { component, getByTestId } = await setup({ trainingRecord: mockTrainingRecordWithoutDates });

        const completedDate = within(getByTestId('completedDate'));

        userEvent.type(completedDate.getByLabelText('Day'), '31');
        userEvent.type(completedDate.getByLabelText('Month'), '2');
        userEvent.type(completedDate.getByLabelText('Year'), '2025');

        const expiry = component.form.value.expires;
        expect(expiry.year).toEqual(null);
        expect(expiry.month).toEqual(null);
        expect(expiry.day).toEqual(null);
      });

      it('should set expiryMismatchWarning when expiry date does not match the completed date and validity period', async () => {
        const { fixture, getByTestId, queryByText } = await setup({
          trainingRecord: mockTrainingRecordWithoutDates,
        });

        const validityMonths = defaultSelectedTrainingCourse.validityPeriodInMonth;
        const expectedWarningText = `This training is usually valid for ${validityMonths} months`;

        const completedDate = within(getByTestId('completedDate'));
        const expiryDate = within(getByTestId('expiresDate'));

        userEvent.type(expiryDate.getByLabelText('Day'), '10');
        userEvent.type(expiryDate.getByLabelText('Month'), '2');
        userEvent.type(expiryDate.getByLabelText('Year'), '2025');

        userEvent.type(completedDate.getByLabelText('Day'), '1');
        userEvent.type(completedDate.getByLabelText('Month'), '1');
        userEvent.type(completedDate.getByLabelText('Year'), '2024');

        fixture.detectChanges();

        expect(queryByText(expectedWarningText)).toBeTruthy();

        ['Day', 'Month', 'Year'].forEach((field) => userEvent.clear(expiryDate.getByLabelText(field)));

        userEvent.type(expiryDate.getByLabelText('Day'), '1');
        userEvent.type(expiryDate.getByLabelText('Month'), '1');
        userEvent.type(expiryDate.getByLabelText('Year'), '2025');

        fixture.detectChanges();

        expect(queryByText(expectedWarningText)).toBeFalsy();
      });
    });

    describe('when viewing an existing training record', () => {
      it('should show the expiryMismatchWarning if the dates does not match', async () => {
        const validityMonths = defaultTrainingRecord.validityPeriodInMonth;
        const expectedWarningText = `This training is usually valid for ${validityMonths} months`;

        const { queryByTestId, queryByText } = await setup(overridesForViewingRecord);

        expect(queryByTestId('expiresDate')).toBeTruthy();
        expect(queryByText(expectedWarningText)).toBeTruthy();
      });
    });

    describe('when adding a new training record', () => {
      it('should not show the input boxes for expiry date', async () => {
        const { queryByTestId } = await setup(overridesForAddingNewRecord);

        expect(queryByTestId('expiresDate')).toBeFalsy();
      });
    });
  });

  describe('Training course summary row', () => {
    it('should display the selected training course name', async () => {
      const { component, getByText } = await setup();

      expect(getByText(component.selectedTrainingCourse.name)).toBeTruthy();
    });

    it('should display a "Select a different training course" link if more than one training course exists', async () => {
      const { getByTestId } = await setup();

      const span = getByTestId('includeTraining');
      const link = span.closest('a');
      expect(link).toBeTruthy();
    });

    it('should NOT display the link if only one training course exists', async () => {
      const { fixture, queryByTestId } = await setup({ trainingCourses: [defaultTrainingCourses[0]] });

      fixture.detectChanges();

      const link = queryByTestId('includeTraining');
      expect(link).toBeNull();
    });

    it('should not display the row of "Provider name" if "In-house staff" is chosen as course provider', async () => {
      const mockTrainingCourse = { ...defaultSelectedTrainingCourse, deliveredBy: 'In-house staff' };
      const { queryByText } = await setup({ selectedTrainingCourse: mockTrainingCourse });

      expect(queryByText('Training provider name')).toBeFalsy();
    });

    describe('when applying a course to exiting record', () => {
      it('the "Select a different training course" link should point to the include-training-course-details page', async () => {
        const { component, getByTestId, routerSpy, route } = await setup();

        const span = getByTestId('includeTraining');
        const link = span.closest('a');
        expect(link).toBeTruthy();

        userEvent.click(link);

        expect(routerSpy).toHaveBeenCalledWith(['../include-training-course-details'], { relativeTo: route });
      });
    });

    describe('when adding a new training course', () => {
      it('should show the data of selected training course', async () => {
        const { getByTestId } = await setup(overridesForAddingNewRecord);
        const course = defaultSelectedTrainingCourse;
        const trainingRecordDetails = getByTestId('trainingRecordDetails');

        expect(within(trainingRecordDetails).getByText(course.name)).toBeTruthy();
        expect(within(trainingRecordDetails).getByText(course.trainingCategoryName)).toBeTruthy();
        expect(within(trainingRecordDetails).getByText(course.accredited)).toBeTruthy();
        expect(within(trainingRecordDetails).getByText(course.deliveredBy)).toBeTruthy();

        const validityMonths = `${course.validityPeriodInMonth} months`;
        expect(within(trainingRecordDetails).getByText(validityMonths)).toBeTruthy();
      });

      it('should show "Does not expire" if the course does not expire', async () => {
        const courseThatDoesNotExpire = {
          ...defaultSelectedTrainingCourse,
          doesNotExpire: true,
          validityPeriodInMonth: null,
        };
        const { getByTestId } = await setup({
          ...overridesForAddingNewRecord,
          selectedTrainingCourse: courseThatDoesNotExpire,
        });

        const trainingRecordDetails = getByTestId('trainingRecordDetails');

        expect(within(trainingRecordDetails).getByText('Does not expire')).toBeTruthy();
      });

      it('the "Select a different training course" link should point to the previous page', async () => {
        const { getByTestId, historyBackSpy } = await setup(overridesForAddingNewRecord);

        const span = getByTestId('includeTraining');
        const link = span.closest('a');
        expect(link).toBeTruthy();

        userEvent.click(link);

        expect(historyBackSpy).toHaveBeenCalled();
      });
    });

    describe('when viewing an existing training record', () => {
      it('should show the data of training record instead of training course', async () => {
        const { getByTestId } = await setup(overridesForViewingRecord);

        const trainingRecordDetails = getByTestId('trainingRecordDetails');

        expect(within(trainingRecordDetails).getByText(defaultTrainingRecord.title)).toBeTruthy();
        expect(within(trainingRecordDetails).getByText(defaultTrainingRecord.trainingCategory.category)).toBeTruthy();
        expect(within(trainingRecordDetails).getByText(defaultTrainingRecord.accredited)).toBeTruthy();
        expect(within(trainingRecordDetails).getByText(defaultTrainingRecord.deliveredBy)).toBeTruthy();
        const validityMonths = `${defaultTrainingRecord.validityPeriodInMonth} months`;
        expect(within(trainingRecordDetails).getByText(validityMonths)).toBeTruthy();
      });

      it('the "Select a different training course" link should point to the include-training-course-details page', async () => {
        const { getByTestId, routerSpy, route } = await setup(overridesForViewingRecord);

        const span = getByTestId('includeTraining');
        const link = span.closest('a');
        expect(link).toBeTruthy();

        userEvent.click(link);

        expect(routerSpy).toHaveBeenCalledWith(['../include-training-course-details'], { relativeTo: route });
      });
    });
  });

  describe('Submit', () => {
    describe('when applying course details to existing training record', () => {
      it('should call updateTrainingRecord when form is valid', async () => {
        const selectedCourse = defaultSelectedTrainingCourse;
        const { getByRole, updateSpy } = await setup();

        userEvent.click(getByRole('button', { name: 'Save and return' }));

        expect(updateSpy).toHaveBeenCalledWith(mockEstablishmentUid, mockWorkerUid, mockTrainingRecordUid, {
          title: selectedCourse.name,
          trainingCategory: { id: selectedCourse.trainingCategoryId },
          trainingCourseFK: 1,

          accredited: selectedCourse.accredited,
          deliveredBy: selectedCourse.deliveredBy,
          trainingProviderId: selectedCourse.trainingProviderId,
          otherTrainingProviderName: selectedCourse.otherTrainingProviderName,
          howWasItDelivered: selectedCourse.howWasItDelivered,
          doesNotExpire: selectedCourse.doesNotExpire,
          validityPeriodInMonth: selectedCourse.validityPeriodInMonth,

          completed: defaultTrainingRecord.completed,
          expires: defaultTrainingRecord.expires,
          notes: defaultTrainingRecord.notes,
        });
      });

      it("should navigate to worker's training and qualifications page and show banner after successful submit", async () => {
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

      it('should show an error message when the input are not valid', async () => {
        const { fixture, updateSpy, getByText, getAllByText, getByRole, getByTestId } = await setup({
          trainingRecord: {},
        });

        const completedDate = within(getByTestId('completedDate'));
        const expiryDate = within(getByTestId('expiresDate'));
        const notes = getByRole('textbox', { name: 'Add a note' });

        userEvent.type(expiryDate.getByLabelText('Day'), '10');
        userEvent.type(expiryDate.getByLabelText('Month'), '2');
        userEvent.type(expiryDate.getByLabelText('Year'), '2023');

        userEvent.type(completedDate.getByLabelText('Day'), '1');
        userEvent.type(completedDate.getByLabelText('Month'), '1');
        userEvent.type(completedDate.getByLabelText('Year'), '2024');

        userEvent.type(notes, 'a'.repeat(1001));

        userEvent.click(getByRole('button', { name: 'Save and return' }));

        fixture.detectChanges();

        expect(updateSpy).not.toHaveBeenCalled();
        expect(getByText('There is a problem')).toBeTruthy();
        expect(getAllByText('Expiry date must be after date completed')).toHaveSize(2);
        expect(getAllByText('Notes must be 1000 characters or fewer')).toHaveSize(2);
      });
    });

    describe('when adding a new training record', () => {
      const overrides = { trainingRecordId: null, trainingRecord: null };

      it('should call createTrainingRecord when form is valid', async () => {
        const selectedCourse = defaultSelectedTrainingCourse;
        const { getByRole, createTrainingRecordSpy, getByTestId, getByLabelText } = await setup(overrides);

        const completedDate = within(getByTestId('completedDate'));

        userEvent.type(completedDate.getByLabelText('Day'), '15');
        userEvent.type(completedDate.getByLabelText('Month'), '2');
        userEvent.type(completedDate.getByLabelText('Year'), '2025');

        userEvent.type(getByLabelText('Add a note'), 'some notes');

        userEvent.click(getByRole('button', { name: 'Save training record' }));

        expect(createTrainingRecordSpy).toHaveBeenCalledWith(mockEstablishmentUid, mockWorkerUid, {
          title: selectedCourse.name,
          trainingCategory: { id: selectedCourse.trainingCategoryId },
          trainingCourseFK: 1,

          accredited: selectedCourse.accredited,
          deliveredBy: selectedCourse.deliveredBy,
          trainingProviderId: selectedCourse.trainingProviderId,
          otherTrainingProviderName: selectedCourse.otherTrainingProviderName,
          howWasItDelivered: selectedCourse.howWasItDelivered,
          doesNotExpire: selectedCourse.doesNotExpire,
          validityPeriodInMonth: selectedCourse.validityPeriodInMonth,

          completed: '2025-02-15',
          expires: '2026-02-15', // 2025-02-15 + 12 months
          notes: 'some notes',
        });
      });

      it('should automatically set the expiry date of new training course', async () => {
        const { fixture, getByRole, getByTestId, createTrainingRecordSpy, alertServiceSpy } = await setup(overrides);

        const completedDate = within(getByTestId('completedDate'));

        userEvent.type(completedDate.getByLabelText('Day'), '15');
        userEvent.type(completedDate.getByLabelText('Month'), '2');
        userEvent.type(completedDate.getByLabelText('Year'), '2025');

        const expectedExpiryDate = '2026-02-15';

        userEvent.click(getByRole('button', { name: 'Save training record' }));

        await fixture.whenStable();

        expect(createTrainingRecordSpy).toHaveBeenCalledWith(
          mockEstablishmentUid,
          mockWorkerUid,
          jasmine.objectContaining({ expires: expectedExpiryDate }),
        );

        expect(alertServiceSpy).toHaveBeenCalledWith({
          type: 'success',
          message: 'Training record added',
        });
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

        const completedDate = within(getByTestId('completedDate'));

        userEvent.type(completedDate.getByLabelText('Day'), '15');
        userEvent.type(completedDate.getByLabelText('Month'), '2');
        userEvent.type(completedDate.getByLabelText('Year'), '2025');

        userEvent.click(getByRole('button', { name: 'Save training record' }));

        expect(createTrainingRecordSpy).toHaveBeenCalledWith(
          mockEstablishmentUid,
          mockWorkerUid,
          jasmine.objectContaining({ expires: null }),
        );
      });
    });

    describe('when viewing a training record', () => {
      it('should call updateTrainingRecord when form is valid', async () => {
        const { getByRole, updateSpy } = await setup(overridesForViewingRecord);

        const notes = getByRole('textbox', { name: 'Add a note' });

        userEvent.type(notes, ' some notes');

        userEvent.click(getByRole('button', { name: 'Save and return' }));

        expect(updateSpy).toHaveBeenCalledWith(
          mockEstablishmentUid,
          mockWorkerUid,
          mockTrainingRecordUid,
          jasmine.objectContaining({
            completed: defaultTrainingRecord.completed,
            expires: defaultTrainingRecord.expires,
            notes: `${defaultTrainingRecord.notes} some notes`,
          }),
        );
      });

      it('should show an error message when the input are not valid', async () => {
        const { fixture, getByRole, updateSpy, getByText, getByTestId, getAllByText } =
          await setup(overridesForViewingRecord);

        const completedDate = within(getByTestId('completedDate'));
        const expiryDate = within(getByTestId('expiresDate'));
        const notes = getByRole('textbox', { name: 'Add a note' });

        userEvent.type(expiryDate.getByLabelText('Day'), '32');
        userEvent.type(expiryDate.getByLabelText('Month'), '13');

        userEvent.type(completedDate.getByLabelText('Day'), '32');
        userEvent.type(completedDate.getByLabelText('Month'), '13');

        userEvent.type(notes, 'a'.repeat(1001));

        userEvent.click(getByRole('button', { name: 'Save and return' }));

        fixture.detectChanges();

        expect(updateSpy).not.toHaveBeenCalled();
        expect(getByText('There is a problem')).toBeTruthy();
        expect(getAllByText('Date completed must be a valid date')).toHaveSize(2);
        expect(getAllByText('Expiry date must be a valid date')).toHaveSize(2);
        expect(getAllByText('Notes must be 1000 characters or fewer')).toHaveSize(2);
      });

      it("should navigate to worker's training and qualifications page and show banner after successful submit", async () => {
        const { fixture, routerSpy, alertServiceSpy, getByRole } = await setup(overridesForViewingRecord);

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
      it('should update notes value & remaining characters on input', async () => {
        const { fixture, component, getByRole, getByText } = await setup();

        const textBox = getByRole('textbox', { name: 'Add a note' });

        userEvent.clear(textBox);
        fixture.detectChanges();
        expect(getByText(`You have 1,000 characters remaining`)).toBeTruthy();

        userEvent.type(textBox, 'hello world');
        fixture.detectChanges();

        const expectedRemainingCharacterCount = component.notesMaxLength - 'hello world'.length;
        expect(getByText(`You have ${expectedRemainingCharacterCount} characters remaining`)).toBeTruthy();
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
          mockTrainingRecordUid,
          'delete',
        ]);
      });

      describe('when viewing an existing training record', () => {
        it('should navigate to delete record page when delete link is clicked', async () => {
          const { getByText, routerSpy } = await setup(overridesForViewingRecord);

          const deleteLink = getByText('Delete this training record');
          userEvent.click(deleteLink);

          expect(routerSpy).toHaveBeenCalledWith([
            '/workplace',
            mockEstablishmentUid,
            'training-and-qualifications-record',
            mockWorkerUid,
            'training',
            mockTrainingRecordUid,
            'delete',
          ]);
        });
      });

      describe('when adding a new training record', () => {
        const overrides = { trainingRecordId: null, selectedTrainingCourse: null };

        it('should not show the delete link when user is adding a new training record', async () => {
          const { queryByText } = await setup(overrides);

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
});
