import { getTestBed } from '@angular/core/testing';
import { fireEvent, render, within } from '@testing-library/angular';
import { ConfirmMultipleTrainingWithCourseComponent } from './confirm-multiple-training-with-course.component';
import { BackLinkService } from '@core/services/backLink.service';
import { TrainingService } from '@core/services/training.service';
import { DeliveredBy, HowWasItDelivered } from '@core/model/training.model';
import { SharedModule } from '@shared/shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Alert } from '@core/model/alert.model';
import { WorkerService } from '@core/services/worker.service';
import { of } from 'rxjs';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '@core/services/window.ref';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DateUtil } from '@core/utils/date-util';

describe('ConfirmMultipleTrainingWithCourseComponent', () => {
  const workplace = { uid: '1' };
  const workers = [
    {
      uid: '123',
      nameOrId: 'Hank Aaron',
      mainJob: {
        title: 'Care worker',
      },
    },
    {
      uid: '345',
      nameOrId: 'James Abbot',
      mainJob: {
        title: 'Care navigator',
      },
    },
  ];

  const selectedTrainingCourse = {
    id: 2,
    uid: 'uid-2',
    trainingCategoryId: 2,
    name: 'Basic safeguarding for support staff',
    trainingCategoryName: 'Safeguarding adults',
    accredited: 'Yes',
    deliveredBy: DeliveredBy.ExternalProvider,
    externalProviderName: 'Care skills academy',
    otherTrainingProviderName: null,
    howWasItDelivered: HowWasItDelivered.ELearning,
    validityPeriodInMonth: 12,
    doesNotExpire: false,
  };

  const courseCompletionDate = new Date('2024-08-21');
  const notes = 'Some notes';

  async function setup(overrides: any = {}) {
    const selectedTrainingCourseToUse = 'customTrainingCourse' in overrides ? overrides.customTrainingCourse : selectedTrainingCourse;
    const courseCompletionDateToUse = 'customCourseCompletionDate' in overrides ? overrides.customCourseCompletionDate : courseCompletionDate;
    const notesToUse = 'customNotes' in overrides ? overrides.customNotes : notes;
    const workersToUse = 'customWorkers' in overrides ? overrides.customWorkers : workers;

    const setupTools = await render(ConfirmMultipleTrainingWithCourseComponent, {
      imports: [RouterModule, SharedModule],
      providers: [
        AlertService,
        BackLinkService,
        WindowRef,
        WorkerService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                establishment: workplace,
              },
            },
          },
        },
        {
          provide: TrainingService,
          useValue: {
            getSelectedStaff() {
              return workersToUse;
            },
            getSelectedTrainingCourse() {
              return selectedTrainingCourseToUse;
            },
            getCourseCompletionDate() {
              return courseCompletionDateToUse;
            },
            getNotes() {
              return notesToUse;
            },
            resetState() {},
            fillInExpiryDate() {
              return overrides?.trainingRecordDetails ?? null;
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const injector = getTestBed();

    const backLinkService = injector.inject(BackLinkService) as BackLinkService;
    const showBackLinkSpy = spyOn(backLinkService, 'showBackLink');

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const trainingService = injector.inject(TrainingService) as TrainingService;
    const getCourseCompletionDateSpy = spyOn(trainingService, 'getCourseCompletionDate');
    const getNotesSpy = spyOn(trainingService, 'getNotes');
    const resetTrainingServiceStateSpy = spyOn(trainingService, 'resetState');

    const workerService = injector.inject(WorkerService) as WorkerService;
    const createMultipleTrainingRecordsSpy = spyOn(workerService, 'createMultipleTrainingRecords').and.returnValue(
      of({ savedRecords: 2 }),
    );
    const fillInExpiryDateSpy = spyOn(trainingService, 'fillInExpiryDate').and.callThrough();

    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert');

    const component = setupTools.fixture.componentInstance;

    return {
      alertSpy,
      createMultipleTrainingRecordsSpy,
      component,
      getCourseCompletionDateSpy,
      getNotesSpy,
      resetTrainingServiceStateSpy,
      routerSpy,
      showBackLinkSpy,
      fillInExpiryDateSpy,
      ...setupTools,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('displays a Back link', async () => {
    const { component, showBackLinkSpy, fixture } = await setup();

    component.ngOnInit();
    fixture.detectChanges();

    expect(showBackLinkSpy).toHaveBeenCalled();
  });

  it('should show the caption', async () => {
    const { getByTestId } = await setup();
    const caption = getByTestId('caption');
    expect(caption.textContent).toBe('Add multiple training records');
  });

  it('should show the heading', async () => {
    const { getByTestId } = await setup();
    const heading = getByTestId('heading');
    expect(heading.textContent).toEqual('Summary');
  });

  it('should show "check details" reminder', async () => {
    const { getByTestId } = await setup();
    const reminder = getByTestId('check-reminder-details');
    expect(reminder.textContent).toEqual('Check these details before you save the records.');
  });

  describe('Selected staff summary', () => {
    it('should display the heading "Selected staff"', async () => {
      const { getByTestId } = await setup();
      const heading = getByTestId('selected-staff-heading');
      expect(heading.textContent).toEqual('Selected staff');
    });

    it('should display details of worker 1', async () => {
      const { getByText } = await setup();

      expect(getByText(workers[0].nameOrId)).toBeTruthy();
      expect(getByText(workers[0].mainJob.title)).toBeTruthy();
    });

    it('should display details of worker 2', async () => {
      const { getByText } = await setup();

      expect(getByText(workers[1].nameOrId)).toBeTruthy();
      expect(getByText(workers[1].mainJob.title)).toBeTruthy();
    });

    it('should display a change link with the correct href', async () => {
      const { getByTestId } = await setup();

      const selectedStaffSummaryList = getByTestId('selected-staff-summary-list');
      const link = within(selectedStaffSummaryList).getByText('Change');

      expect(link.getAttribute('href')).toEqual(`/workplace/${workplace.uid}/add-multiple-training/select-staff`);
    });
  });

  describe('Training record details summary list', () => {
    it('should show the Training record details heading', async () => {
      const { getByTestId } = await setup();
      const heading = getByTestId('training-record-details-heading');
      expect(heading.textContent).toEqual('Training record details');
    });

    it('should display the summary list keys', async () => {
      const { getByTestId } = await setup();
      const trainingRecordDetails = getByTestId('training-record-details');

      expect(within(trainingRecordDetails).getByText('Training course name')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('Training category')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('Is the training course accredited?')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('Who delivered the training course?')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('Training provider name')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('How was the training course delivered?')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('How long is the training valid for?')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('Training completion date')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('Notes')).toBeTruthy();
    });

    it('should display the summary list values', async () => {
      const { getByTestId } = await setup();
      const trainingRecordDetails = getByTestId('training-record-details');

      expect(within(trainingRecordDetails).getByText('Basic safeguarding for support staff')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('Safeguarding adults')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('Yes')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('External provider')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('Care skills academy')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('E-learning')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('12 months')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('21 August 2024')).toBeTruthy();
      expect(within(trainingRecordDetails).getByText('Some notes')).toBeTruthy();
    });

    describe('When the training delivery method is "In-house"', () => {
      it('should not display the Training provider key or value', async () => {
        const { getByTestId } = await setup({
          customTrainingCourse: {
            ...selectedTrainingCourse,
            deliveredBy: DeliveredBy.InHouseStaff,
          }
        });
        const trainingRecordDetails = getByTestId('training-record-details');

        expect(within(trainingRecordDetails).queryByText('Training provider name')).toBeFalsy();
        expect(within(trainingRecordDetails).queryByText('Care skills academy')).toBeFalsy();
      });
    });

    describe('Select a different training course link', () => {
      it('should be displayed', async () => {
        const { getByTestId } = await setup();
        const trainingRecordDetails = getByTestId('training-record-details');
        expect(within(trainingRecordDetails).getByText('Select a different training course')).toBeTruthy();
      });

      it('should link to a previous page to select a training course', async () => {
        const { component, getByTestId } = await setup();
        const trainingRecordDetails = getByTestId('training-record-details');
        const link = within(trainingRecordDetails).getByTestId('different-training-course-link');

        expect(link.getAttribute('href')).toEqual(
          `/workplace/${component.workplace.uid}/add-multiple-training/select-training-course`,
        );
      });
    });

    describe('Change training completion date link', () => {
      it('should be displayed', async () => {
        const { getByTestId } = await setup();
        const trainingRecordDetails = getByTestId('training-record-details');
        expect(within(trainingRecordDetails).getByText('Change')).toBeTruthy();
      });

      it('should link to the previous page to change the date', async () => {
        const { component, getByTestId } = await setup();
        const trainingRecordDetails = getByTestId('training-record-details');
        const link = within(trainingRecordDetails).getByText('Change');

        expect(link.getAttribute('href')).toEqual(
          `/workplace/${component.workplace.uid}/add-multiple-training/view-selected-training-course-details`,
        );
      });
    });

    describe('When there is missing data', () => {
      it('should display "-" if training course data from the training service is missing', async () => {
        const { getByTestId } = await setup({
          customTrainingCourse: {
            ...selectedTrainingCourse,
            accredited: null,
          }
        });
        const trainingRecordDetails = getByTestId('training-record-details');
        expect(within(trainingRecordDetails).queryAllByText('-').length).toEqual(1);
      });

      it('should display "-" if the completion date is missing', async () => {
        const { getByTestId } = await setup({
          customCourseCompletionDate: null,
        });
        const trainingRecordDetails = getByTestId('training-record-details');

        expect(within(trainingRecordDetails).queryAllByText('-').length).toEqual(1);
      });

      it('should display "No notes added" if there are no notes', async () => {
        const { getByTestId } = await setup({
          customNotes: null
        });
        const trainingRecordDetails = getByTestId('training-record-details');

        expect(within(trainingRecordDetails).getByText('No notes added')).toBeTruthy();
      });
    });

    describe('Pluralisation', () => {
      describe('When the training is valid for more than 1 month', () => {
        it('should display the pluralised amount', async () => {
          const { getByTestId } = await setup();
          const trainingRecordDetails = getByTestId('training-record-details');
          expect(within(trainingRecordDetails).getByText('12 months')).toBeTruthy();
        });
      });

      describe('When the training is valid for 1 month', () => {
        it('should display the singular amount', async () => {
          const { getByTestId } = await setup({
            customTrainingCourse: {
              ...selectedTrainingCourse,
              validityPeriodInMonth: 1
            }
          });
          const trainingRecordDetails = getByTestId('training-record-details');
          expect(within(trainingRecordDetails).getByText('1 month')).toBeTruthy();
        });
      });
    });
  });

  describe('When refreshing the page', () => {
    it('Returns to page to select those you want to add a record for', async () => {
      const { component, routerSpy } = await setup({ customTrainingCourse: null });
      component.ngOnInit();
      expect(routerSpy).toHaveBeenCalledWith([
        `workplace/${component.workplace.uid}/add-multiple-training/select-staff`,
      ]);
    });
  });

  describe('Save training records button', () => {
    it('should call createMultipleTrainingRecords function when clicked', async () => {
      const trainingRecordDetails = {
        trainingCategory: { id: selectedTrainingCourse.trainingCategoryId },
        title: selectedTrainingCourse.name,
        trainingCategoryName: selectedTrainingCourse.trainingCategoryName,
        accredited: selectedTrainingCourse.accredited,
        deliveredBy: selectedTrainingCourse.deliveredBy,
        externalProviderName: selectedTrainingCourse.externalProviderName,
        otherTrainingProviderName: selectedTrainingCourse.otherTrainingProviderName,
        howWasItDelivered: selectedTrainingCourse.howWasItDelivered,
        validityPeriodInMonth: selectedTrainingCourse.validityPeriodInMonth,
        completed: '2024-08-21',
        notes: notes,
        trainingCourseFK: selectedTrainingCourse.id,
      };
      const { createMultipleTrainingRecordsSpy, fixture, getByText } = await setup({ trainingRecordDetails });

      const button = getByText('Save training records');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(createMultipleTrainingRecordsSpy).toHaveBeenCalledWith(
        workplace.uid,
        [workers[0].uid, workers[1].uid],
        trainingRecordDetails,
      );
    });

    it('should call createMultipleTrainingRecords when completion date and notes are null', async () => {
      const trainingRecordDetails = {
        trainingCategory: { id: selectedTrainingCourse.trainingCategoryId },
        title: selectedTrainingCourse.name,
        trainingCategoryName: selectedTrainingCourse.trainingCategoryName,
        accredited: selectedTrainingCourse.accredited,
        deliveredBy: selectedTrainingCourse.deliveredBy,
        externalProviderName: selectedTrainingCourse.externalProviderName,
        otherTrainingProviderName: selectedTrainingCourse.otherTrainingProviderName,
        howWasItDelivered: selectedTrainingCourse.howWasItDelivered,
        validityPeriodInMonth: selectedTrainingCourse.validityPeriodInMonth,
        completed: null,
        notes: null,
        trainingCourseFK: selectedTrainingCourse.id,
      };
      const { createMultipleTrainingRecordsSpy, fixture, getByText } = await setup(
        { trainingRecordDetails, customCourseCompletionDate: null, customNotes: null }
      );

      const button = getByText('Save training records');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(createMultipleTrainingRecordsSpy).toHaveBeenCalledWith(
        workplace.uid,
        [workers[0].uid, workers[1].uid],
        trainingRecordDetails,
      );
    });

    it('should set the expiry when there is a completed date and validityPeriodInMonth', async () => {
      const trainingRecordDetails = {
        trainingCategory: { id: selectedTrainingCourse.trainingCategoryId },
        title: 'Basic safeguarding for support staff',
        trainingCategoryName: selectedTrainingCourse.trainingCategoryName,
        accredited: selectedTrainingCourse.accredited,
        deliveredBy: selectedTrainingCourse.deliveredBy,
        externalProviderName: selectedTrainingCourse.externalProviderName,
        otherTrainingProviderName: selectedTrainingCourse.otherTrainingProviderName,
        howWasItDelivered: selectedTrainingCourse.howWasItDelivered,
        validityPeriodInMonth: selectedTrainingCourse.validityPeriodInMonth,
        completed: '2024-08-21',
        notes: notes,
        trainingCourseFK: selectedTrainingCourse.id,
        doesNotExpire: false,
      };

      const trainingRecordDetailsWithExpiry = {
        ...trainingRecordDetails,
        expires: '2025-08-21',
      };

      const { createMultipleTrainingRecordsSpy, fixture, getByText, fillInExpiryDateSpy } = await setup({
        trainingRecordDetails: trainingRecordDetailsWithExpiry,
      });

      const button = getByText('Save training records');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(fillInExpiryDateSpy).toHaveBeenCalledWith(
        trainingRecordDetails,
        DateUtil.toDayjs({ day: 21, month: 8, year: 2024 }),
      );
      expect(createMultipleTrainingRecordsSpy).toHaveBeenCalledWith(
        workplace.uid,
        [workers[0].uid, workers[1].uid],
        trainingRecordDetailsWithExpiry,
      );
    });

    it('should call resetState in the training service when successfully confirming details', async () => {
      const { getByText, fixture, resetTrainingServiceStateSpy } = await setup();

      const button = getByText('Save training records');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(resetTrainingServiceStateSpy).toHaveBeenCalled();
    });

    it('should navigate back to the dashboard and add a pluralised alert', async () => {
      const { fixture, getByText, routerSpy, alertSpy } = await setup();

      const button = getByText('Save training records');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'training-and-qualifications' });
      await fixture.whenStable();
      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: '2 training records added',
      } as Alert);
    });

    it('should navigate back to the dashboard and add an alert', async () => {
      const { fixture, getByText, routerSpy, alertSpy,  } = await setup({ customWorkers: workers.slice(0, -1), });

      const button = getByText('Save training records');
      fireEvent.click(button);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'training-and-qualifications' });
      await fixture.whenStable();
      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: '1 training record added',
      } as Alert);
    });
  });
});
