import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { TrainingCertificateService } from '@core/services/certificate.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockTrainingCertificateService } from '@core/test-utils/MockCertificateService';
import { MockTrainingCategoryService, trainingCategories } from '@core/test-utils/MockTrainingCategoriesService';
import { MockTrainingServiceWithOverrides } from '@core/test-utils/MockTrainingService';
import { MockWorkerServiceWithOverrides, trainingRecord } from '@core/test-utils/MockWorkerService';
import { CertificationsTableComponent } from '@shared/components/certifications-table/certifications-table.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of, throwError } from 'rxjs';
import { DeliveredBy, HowWasItDelivered } from '@core/model/training.model';

import { SelectUploadFileComponent } from '../../../shared/components/select-upload-file/select-upload-file.component';
import { AddEditTrainingComponent } from './add-edit-training.component';
import { YesNoDontKnow } from '@core/model/YesNoDontKnow.enum';
import { TrainingCourse } from '@core/model/training-course.model';

const fillInDate = (containerDiv: HTMLElement, year: string, month: string, day: string) => {
  ['Day', 'Month', 'Year'].forEach((label) => {
    userEvent.clear(within(containerDiv).getByLabelText(label));
  });

  userEvent.type(within(containerDiv).getByLabelText('Day'), day);
  userEvent.type(within(containerDiv).getByLabelText('Month'), month);
  userEvent.type(within(containerDiv).getByLabelText('Year'), year);
};

describe('AddEditTrainingComponent', () => {
  const mockTrainingProviders = [
    { id: 1, name: 'Preset provider name #1', isOther: false },
    { id: 63, name: 'other', isOther: true },
  ];
  const defaultMockTrainingRecord = { ...trainingRecord };

  async function setup(overrides: any = {}) {
    const selectedTraining = overrides?.selectedTraining ?? null;
    const trainingRecordId = overrides?.trainingRecordId !== undefined ? overrides.trainingRecordId : '1';
    const mockTrainingRecord =
      overrides?.trainingRecord !== undefined ? overrides.trainingRecord : defaultMockTrainingRecord;
    const mockWorker = {
      uid: '2',
      mainJob: {
        jobId: '1',
        title: 'Admin',
      },
      nameOrId: 'Someone',
    };

    const setupTools = await render(AddEditTrainingComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      declarations: [CertificationsTableComponent, SelectUploadFileComponent],
      providers: [
        WindowRef,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { trainingRecordId, establishmentuid: '24', id: 2 },
              data: {
                trainingCourses: overrides?.trainingCourses ?? [],
                trainingRecord: mockTrainingRecord,
                trainingProviders: mockTrainingProviders,
              },
            },
            parent: {
              snapshot: {
                data: {
                  establishment: {
                    uid: '1',
                  },
                  trainingCategories: trainingCategories,
                  trainingCourses: overrides?.trainingCourses ?? [],
                  trainingRecord: trainingRecord,
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
            worker: mockWorker,
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
    const createSpy = spyOn(workerService, 'createTrainingRecord').and.callThrough();

    const component = setupTools.fixture.componentInstance;
    const alertService = injector.inject(AlertService) as AlertService;
    const alertServiceSpy = spyOn(alertService, 'addAlert');

    const trainingService = injector.inject(TrainingService) as TrainingService;
    const certificateService = injector.inject(TrainingCertificateService) as TrainingCertificateService;
    const getInputByRole = (role: any, options: any) => setupTools.getByRole(role, options) as HTMLInputElement;

    return {
      ...setupTools,
      component,
      routerSpy,
      updateSpy,
      createSpy,
      workerService,
      alertServiceSpy,
      trainingService,
      certificateService,
      getInputByRole,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the workers name', async () => {
    const { component, getByText } = await setup();
    expect(getByText(component.worker.nameOrId, { exact: false })).toBeTruthy();
  });

  describe('Training category display', async () => {
    it('should show the training category displayed as text when there is a training category present and update the form value', async () => {
      const selectedTraining = { trainingCategory: { category: 'Autism', id: 2 } };

      const { component, getByText, getByTestId } = await setup({
        selectedTraining,
        trainingRecordId: null,
      });

      const { form } = component;

      const expectedFormValue = {
        title: null,
        accredited: null,
        deliveredBy: null,
        externalProviderName: null,
        howWasItDelivered: null,
        validityPeriodInMonth: null,
        doesNotExpire: null,
        completed: { day: null, month: null, year: null },
        expires: { day: null, month: null, year: null },
        notes: null,
      };

      expect(getByTestId('trainingCategoryDisplay')).toBeTruthy();
      expect(getByText('Autism')).toBeTruthy();
      expect(form.value).toEqual(expectedFormValue);
    });

    it('should show the training category displayed as text with a change link when there is a training category present and update the form value', async () => {
      const selectedTraining = {
        trainingCategory: {
          id: 1,
          seq: 20,
          category: 'Autism',
          trainingCategoryGroup: 'Specific conditions and disabilities',
        },
      };

      const { component, fixture, getByText, getByTestId } = await setup({
        trainingRecordId: null,
        selectedTraining,
      });

      fixture.detectChanges();

      const { form } = component;
      const expectedFormValue = {
        title: null,
        accredited: null,
        deliveredBy: null,
        completed: { day: null, month: null, year: null },
        expires: { day: null, month: null, year: null },
        notes: null,
        externalProviderName: null,
        howWasItDelivered: null,
        validityPeriodInMonth: null,
        doesNotExpire: null,
      };

      expect(getByTestId('trainingCategoryDisplay')).toBeTruthy();
      expect(getByText('Autism')).toBeTruthy();
      expect(form.value).toEqual(expectedFormValue);
      expect(getByTestId('changeTrainingCategoryLink')).toBeTruthy();
    });

    it('should show the training category displayed as text when editing an existing training record', async () => {
      const { getByText, getByTestId } = await setup();

      expect(getByTestId('trainingCategoryDisplay')).toBeTruthy();
      expect(getByText('Communication')).toBeTruthy();
    });
  });

  describe('title', () => {
    it('should render the Add training record details title', async () => {
      const { getByText } = await setup({ trainingRecordId: null });

      expect(getByText('Add training record details')).toBeTruthy();
    });

    it('should render the Training details title, when there is a training record id', async () => {
      const { getByText } = await setup();

      expect(getByText('Training record details')).toBeTruthy();
    });
  });

  describe('input form', () => {
    describe('auto suggest', () => {
      it('should show a text input for provider name if user select "External provider" for delivered by external provider', async () => {
        const { getByTestId, getByRole, fixture } = await setup({ trainingRecordId: null });

        const providerName = getByTestId('conditional-external-provider-name');

        expect(providerName).toHaveClass('govuk-radios__conditional--hidden');
        expect(within(providerName).getByRole('textbox', { name: 'Provider name' })).toBeTruthy();

        userEvent.click(getByRole('radio', { name: DeliveredBy.ExternalProvider }));
        fixture.detectChanges();
        expect(providerName).not.toHaveClass('govuk-radios__conditional--hidden');

        userEvent.click(getByRole('radio', { name: DeliveredBy.InHouseStaff }));
        fixture.detectChanges();
        expect(providerName).toHaveClass('govuk-radios__conditional--hidden');
      });

      it('should remove the suggested tray on click of the matching provider name', async () => {
        const { queryByTestId, getByTestId, fixture } = await setup({ trainingRecordId: null });

        const providerName = getByTestId('conditional-external-provider-name');

        userEvent.type(within(providerName).getByRole('textbox', { name: 'Provider name' }), 'provider');
        fixture.detectChanges();

        const getTrayList = getByTestId('tray-list');
        expect(getTrayList).toBeTruthy();

        userEvent.click(within(getTrayList).getByText(mockTrainingProviders[0].name));
        fixture.detectChanges();

        const queryTrayList = queryByTestId('tray-list');
        expect(queryTrayList).toBeFalsy();
      });
    });

    it('should clear the doesNotExpire checkbox when user change validityPeriodInMonth by button', async () => {
      const { getInputByRole, getByTestId, fixture } = await setup();

      const doesNotExpireCheckbox = getInputByRole('checkbox', { name: 'This training does not expire' });
      fireEvent.click(doesNotExpireCheckbox);
      expect(doesNotExpireCheckbox.checked).toBeTrue();

      fireEvent.click(getByTestId('plus-button-validity-period'));
      fixture.detectChanges();

      expect(doesNotExpireCheckbox.checked).toBeFalse();
    });

    it('should clear the doesNotExpire checkbox when user change validityPeriodInMonth by typing value', async () => {
      const { getInputByRole, fixture } = await setup();

      const validityPeriodInMonth = getInputByRole('textbox', {
        name: 'How many months is the training valid for before it expires?',
      });
      const doesNotExpireCheckbox = getInputByRole('checkbox', { name: 'This training does not expire' });

      userEvent.type(validityPeriodInMonth, '12');
      fixture.detectChanges();

      expect(doesNotExpireCheckbox.checked).toBeFalse();
    });

    it('should clear any value in validityPeriodInMonth when doesNotExpire checkbox is ticked', async () => {
      const { getInputByRole, getByTestId, fixture } = await setup({ trainingRecord: null });

      const validityPeriodInMonth = getInputByRole('textbox', {
        name: 'How many months is the training valid for before it expires?',
      });
      const doesNotExpireCheckbox = getInputByRole('checkbox', { name: 'This training does not expire' });

      fireEvent.click(getByTestId('plus-button-validity-period'));
      fixture.detectChanges();
      expect(validityPeriodInMonth.value).toEqual('1');

      fireEvent.click(doesNotExpireCheckbox);
      fixture.detectChanges();

      expect(validityPeriodInMonth.value).toEqual('');
    });

    describe('expiry date input box', () => {
      const trainingRecordThatDoesNotExpire = {
        ...defaultMockTrainingRecord,
        doesNotExpire: true,
        validityPeriodInMonth: undefined,
        expires: undefined,
      };

      it('should not render the expires date inputs when adding a new training record', async () => {
        const { queryByTestId } = await setup({ trainingRecordId: null });
        expect(queryByTestId('expiresDate')).toBeFalsy();
      });

      describe('when editing a record', () => {
        it('should render the expires date inputs when doesNotExpire is false', async () => {
          const { queryByTestId } = await setup({
            trainingRecord: { ...defaultMockTrainingRecord, doesNotExpire: false },
          });
          expect(queryByTestId('expiresDate')).toBeTruthy();
        });

        it('should render the expires date inputs when doesNotExpire is empty', async () => {
          const { queryByTestId } = await setup({
            trainingRecord: {
              ...defaultMockTrainingRecord,
              doesNotExpire: undefined,
              expires: undefined,
            },
          });
          expect(queryByTestId('expiresDate')).toBeTruthy();
        });

        it('should not render the expires date inputs when doesNotExpire is true and expires date is empty', async () => {
          const { queryByTestId } = await setup({
            trainingRecord: trainingRecordThatDoesNotExpire,
          });
          expect(queryByTestId('expiresDate')).toBeFalsy();
        });

        it('should render the expires date and untick doesNotExpire, if expires date is not empty but doesNotExpire is also true', async () => {
          const { queryByTestId, getByLabelText } = await setup({
            trainingRecord: { ...defaultMockTrainingRecord, doesNotExpire: true, expires: '2025-12-03' },
          });

          const expiryDate = queryByTestId('expiresDate');
          expect(expiryDate).toBeTruthy();

          expect((within(expiryDate).getByLabelText('Day') as HTMLInputElement).value).toEqual('3');
          expect((within(expiryDate).getByLabelText('Month') as HTMLInputElement).value).toEqual('12');
          expect((within(expiryDate).getByLabelText('Year') as HTMLInputElement).value).toEqual('2025');

          const doesNotExpire = getByLabelText('This training does not expire') as HTMLInputElement;
          expect(doesNotExpire.checked).toBeFalse();
        });
      });

      it('should show and hide the expiry date input boxes when user changed doesNotExpire', async () => {
        const { queryByTestId, getByLabelText, fixture } = await setup({
          trainingRecord: trainingRecordThatDoesNotExpire,
        });

        const doesNotExpire = getByLabelText('This training does not expire') as HTMLInputElement;

        expect(doesNotExpire.checked).toBeTrue();
        expect(queryByTestId('expiresDate')).toBeFalsy();

        userEvent.click(doesNotExpire);
        fixture.detectChanges();

        expect(doesNotExpire.checked).toBeFalse();
        expect(queryByTestId('expiresDate')).toBeTruthy();

        userEvent.click(doesNotExpire);
        fixture.detectChanges();

        expect(doesNotExpire.checked).toBeTrue();
        expect(queryByTestId('expiresDate')).toBeFalsy();
      });

      it('should show the expiry date when user fill in the validityMonthInPeriod', async () => {
        const { queryByTestId, getInputByRole } = await setup({
          trainingRecord: trainingRecordThatDoesNotExpire,
        });
        expect(queryByTestId('expiresDate')).toBeFalsy();

        const validityPeriodInMonth = getInputByRole('textbox', {
          name: /How many months/,
        });

        userEvent.type(validityPeriodInMonth, '24');
        expect(queryByTestId('expiresDate')).toBeTruthy();
      });

      it('should clear the expiry date value when user ticked doesNotExpire', async () => {
        const mockTrainingRecord = { ...defaultMockTrainingRecord, doesNotExpire: false, expires: '2025-12-03' };
        const { getByLabelText, getByTestId } = await setup({
          trainingRecord: mockTrainingRecord,
        });

        let expiryDate = getByTestId('expiresDate');

        expect((within(expiryDate).getByLabelText('Day') as HTMLInputElement).value).toEqual('3');
        expect((within(expiryDate).getByLabelText('Month') as HTMLInputElement).value).toEqual('12');
        expect((within(expiryDate).getByLabelText('Year') as HTMLInputElement).value).toEqual('2025');

        const checkbox = getByLabelText('This training does not expire') as HTMLInputElement;
        userEvent.click(checkbox);
        userEvent.click(checkbox);

        expiryDate = getByTestId('expiresDate');
        expect((within(expiryDate).getByLabelText('Day') as HTMLInputElement).value).toEqual('');
        expect((within(expiryDate).getByLabelText('Month') as HTMLInputElement).value).toEqual('');
        expect((within(expiryDate).getByLabelText('Year') as HTMLInputElement).value).toEqual('');
      });

      it('should update expiry date soft warning message when filling the form', async () => {
        const { getInputByRole, getByTestId, fixture, getByText } = await setup();

        const validityPeriodInMonth = getInputByRole('textbox', {
          name: 'How many months is the training valid for before it expires?',
        });

        userEvent.clear(validityPeriodInMonth);
        userEvent.type(validityPeriodInMonth, '24');

        const completedDate = getByTestId('completedDate');
        fillInDate(completedDate, '2020', '4', '10');

        const expiryDate = getByTestId('expiresDate');
        fillInDate(expiryDate, '2023', '4', '10');

        fixture.detectChanges();

        expect(getByText('This training is usually valid for 24 months')).toBeTruthy();
      });

      it('should clear the expiry date soft warning if expire date matches validity period', async () => {
        const { getInputByRole, getByTestId, fixture, queryByText } = await setup();

        const validityPeriodInMonth = getInputByRole('textbox', {
          name: 'How many months is the training valid for before it expires?',
        });

        userEvent.clear(validityPeriodInMonth);
        userEvent.type(validityPeriodInMonth, '24');

        const completedDate = getByTestId('completedDate');
        fillInDate(completedDate, '2020', '4', '10');

        const expiryDate = getByTestId('expiresDate');
        fillInDate(expiryDate, '2023', '4', '09');

        fixture.detectChanges();

        expect(queryByText('This training is usually valid for 24 months')).toBeTruthy();

        userEvent.type(within(expiryDate).getByLabelText('Year'), '2021');
        fixture.detectChanges();

        expect(queryByText('This training is usually valid for 24 months')).toBeFalsy();
      });
    });
  });

  describe('Notes section', () => {
    it('should have the notes section closed on page load', async () => {
      const { getByText, getByTestId } = await setup();

      const notesSection = getByTestId('notesSection');

      expect(getByText('Open notes')).toBeTruthy();
      expect(notesSection.getAttribute('class')).toContain('govuk-visually-hidden');
    });

    it('should display the notes section after clicking Open notes', async () => {
      const { fixture, getByText, getByTestId } = await setup();
      const openNotesButton = getByText('Open notes');
      fireEvent.click(openNotesButton);

      fixture.detectChanges();

      const notesSection = getByTestId('notesSection');

      expect(getByText('Close notes')).toBeTruthy();
      expect(notesSection.getAttribute('class')).not.toContain('govuk-visually-hidden');
    });
  });

  describe('fillForm', () => {
    it('should prefill the form if there is a training record id and there is a training record', async () => {
      const { component } = await setup();

      const { form } = component;
      const expectedFormValue = {
        title: 'Communication Training 1',
        accredited: 'Yes',
        deliveredBy: 'External provider',
        externalProviderName: 'Care skills academy',
        howWasItDelivered: 'E-learning',
        doesNotExpire: false,
        validityPeriodInMonth: 24,
        completed: { day: 2, month: 1, year: 2020 },
        expires: { day: 2, month: 1, year: 2021 },
        notes: undefined,
      };

      expect(form.value).toEqual(expectedFormValue);
    });

    it('should open the notes section if there are some notes in record', async () => {
      const mockTrainingWithNotes = {
        trainingCategory: { id: 1, category: 'Communication' },
        notes: 'some notes about this training',
      };
      const { getByTestId, getByText } = await setup({ trainingRecord: mockTrainingWithNotes });

      const notesSection = getByTestId('notesSection');

      expect(getByText('Close notes')).toBeTruthy();
      expect(notesSection.getAttribute('class')).not.toContain('govuk-visually-hidden');
      const notesTextArea = within(notesSection).getByRole('textbox', { name: 'Add a note' }) as HTMLTextAreaElement;
      expect(notesTextArea.value).toEqual('some notes about this training');
    });

    it('should display the remaining character count correctly if there are some notes in record', async () => {
      const mockTrainingWithNotes = {
        trainingCategory: { id: 1, category: 'Communication' },
        notes: 'some notes about this training',
      };
      const { component, getByText } = await setup({ trainingRecord: mockTrainingWithNotes });

      const expectedRemainingCharCounts = component.notesMaxLength - 'some notes about this training'.length;
      expect(getByText(`You have ${expectedRemainingCharCounts} characters remaining`)).toBeTruthy;
    });

    it('should not prefill the form if there is a training record id but there is no training record', async () => {
      const { component } = await setup({ trainingRecord: null });

      const { form } = component;

      const expectedFormValue = {
        title: null,
        accredited: null,
        deliveredBy: null,
        externalProviderName: null,
        howWasItDelivered: null,
        doesNotExpire: null,
        validityPeriodInMonth: null,
        completed: { day: null, month: null, year: null },
        expires: { day: null, month: null, year: null },
        notes: null,
      };
      expect(form.value).toEqual(expectedFormValue);
    });

    it('should show a soft warning message when expiry date is not matching with validity period', async () => {
      const mockTrainingRecord = {
        ...trainingRecord,
        completed: '2021-01-01',
        expires: '2022-05-01',
        validityPeriodInMonth: 12,
        doesNotExpire: false,
      };

      const { getByText, fixture } = await setup({ trainingRecord: mockTrainingRecord });

      await fixture.whenStable();

      expect(getByText('This training is usually valid for 12 months')).toBeTruthy();
    });
  });

  describe('buttons', () => {
    it('should render the Delete button when editing training', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('deleteButton')).toBeTruthy();
    });

    it('should render the Save and return and Cancel buttons when editing training', async () => {
      const { getByText } = await setup();

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    describe('when there is no training id', async () => {
      it('should render the Save record and Cancel buttons', async () => {
        const { getByText } = await setup({ trainingRecordId: null });
        expect(getByText('Save record')).toBeTruthy();
        expect(getByText('Cancel')).toBeTruthy();
      });

      it('should not render the Delete button', async () => {
        const { queryByTestId } = await setup({ trainingRecordId: null });
        expect(queryByTestId('deleteButton')).toBeFalsy();
      });
    });
  });

  describe('Delete button', () => {
    it('should navigate to delete confirmation page with training category', async () => {
      const { component, routerSpy, getByTestId, fixture } = await setup();
      const deleteTrainingRecord = getByTestId('deleteButton');
      component.trainingCategory = { id: 2, category: 'First aid' };
      fixture.detectChanges();

      fireEvent.click(deleteTrainingRecord);
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'training-and-qualifications-record',
        component.worker.uid,
        'training',
        component.trainingRecordId,
        { trainingCategory: JSON.stringify(component.trainingCategory) },
        'delete',
      ]);
    });

    it('should navigate to delete confirmation page without training category', async () => {
      const { component, routerSpy, getByTestId } = await setup();
      const deleteTrainingRecord = getByTestId('deleteButton');
      fireEvent.click(deleteTrainingRecord);
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'training-and-qualifications-record',
        component.worker.uid,
        'training',
        component.trainingRecordId,
        { trainingCategory: JSON.stringify(component.trainingCategory) },
        'delete',
      ]);
    });
  });

  describe('add training course details box', () => {
    const trainingCourses = [
      {
        id: 2,
        uid: 'uid-1',
        trainingCategoryId: 10,
        category: { category: 'Communication', id: 10 },
        name: 'Communication',
        trainingCategoryName: 'Communication',
        accredited: YesNoDontKnow.No,
        deliveredBy: DeliveredBy.ExternalProvider,
        externalProviderName: 'Care skills academy',
        howWasItDelivered: HowWasItDelivered.ELearning,
        doesNotExpire: false,
        validityPeriodInMonth: 12,
      },
    ] as TrainingCourse[];

    const overrides = {
      trainingRecordId: 2,
      trainingRecord: {
        ...trainingRecord,
        trainingCategory: { id: 10, category: 'Communication' },
        isMatchedToTrainingCourse: false,
      },
      trainingCourses: trainingCourses,
    };

    it('should render when editing training', async () => {
      const { getByTestId } = await setup(overrides);

      const includeTrainingCourseTextContents = [
        'Why is it a good idea to update records with training course details?',
        "It's a good idea because your training records will then be consistent with each other, sharing the same details, like course name and validity. We match records to courses by category and when you update them they'll:",
        'take the name of the training course',
        'say whether the training is accredited',
        'say how the training was delivered and who delivered it',
        'show how long the training is valid for',
        'still generate alerts when the training is due to expire',
        'keep any certificates and notes that were added',
      ];

      const includeTrainingCourseTestId = getByTestId('includeTrainingCourse');

      includeTrainingCourseTextContents.forEach((text) => {
        expect(includeTrainingCourseTestId.textContent).toContain(text);
      });
    });

    it('should navigate to the include training details path', async () => {
      const { component, fixture, getByTestId, routerSpy } = await setup(overrides);

      const includeTrainingCourseTestId = getByTestId('includeTrainingCourse');
      const button = within(includeTrainingCourseTestId).getByRole('button', { name: 'Select a training course' });

      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'training-and-qualifications-record',
        component.worker.uid,
        'training',
        component.trainingRecordId,
        'include-training-course-details',
      ]);
    });

    it('should not show if there is no training record id', async () => {
      const updatedOverrides = {
        ...overrides,
        trainingRecordId: null,
      };
      const { queryByTestId } = await setup(updatedOverrides);

      expect(queryByTestId('includeTrainingCourse')).toBeFalsy();
    });

    it('should not show if there are no training courses that have the same category id', async () => {
      const updatedOverrides = { trainingRecord: { ...trainingRecord, category: { id: 11 } } };
      const { queryByTestId } = await setup(updatedOverrides);

      expect(queryByTestId('includeTrainingCourse')).toBeFalsy();
    });

    it('should not show if the training record is already matched to a training course', async () => {
      const updatedOverrides = {
        ...overrides,
        trainingRecord: {
          ...trainingRecord,
          isMatchedToTrainingCourse: true,
        },
      };
      const { queryByTestId } = await setup(updatedOverrides);

      expect(queryByTestId('includeTrainingCourse')).toBeFalsy();
    });
  });

  describe('Cancel button', () => {
    it('should call navigate when pressing cancel', async () => {
      const { component, fixture, getByText, routerSpy } = await setup();
      component.previousUrl = ['/dashboard?view=categories#training-and-qualifications'];
      const cancelButton = getByText('Cancel');
      fireEvent.click(cancelButton);
      fixture.detectChanges();
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard?view=categories#training-and-qualifications']);
    });
  });

  describe('Upload file button', () => {
    it('should render a file input element', async () => {
      const { getByTestId } = await setup({ trainingRecordId: null });

      const uploadSection = getByTestId('uploadCertificate');
      expect(uploadSection).toBeTruthy();

      const fileInput = within(uploadSection).getByTestId('fileInput');
      expect(fileInput).toBeTruthy();
    });

    it('should render "No file chosen" beside the file input', async () => {
      const { getByTestId } = await setup({ trainingRecordId: null });

      const uploadSection = getByTestId('uploadCertificate');

      const text = within(uploadSection).getByText('No file chosen');
      expect(text).toBeTruthy();
    });

    it('should not render "No file chosen" when a file is chosen', async () => {
      const { fixture, getByTestId } = await setup({ trainingRecordId: null });
      const uploadSection = getByTestId('uploadCertificate');
      const fileInput = getByTestId('fileInput');
      userEvent.upload(fileInput, new File(['some file content'], 'cert.pdf'));
      fixture.detectChanges();
      const text = within(uploadSection).queryByText('No file chosen');
      expect(text).toBeFalsy();
    });

    it('should provide aria description to screen reader users', async () => {
      const { fixture, getByTestId } = await setup({ trainingRecordId: null });
      fixture.autoDetectChanges();

      const uploadSection = getByTestId('uploadCertificate');
      const fileInput = getByTestId('fileInput');

      let uploadButton = within(uploadSection).getByRole('button', {
        description: /The certificate must be a PDF file that's no larger than 5MB/,
      });
      expect(uploadButton).toBeTruthy();

      userEvent.upload(fileInput, new File(['some file content'], 'cert.pdf'));

      uploadButton = within(uploadSection).getByRole('button', {
        description: '1 file chosen',
      });
      expect(uploadButton).toBeTruthy();
    });
  });

  describe('submitting form', () => {
    it('should call the updateTrainingRecord function if editing existing training, and navigate away from page', async () => {
      const { component, fixture, getByText, getByLabelText, updateSpy, routerSpy, alertServiceSpy } = await setup();

      component.previousUrl = ['/goToPreviousUrl'];
      const openNotesButton = getByText('Open notes');
      fireEvent.click(openNotesButton);
      fixture.detectChanges();

      userEvent.type(getByLabelText('Add a note'), 'Some notes added to this training');
      fireEvent.click(getByText('Save and return'));
      fixture.detectChanges();

      const expectedFormValue = {
        title: 'Communication Training 1',
        accredited: 'Yes',
        deliveredBy: 'External provider',
        externalProviderName: 'Care skills academy',
        howWasItDelivered: 'E-learning',
        doesNotExpire: false,
        validityPeriodInMonth: 24,
        completed: { day: 2, month: 1, year: 2020 },
        expires: { day: 2, month: 1, year: 2021 },
        notes: 'Some notes added to this training',
      };

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual(expectedFormValue);
      expect(updateSpy).toHaveBeenCalledWith(
        component.workplace.uid,
        component.worker.uid,
        component.trainingRecordId,
        {
          trainingCategory: { id: 1 },
          title: 'Communication Training 1',
          accredited: 'Yes',
          deliveredBy: 'External provider',
          howWasItDelivered: 'E-learning',
          doesNotExpire: false,
          validityPeriodInMonth: 24,
          completed: '2020-01-02',
          expires: '2021-01-02',
          notes: 'Some notes added to this training',
          trainingProviderId: 63,
          otherTrainingProviderName: 'Care skills academy',
          externalProviderName: null,
        },
      );

      expect(routerSpy).toHaveBeenCalledWith(['/goToPreviousUrl']);

      await fixture.whenStable();
      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Training record updated',
      });
    });

    it('should call the createTrainingRecord function if adding a new training record, and navigate away from page', async () => {
      const { component, fixture, getByText, getByTestId, getByLabelText, createSpy, routerSpy, alertServiceSpy } =
        await setup({ trainingRecordId: null });

      component.previousUrl = ['/goToPreviousUrl'];
      const openNotesButton = getByText('Open notes');
      fireEvent.click(openNotesButton);
      fixture.detectChanges();

      component.trainingCategory = {
        id: component.categories[0].id,
        category: component.categories[0].category,
      };

      userEvent.type(getByLabelText('Training record name'), 'Some training');
      userEvent.click(getByLabelText('Yes'));
      userEvent.click(getByLabelText('External provider'));
      userEvent.type(getByLabelText('Provider name'), 'Care skills academy');
      userEvent.type(getByLabelText('How many months is the training valid for before it expires?'), '');
      userEvent.type(getByLabelText('This training does not expire'), 'true');
      userEvent.click(getByLabelText('E-learning'));

      const completedDate = getByTestId('completedDate');
      fillInDate(completedDate, '2020', '4', '10');

      userEvent.type(getByLabelText('Add a note'), 'Some notes for this training');

      fireEvent.click(getByText('Save record'));
      fixture.detectChanges();

      const expectedFormValue = {
        title: 'Some training',
        accredited: 'Yes',
        deliveredBy: 'External provider',
        externalProviderName: 'Care skills academy',
        howWasItDelivered: 'E-learning',
        validityPeriodInMonth: null,
        doesNotExpire: true,
        completed: { day: 10, month: 4, year: 2020 },
        expires: { day: null, month: null, year: null },
        notes: 'Some notes for this training',
      };

      const formData = component.form.value;
      expect(formData).toEqual(expectedFormValue);
      expect(createSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        trainingCategory: { id: 1 },
        title: 'Some training',
        accredited: 'Yes',
        deliveredBy: 'External provider',
        howWasItDelivered: 'E-learning',
        validityPeriodInMonth: null,
        doesNotExpire: true,
        completed: '2020-04-10',
        expires: null,
        notes: 'Some notes for this training',
        trainingProviderId: 63,
        otherTrainingProviderName: 'Care skills academy',
        externalProviderName: null,
      });

      expect(routerSpy).toHaveBeenCalledWith(['/goToPreviousUrl']);

      await fixture.whenStable();
      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Training record added',
      });
    });

    it('should auto fill in the expiry date if validity period and completed date are given', async () => {
      const selectedTraining = { trainingCategory: { category: 'Autism', id: 2 } };
      const { component, getByText, getByTestId, getByLabelText, createSpy } = await setup({
        trainingRecordId: null,
        selectedTraining,
      });

      userEvent.type(getByLabelText('How many months is the training valid for before it expires?'), '12');

      const completedDate = getByTestId('completedDate');
      fillInDate(completedDate, '2020', '4', '10');

      userEvent.click(getByText('Save record'));

      expect(createSpy).toHaveBeenCalledWith(
        component.workplace.uid,
        component.worker.uid,
        jasmine.objectContaining({
          trainingCategory: { id: 2 },
          validityPeriodInMonth: 12,
          doesNotExpire: null,
          completed: '2020-04-10',
          expires: '2021-04-09',
        }),
      );
    });

    it('should not change the expiry date if user has already input one', async () => {
      const { component, getByText, updateSpy, getByLabelText, getByTestId } = await setup();

      userEvent.clear(getByLabelText(/How many months/));
      userEvent.type(getByLabelText(/How many months/), '12');

      const completedDate = getByTestId('completedDate');
      fillInDate(completedDate, '2020', '4', '10');

      const expiryDate = getByTestId('expiresDate');
      fillInDate(expiryDate, '2023', '12', '31');

      userEvent.click(getByText('Save and return'));

      expect(updateSpy).toHaveBeenCalledWith(
        component.workplace.uid,
        component.worker.uid,
        component.trainingRecordId,
        jasmine.objectContaining({
          validityPeriodInMonth: 12,
          doesNotExpire: null,
          completed: '2020-04-10',
          expires: '2023-12-31',
        }),
      );
    });

    it('should reset the training category selected for training record in the service on submit', async () => {
      const { component, fixture, getByText, getByLabelText, trainingService, routerSpy } = await setup({
        trainingRecordId: null,
        selectedTraining: {
          trainingCategory: {
            id: 2,
            seq: 20,
            category: 'Autism',
            trainingCategoryGroup: 'Specific conditions and disabilities',
          },
        },
      });

      fixture.detectChanges();

      component.previousUrl = ['/goToPreviousUrl'];

      userEvent.type(getByLabelText('Training record name'), 'Some training');
      userEvent.click(getByLabelText('No'));

      const trainingServiceSpy = spyOn(trainingService, 'clearSelectedTrainingCategory').and.callThrough();
      const trainingServiceIsTrainingCourseSelectedSpy = spyOn(
        trainingService,
        'clearIsTrainingCourseSelected',
      ).and.callThrough();
      fireEvent.click(getByText('Save record'));

      expect(routerSpy).toHaveBeenCalledWith(['/goToPreviousUrl']);
      expect(trainingServiceSpy).toHaveBeenCalled();
      expect(trainingServiceIsTrainingCourseSelectedSpy).toHaveBeenCalled();

      expect(trainingService.selectedTraining.trainingCategory).toBeNull();
    });

    it('should disable the submit button to prevent it being triggered more than once', async () => {
      const { fixture, getByText, getByLabelText } = await setup({
        trainingRecordId: null,
        selectedTraining: {
          trainingCategory: {
            id: 2,
            seq: 20,
            category: 'Autism',
            trainingCategoryGroup: 'Specific conditions and disabilities',
          },
        },
      });

      userEvent.type(getByLabelText('Training record name'), 'Some training');
      userEvent.click(getByLabelText('No'));

      const submitButton = getByText('Save record') as HTMLButtonElement;
      userEvent.click(submitButton);
      fixture.detectChanges();

      expect(submitButton.disabled).toBe(true);
    });

    describe('upload certificate of an existing training', () => {
      const mockUploadFile = new File(['some file content'], 'First aid 2022.pdf', { type: 'application/pdf' });

      it('should call both `addCertificates` and `updateTrainingRecord` if an upload file is selected', async () => {
        const { component, fixture, getByText, getByLabelText, getByTestId, updateSpy, routerSpy, certificateService } =
          await setup();

        component.previousUrl = ['/goToPreviousUrl'];
        const openNotesButton = getByText('Open notes');
        fireEvent.click(openNotesButton);
        fixture.detectChanges();

        const addCertificatesSpy = spyOn(certificateService, 'addCertificates').and.returnValue(of(null));

        userEvent.type(getByLabelText('Add a note'), 'Some notes added to this training');
        userEvent.upload(getByTestId('fileInput'), mockUploadFile);
        fireEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        expect(updateSpy).toHaveBeenCalledWith(
          component.workplace.uid,
          component.worker.uid,
          component.trainingRecordId,
          {
            trainingCategory: { id: 1 },
            title: 'Communication Training 1',
            accredited: 'Yes',
            deliveredBy: 'External provider',
            howWasItDelivered: 'E-learning',
            validityPeriodInMonth: 24,
            doesNotExpire: false,
            completed: '2020-01-02',
            expires: '2021-01-02',
            notes: 'Some notes added to this training',
            trainingProviderId: 63,
            otherTrainingProviderName: 'Care skills academy',
            externalProviderName: null,
          },
        );

        expect(addCertificatesSpy).toHaveBeenCalledWith(
          component.workplace.uid,
          component.worker.uid,
          component.trainingRecordId,
          [mockUploadFile],
        );

        expect(routerSpy).toHaveBeenCalledWith(['/goToPreviousUrl']);
      });

      it('should not call addCertificates if no file was selected', async () => {
        const { component, fixture, getByText, getByLabelText, certificateService } = await setup();

        component.previousUrl = ['/goToPreviousUrl'];
        const openNotesButton = getByText('Open notes');
        fireEvent.click(openNotesButton);
        fixture.detectChanges();

        const addCertificatesSpy = spyOn(certificateService, 'addCertificates');

        userEvent.type(getByLabelText('Add a note'), 'Some notes added to this training');
        fireEvent.click(getByText('Save and return'));

        expect(addCertificatesSpy).not.toHaveBeenCalled();
      });
    });

    describe('add a new training record and upload certificate together', async () => {
      const mockUploadFile = new File(['some file content'], 'First aid 2022.pdf', { type: 'application/pdf' });

      it('should call both `addCertificates` and `createTrainingRecord` if an upload file is selected', async () => {
        const { component, fixture, getByText, getByLabelText, getByTestId, createSpy, routerSpy, certificateService } =
          await setup({ trainingRecordId: null });

        component.previousUrl = ['/goToPreviousUrl'];
        component.trainingCategory = {
          category: 'Autism',
          id: 2,
        };

        fixture.detectChanges();

        const addCertificatesSpy = spyOn(certificateService, 'addCertificates').and.returnValue(of(null));

        userEvent.type(getByLabelText('Training record name'), 'Understanding Autism');
        userEvent.click(getByLabelText('Yes'));

        userEvent.upload(getByTestId('fileInput'), mockUploadFile);
        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(createSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
          trainingCategory: { id: 2 },
          title: 'Understanding Autism',
          accredited: 'Yes',
          deliveredBy: null,
          externalProviderName: null,
          howWasItDelivered: null,
          validityPeriodInMonth: null,
          doesNotExpire: null,
          completed: null,
          expires: null,
          notes: null,
          trainingProviderId: null,
          otherTrainingProviderName: null,
        });

        expect(addCertificatesSpy).toHaveBeenCalledWith(
          component.workplace.uid,
          component.worker.uid,
          trainingRecord.uid,
          [mockUploadFile],
        );

        expect(routerSpy).toHaveBeenCalledWith(['/goToPreviousUrl']);
      });

      it('should not call `addCertificates` when no upload file was selected', async () => {
        const { component, fixture, getByText, getByLabelText, createSpy, routerSpy, certificateService } = await setup(
          { trainingRecordId: null },
        );

        component.previousUrl = ['/goToPreviousUrl'];
        component.trainingCategory = {
          category: 'Autism',
          id: 2,
        };
        const openNotesButton = getByText('Open notes');
        fireEvent.click(openNotesButton);
        fixture.detectChanges();

        const addCertificatesSpy = spyOn(certificateService, 'addCertificates');

        userEvent.type(getByLabelText('Add a note'), 'Some notes added to this training');
        fireEvent.click(getByText('Save record'));

        expect(createSpy).toHaveBeenCalled;

        expect(addCertificatesSpy).not.toHaveBeenCalled;

        expect(routerSpy).toHaveBeenCalledWith(['/goToPreviousUrl']);
      });
    });
  });

  describe('errors', () => {
    describe('title errors', () => {
      it('should show an error message if the title is less than 3 characters long', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup({
          trainingRecordId: null,
        });

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        userEvent.type(getByLabelText('Training record name'), 'aa');

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(getAllByText('Training record name must be between 3 and 120 characters').length).toEqual(2);
      });

      it('should show an error message if the title is more than 120 characters long', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup({ trainingRecordId: null });

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        userEvent.type(
          getByLabelText('Training record name'),
          'long title long title long title long title long title long title long title long title long title long title long titles',
        );

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(getAllByText('Training record name must be between 3 and 120 characters').length).toEqual(2);
      });
    });

    describe('completed date errors', () => {
      it('should show an error message if the completed date is invalid', async () => {
        const { component, fixture, getByText, getAllByText, getByTestId } = await setup({ trainingRecordId: null });

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const completedDate = getByTestId('completedDate');
        fillInDate(completedDate, '2', '33', '44');

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(getAllByText('Date completed must be a valid date').length).toEqual(2);
      });

      it('should show an error message if the completed date is in the future', async () => {
        const { component, fixture, getByText, getAllByText, getByTestId } = await setup({ trainingRecordId: null });

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        const [year, month, day] = [
          `${futureDate.getFullYear()}`,
          `${futureDate.getMonth() + 1}`,
          `${futureDate.getDate()}`,
        ];

        const completedDate = getByTestId('completedDate');
        fillInDate(completedDate, year, month, day);

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(getAllByText('Date completed must be before today').length).toEqual(2);
      });

      it('should show an error message if the completed date is more than 100 years ago', async () => {
        const { component, fixture, getByText, getAllByText, getByTestId } = await setup({ trainingRecordId: null });

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const pastDate = new Date();
        pastDate.setFullYear(pastDate.getFullYear() - 101);
        const [year, month, day] = [`${pastDate.getFullYear()}`, `${pastDate.getMonth() + 1}`, `${pastDate.getDate()}`];

        const completedDate = getByTestId('completedDate');
        fillInDate(completedDate, year, month, day);

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(getAllByText('Date completed cannot be more than 100 years ago').length).toEqual(2);
      });
    });

    describe('expires date errors when there is a trainingRecordId', () => {
      it('should show an error message if the expiry date is invalid', async () => {
        const { component, fixture, getByText, getAllByText, getByTestId } = await setup();

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const expiresDate = getByTestId('expiresDate');
        fillInDate(expiresDate, '2', '33', '44');

        fireEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        expect(getAllByText('Expiry date must be a valid date').length).toEqual(2);
      });

      it('should show an error message if the expiry date is more than 100 years ago', async () => {
        const { component, fixture, getByText, getAllByText, getByTestId } = await setup({
          trainingRecordId: '1',
        });

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const pastDate = new Date();
        pastDate.setFullYear(pastDate.getFullYear() - 101);
        const [year, month, day] = [`${pastDate.getFullYear()}`, `${pastDate.getMonth() + 1}`, `${pastDate.getDate()}`];

        const expiresDate = getByTestId('expiresDate');

        fillInDate(expiresDate, year, month, day);

        fireEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        expect(getAllByText('Expiry date cannot be more than 100 years ago').length).toEqual(2);
      });

      it('should show the min date error message if expiry date is over a hundred years ago and the expiry date is before the completed date', async () => {
        const { component, fixture, getByText, getAllByText, getByTestId, queryByText } = await setup();

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const dateCompleted = new Date();

        const completedDate = getByTestId('completedDate');
        const expiresDate = getByTestId('expiresDate');

        fillInDate(
          completedDate,
          `${dateCompleted.getFullYear()}`,
          `${dateCompleted.getMonth() + 1}`,
          `${dateCompleted.getDate()}`,
        );

        const pastDate = new Date();
        pastDate.setFullYear(pastDate.getFullYear() - 101);
        fillInDate(expiresDate, `${pastDate.getFullYear()}`, `${pastDate.getMonth() + 1}`, `${pastDate.getDate()}`);

        fireEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        expect(getAllByText('Expiry date cannot be more than 100 years ago').length).toEqual(2);
        expect(queryByText('Expiry date must be after date completed')).toBeFalsy();
      });

      it('should an error message when the expiry date is before the completed date', async () => {
        const { component, fixture, getByText, getAllByText, getByTestId } = await setup();

        component.previousUrl = ['/goToPreviousUrl'];
        fixture.detectChanges();

        const dateCompleted = new Date();

        const completedDate = getByTestId('completedDate');
        const expiresDate = getByTestId('expiresDate');

        fillInDate(completedDate, `${dateCompleted.getFullYear()}`, `${dateCompleted.getMonth() + 1}`, `7`);
        fillInDate(expiresDate, `${dateCompleted.getFullYear()}`, `${dateCompleted.getMonth() + 1}`, `6`);

        fireEvent.click(getByText('Save and return'));
        fixture.detectChanges();

        expect(getAllByText('Expiry date must be after date completed').length).toEqual(2);
      });
    });

    describe('notes errors', () => {
      const veryLongString =
        'This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string.';

      it('should show an error message if the notes is over 1000 characters', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup({ trainingRecordId: null });

        component.previousUrl = ['/goToPreviousUrl'];
        const openNotesButton = getByText('Open notes');
        fireEvent.click(openNotesButton);
        fixture.detectChanges();

        userEvent.type(getByLabelText('Add a note'), veryLongString);

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        expect(getAllByText('Notes must be 1000 characters or fewer').length).toEqual(2);
      });

      it('should open the notes section if the notes input is over 1000 characters and section is closed on submit', async () => {
        const { fixture, getByText, getByLabelText, getByTestId } = await setup({ trainingRecordId: null });

        const openNotesButton = getByText('Open notes');
        fireEvent.click(openNotesButton);
        fixture.detectChanges();

        userEvent.type(getByLabelText('Add a note'), veryLongString);

        const closeNotesButton = getByText('Close notes');
        fireEvent.click(closeNotesButton);
        fixture.detectChanges();

        fireEvent.click(getByText('Save record'));
        fixture.detectChanges();

        const notesSection = getByTestId('notesSection');

        expect(getByText('Close notes')).toBeTruthy();
        expect(notesSection.getAttribute('class')).not.toContain('govuk-visually-hidden');
      });
    });

    describe('uploadCertificate errors', () => {
      it('should show an error message if the selected file is over 5MB', async () => {
        const { fixture, getByTestId, getByText } = await setup({ trainingRecordId: null });

        const mockUploadFile = new File(['some file content'], 'large-file.pdf', { type: 'application/pdf' });

        Object.defineProperty(mockUploadFile, 'size', {
          value: 10 * 1024 * 1024, // 10MB
        });

        const fileInputButton = getByTestId('fileInput');

        userEvent.upload(fileInputButton, mockUploadFile);

        fixture.detectChanges();

        expect(getByText('The certificate must be no larger than 5MB')).toBeTruthy();
      });

      it('should show an error message if the selected file is not a pdf file', async () => {
        const { fixture, getByTestId, getByText } = await setup({ trainingRecordId: null });

        const mockUploadFile = new File(['some file content'], 'non-pdf.png', { type: 'image/png' });

        const fileInputButton = getByTestId('fileInput');

        userEvent.upload(fileInputButton, [mockUploadFile]);

        fixture.detectChanges();

        expect(getByText('The certificate must be a PDF file')).toBeTruthy();
      });

      it('should clear the error message when user select a valid file instead', async () => {
        const { fixture, getByTestId, getByText, queryByText } = await setup({ trainingRecordId: null });
        fixture.autoDetectChanges();

        const invalidFile = new File(['some file content'], 'non-pdf.png', { type: 'image/png' });
        const validFile = new File(['some file content'], 'certificate.pdf', { type: 'application/pdf' });

        const fileInputButton = getByTestId('fileInput');
        userEvent.upload(fileInputButton, [invalidFile]);
        expect(getByText('The certificate must be a PDF file')).toBeTruthy();

        userEvent.upload(fileInputButton, [validFile]);
        expect(queryByText('The certificate must be a PDF file')).toBeFalsy();
      });

      it('should provide aria description to screen reader users when error happen', async () => {
        const { fixture, getByTestId } = await setup({ trainingRecordId: null });
        fixture.autoDetectChanges();

        const uploadSection = getByTestId('uploadCertificate');
        const fileInput = getByTestId('fileInput');

        userEvent.upload(fileInput, new File(['some file content'], 'non-pdf-file.csv'));

        const uploadButton = within(uploadSection).getByRole('button', {
          description: /Error: The certificate must be a PDF file/,
        });
        expect(uploadButton).toBeTruthy();
      });

      it('should clear any error message when remove button of an upload file is clicked', async () => {
        const { fixture, getByTestId, getByText, queryByText } = await setup({ trainingRecordId: null });
        fixture.autoDetectChanges();

        const mockUploadFileValid = new File(['some file content'], 'cerfificate.pdf', { type: 'application/pdf' });
        const mockUploadFileInvalid = new File(['some file content'], 'non-pdf.png', { type: 'image/png' });
        userEvent.upload(getByTestId('fileInput'), [mockUploadFileValid]);
        userEvent.upload(getByTestId('fileInput'), [mockUploadFileInvalid]);

        expect(getByText('The certificate must be a PDF file')).toBeTruthy();

        const removeButton = within(getByText('cerfificate.pdf').parentElement).getByText('Remove');
        userEvent.click(removeButton);

        expect(queryByText('The certificate must be a PDF file')).toBeFalsy();
      });
    });

    describe('validityPeriodInMonth', () => {
      const invalidValuesForTesting = ['-10', '0', '99999', 'apple', '   '];

      invalidValuesForTesting.forEach((invalidValue) => {
        it(`should show an error message if validityPeriodInMonth got an invalid value - ${invalidValue}`, async () => {
          const { getByRole, fixture, getByText, getByLabelText, getAllByText } = await setup();
          const expectedErrorMsg = 'Number of months must be between 1 and 999';

          const inputBox = getByLabelText(/^How many months/);
          userEvent.clear(inputBox);
          userEvent.type(inputBox, invalidValue);
          userEvent.click(getByRole('button', { name: 'Save and return' }));
          fixture.detectChanges();

          expect(getByText('There is a problem')).toBeTruthy();
          expect(getAllByText(expectedErrorMsg)).toHaveSize(2);
        });
      });
    });
  });

  it('should redirect to the add training select category page on page refresh', async () => {
    const { component, routerSpy } = await setup({ trainingRecordId: null, selectedTraining: null });

    component.ngOnInit();

    expect(routerSpy).toHaveBeenCalledWith([
      `workplace/${component.establishmentUid}/training-and-qualifications-record/${component.workerId}/add-training-without-course`,
    ]);
  });

  describe('training certifications', () => {
    it('should show when there are training certifications', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.trainingCertificates = [
        {
          uid: '396ae33f-a99b-4035-9f29-718529a54244',
          filename: 'first_aid.pdf',
          uploadDate: '2024-04-12T14:44:29.151Z',
        },
      ];

      fixture.detectChanges();

      expect(getByTestId('trainingCertificatesTable')).toBeTruthy();
    });

    it('should not show when there are no training certifications', async () => {
      const { component, fixture, queryByTestId } = await setup();

      component.trainingCertificates = [];

      fixture.detectChanges();

      expect(queryByTestId('trainingCertificatesTable')).toBeFalsy();
    });

    describe('Download buttons', () => {
      const mockTrainingCertificate = {
        uid: '396ae33f-a99b-4035-9f29-718529a54244',
        filename: 'first_aid.pdf',
        uploadDate: '2024-04-12T14:44:29.151Z',
      };

      const mockTrainingCertificate2 = {
        uid: '315ae33f-a99b-1235-9f29-718529a15044',
        filename: 'first_aid_advanced.pdf',
        uploadDate: '2024-04-13T16:44:21.121Z',
      };

      it('should show Download button when there is an existing training certificate', async () => {
        const { component, fixture, getByTestId } = await setup();

        component.trainingCertificates = [mockTrainingCertificate];

        fixture.detectChanges();

        const certificatesTable = getByTestId('trainingCertificatesTable');
        const downloadButton = within(certificatesTable).getByText('Download');

        expect(downloadButton).toBeTruthy();
      });

      it('should make call to downloadCertificates with required uids and file uid in array when Download button clicked', async () => {
        const { component, fixture, getByTestId, certificateService } = await setup();

        const downloadCertificatesSpy = spyOn(certificateService, 'downloadCertificates').and.returnValue(
          of({ files: ['abc123'] }),
        );
        component.trainingCertificates = [mockTrainingCertificate];
        fixture.detectChanges();

        const certificatesTable = getByTestId('trainingCertificatesTable');
        const firstCertDownloadButton = within(certificatesTable).getAllByText('Download')[0];
        fireEvent.click(firstCertDownloadButton);

        expect(downloadCertificatesSpy).toHaveBeenCalledWith(
          component.workplace.uid,
          component.worker.uid,
          component.trainingRecordId,
          [{ uid: mockTrainingCertificate.uid, filename: mockTrainingCertificate.filename }],
        );
      });

      it('should make call to downloadCertificates with all certificate file uids in array when Download all button clicked', async () => {
        const { component, fixture, getByTestId, certificateService } = await setup();

        const downloadCertificatesSpy = spyOn(certificateService, 'downloadCertificates').and.returnValue(
          of({ files: ['abc123'] }),
        );
        component.trainingCertificates = [mockTrainingCertificate, mockTrainingCertificate2];
        fixture.detectChanges();

        const certificatesTable = getByTestId('trainingCertificatesTable');
        const downloadButton = within(certificatesTable).getByText('Download all');
        fireEvent.click(downloadButton);

        expect(downloadCertificatesSpy).toHaveBeenCalledWith(
          component.workplace.uid,
          component.worker.uid,
          component.trainingRecordId,
          [
            { uid: mockTrainingCertificate.uid, filename: mockTrainingCertificate.filename },
            { uid: mockTrainingCertificate2.uid, filename: mockTrainingCertificate2.filename },
          ],
        );
      });

      it('should display error message when Download fails', async () => {
        const { component, fixture, getByText, getByTestId, certificateService } = await setup();

        spyOn(certificateService, 'downloadCertificates').and.returnValue(throwError('403 forbidden'));
        component.trainingCertificates = [mockTrainingCertificate, mockTrainingCertificate2];

        fixture.detectChanges();

        const certificatesTable = getByTestId('trainingCertificatesTable');
        const downloadButton = within(certificatesTable).getAllByText('Download')[1];
        fireEvent.click(downloadButton);
        fixture.detectChanges();

        const expectedErrorMessage = getByText(
          "There's a problem with this download. Try again later or contact us for help.",
        );
        expect(expectedErrorMessage).toBeTruthy();
      });

      it('should display error message when Download all fails', async () => {
        const { component, fixture, getByText, getByTestId, certificateService } = await setup();

        spyOn(certificateService, 'downloadCertificates').and.returnValue(throwError('some download error'));
        component.trainingCertificates = [mockTrainingCertificate, mockTrainingCertificate2];

        fixture.detectChanges();

        const certificatesTable = getByTestId('trainingCertificatesTable');
        const downloadAllButton = within(certificatesTable).getByText('Download all');
        fireEvent.click(downloadAllButton);
        fixture.detectChanges();

        const expectedErrorMessage = getByText(
          "There's a problem with this download. Try again later or contact us for help.",
        );
        expect(expectedErrorMessage).toBeTruthy();
      });
    });

    describe('files to be uploaded', () => {
      const mockUploadFile1 = new File(['some file content'], 'First aid 2022.pdf', { type: 'application/pdf' });
      const mockUploadFile2 = new File(['some file content'], 'First aid 2024.pdf', { type: 'application/pdf' });

      it('should add a new upload file to the certification table when a file is selected', async () => {
        const { component, fixture, getByTestId } = await setup();
        fixture.autoDetectChanges();

        userEvent.upload(getByTestId('fileInput'), mockUploadFile1);

        const certificationTable = getByTestId('trainingCertificatesTable');

        expect(certificationTable).toBeTruthy();
        expect(within(certificationTable).getByText(mockUploadFile1.name)).toBeTruthy();
        expect(component.filesToUpload).toEqual([mockUploadFile1]);
      });

      it('should remove an upload file when its remove button is clicked', async () => {
        const { component, fixture, getByTestId, getByText } = await setup();
        fixture.autoDetectChanges();

        userEvent.upload(getByTestId('fileInput'), mockUploadFile1);
        userEvent.upload(getByTestId('fileInput'), mockUploadFile2);

        const certificationTable = getByTestId('trainingCertificatesTable');
        expect(within(certificationTable).getByText(mockUploadFile1.name)).toBeTruthy();
        expect(within(certificationTable).getByText(mockUploadFile2.name)).toBeTruthy();

        const rowForFile2 = getByText(mockUploadFile2.name).parentElement;
        const removeButtonForFile2 = within(rowForFile2).getByText('Remove');

        userEvent.click(removeButtonForFile2);

        expect(within(certificationTable).queryByText(mockUploadFile2.name)).toBeFalsy();

        expect(within(certificationTable).queryByText(mockUploadFile1.name)).toBeTruthy();
        expect(component.filesToUpload).toHaveSize(1);
        expect(component.filesToUpload[0]).toEqual(mockUploadFile1);
      });
    });

    describe('saved files to be removed', () => {
      it('should remove a file from the table when the remove button is clicked', async () => {
        const { component, fixture, getByTestId } = await setup();

        component.trainingCertificates = [
          {
            uid: 'uid-1',
            filename: 'first_aid_v1.pdf',
            uploadDate: '2024-04-12T14:44:29.151Z',
          },
          {
            uid: 'uid-2',
            filename: 'first_aid_v2.pdf',
            uploadDate: '2024-04-12T14:44:29.151Z',
          },
          {
            uid: 'uid-3',
            filename: 'first_aid_v3.pdf',
            uploadDate: '2024-04-12T14:44:29.151Z',
          },
        ];

        fixture.detectChanges();

        const certificateRow2 = getByTestId('certificate-row-2');

        const removeButtonForRow2 = within(certificateRow2).getByText('Remove');

        fireEvent.click(removeButtonForRow2);

        fixture.detectChanges();

        expect(component.trainingCertificates.length).toBe(2);
      });

      it('should remove all file from the table when the remove button is clicked for all saved files', async () => {
        const { component, fixture, getByTestId } = await setup();

        component.trainingCertificates = [
          {
            uid: 'uid-1',
            filename: 'first_aid_v1.pdf',
            uploadDate: '2024-04-12T14:44:29.151Z',
          },
          {
            uid: 'uid-2',
            filename: 'first_aid_v2.pdf',
            uploadDate: '2024-04-12T14:44:29.151Z',
          },
          {
            uid: 'uid-3',
            filename: 'first_aid_v3.pdf',
            uploadDate: '2024-04-12T14:44:29.151Z',
          },
        ];

        fixture.detectChanges();

        const certificateRow0 = getByTestId('certificate-row-0');
        const certificateRow1 = getByTestId('certificate-row-1');
        const certificateRow2 = getByTestId('certificate-row-2');

        const removeButtonForRow0 = within(certificateRow0).getByText('Remove');
        const removeButtonForRow1 = within(certificateRow1).getByText('Remove');
        const removeButtonForRow2 = within(certificateRow2).getByText('Remove');

        fireEvent.click(removeButtonForRow0);
        fireEvent.click(removeButtonForRow1);
        fireEvent.click(removeButtonForRow2);

        fixture.detectChanges();
        expect(component.trainingCertificates.length).toBe(0);
      });

      it('should call the training service when save and return is clicked', async () => {
        const { component, fixture, getByTestId, getByText, certificateService } = await setup();

        component.trainingCertificates = [
          {
            uid: 'uid-1',
            filename: 'first_aid_v1.pdf',
            uploadDate: '2024-04-12T14:44:29.151Z',
          },
          {
            uid: 'uid-2',
            filename: 'first_aid_v2.pdf',
            uploadDate: '2024-04-12T14:44:29.151Z',
          },
        ];

        fixture.detectChanges();

        const certificateRow = getByTestId('certificate-row-0');

        const removeButtonForRow = within(certificateRow).getByText('Remove');
        const trainingServiceSpy = spyOn(certificateService, 'deleteCertificates').and.callThrough();
        fireEvent.click(removeButtonForRow);
        fireEvent.click(getByText('Save and return'));

        fixture.detectChanges();

        expect(trainingServiceSpy).toHaveBeenCalledWith(
          component.establishmentUid,
          component.workerId,
          component.trainingRecordId,
          component.filesToRemove,
        );
      });

      it('should not call the training service when save and return is clicked and there are no files to remove ', async () => {
        const { component, fixture, getByText, certificateService } = await setup();

        component.trainingCertificates = [];

        fixture.detectChanges();

        const trainingServiceSpy = spyOn(certificateService, 'deleteCertificates').and.callThrough();

        fireEvent.click(getByText('Save and return'));

        fixture.detectChanges();

        expect(trainingServiceSpy).not.toHaveBeenCalled();
      });
    });
  });
});
