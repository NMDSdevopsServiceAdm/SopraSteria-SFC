import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockTrainingCategoryService } from '@core/test-utils/MockTrainingCategoriesService';
import { MockTrainingService, MockTrainingServiceWithPreselectedStaff } from '@core/test-utils/MockTrainingService';
import { MockWorkerServiceWithWorker } from '@core/test-utils/MockWorkerServiceWithWorker';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import sinon from 'sinon';

import { AddMultipleTrainingModule } from '../add-multiple-training.module';
import { MultipleTrainingDetailsComponent } from './training-details.component';

describe('MultipleTrainingDetailsComponent', () => {
  async function setup(
    overrides: any = {
      accessedFromSummary: false,
      prefill: false,
      isPrimaryWorkplace: true,
      qsParamGetMock: sinon.fake(),
    },
  ) {
    const setupTools = await render(MultipleTrainingDetailsComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, AddMultipleTrainingModule],
      providers: [
        WindowRef,
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: TrainingCategoryService, useClass: MockTrainingCategoryService },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            snapshot: {
              params: { trainingRecordId: '1' },
              parent: {
                url: [{ path: overrides.accessedFromSummary ? 'confirm-training' : 'add-multiple-training' }],
              },
            },
            parent: {
              snapshot: {
                data: {
                  establishment: {
                    uid: overrides.isPrimaryWorkplace ? '98a83eef-e1e1-49f3-89c5-b1287a3cc8de' : 'mock-uid',
                  },
                },
              },
            },
          }),
        },
        UntypedFormBuilder,
        ErrorSummaryService,
        {
          provide: TrainingService,
          useClass: overrides.prefill ? MockTrainingServiceWithPreselectedStaff : MockTrainingService,
        },
        { provide: WorkerService, useClass: MockWorkerServiceWithWorker },
        {
          provide: TrainingCategoryService,
          useClass: MockTrainingCategoryService,
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const workerService = injector.inject(WorkerService) as WorkerService;
    const trainingService = injector.inject(TrainingService) as TrainingService;

    const spy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const workerSpy = spyOn(workerService, 'createMultipleTrainingRecords').and.callThrough();
    const trainingSpy = spyOn(trainingService, 'resetState').and.callThrough();
    const setSelectedTrainingSpy = spyOnProperty(trainingService, 'selectedTraining', 'set');
    const setUpdatingSelectedStaffForMultipleTrainingSpy = spyOn(
      trainingService,
      'setUpdatingSelectedStaffForMultipleTraining',
    );

    return {
      component: setupTools.fixture.componentInstance,
      ...setupTools,
      spy,
      workerSpy,
      trainingService,
      trainingSpy,
      setSelectedTrainingSpy,
      setUpdatingSelectedStaffForMultipleTrainingSpy,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the caption and heading', async () => {
    const { getByRole, getByTestId } = await setup();

    const caption = getByTestId('section-heading');

    expect(caption).toBeTruthy();
    expect(within(caption).getByText('Add multiple training records')).toBeTruthy();
    expect(getByRole('heading', { name: 'Add training record details' })).toBeTruthy();
  });

  it('should render `Continue` and `Cancel` buttons when it is not accessed from the confirm training page', async () => {
    const { getByText } = await setup();

    expect(getByText('Continue')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('should render `Save and return` and `Cancel` buttons when it is accessed from the confirm training page', async () => {
    const { getByText } = await setup({ accessedFromSummary: true });

    expect(getByText('Save and return')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('should show a dropdown with the correct categories in', async () => {
    const { component } = await setup();
    expect(component.categories).toEqual([
      { id: 1, seq: 10, category: 'Activity provision/Well-being', trainingCategoryGroup: 'Care skills and knowledge' },
      { id: 2, seq: 20, category: 'Autism', trainingCategoryGroup: 'Specific conditions and disabilities' },
      { id: 37, seq: 1, category: 'Other', trainingCategoryGroup: null },
    ]);
  });

  it('should store the selected training in training service and navigate to the next page when filling out the form and clicking continue', async () => {
    const { component, getByText, getByLabelText, getByTestId, fixture, setSelectedTrainingSpy, spy } = await setup();

    component.trainingCategory = {
      id: component.categories[0].id,
      category: component.categories[0].category,
    };
    component.hideExpiresDate = false;
    const openNotesButton = getByText('Open notes');
    openNotesButton.click();
    fixture.detectChanges();

    userEvent.type(getByLabelText('Training record name'), 'Training');
    userEvent.click(getByLabelText('Yes'));
    userEvent.click(getByLabelText('External provider'));
    userEvent.type(getByLabelText('Provider name'), 'Care skills academy');
    userEvent.type(getByLabelText('How many months is the training valid for before it expires?'), '');
    userEvent.type(getByLabelText('This training does not expire'), 'true');
    userEvent.click(getByLabelText('E-learning'));
    const completedDate = getByTestId('completedDate');
    userEvent.type(within(completedDate).getByLabelText('Day'), '1');
    userEvent.type(within(completedDate).getByLabelText('Month'), '1');
    userEvent.type(within(completedDate).getByLabelText('Year'), '2020');
    const expiryDate = getByTestId('expiresDate');
    userEvent.type(within(expiryDate).getByLabelText('Day'), '1');
    userEvent.type(within(expiryDate).getByLabelText('Month'), '1');
    userEvent.type(within(expiryDate).getByLabelText('Year'), '2022');
    userEvent.type(getByLabelText('Add a note'), 'Notes for training');

    const finishButton = getByText('Continue');
    userEvent.click(finishButton);
    fixture.detectChanges();

    expect(component.form.valid).toBeTruthy();
    expect(setSelectedTrainingSpy).toHaveBeenCalledWith({
      trainingCategory: component.categories[0],
      title: 'Training',
      accredited: 'Yes',
      deliveredBy: 'External provider',
      externalProviderName: 'Care skills academy',
      howWasItDelivered: 'E-learning',
      validityPeriodInMonth: null,
      doesNotExpire: true,
      completed: '2020-01-01',
      expires: '2022-01-01',
      notes: 'Notes for training',
    });
    expect(spy).toHaveBeenCalledWith([
      'workplace',
      component.workplace.uid,
      'add-multiple-training',
      'confirm-training',
    ]);
  });

  it('should navigate to the confirm training page when page has been accessed from that page and pressing Save and return', async () => {
    const { component, fixture, getByText, setSelectedTrainingSpy, spy } = await setup({
      accessedFromSummary: true,
      prefill: true,
    });

    component.trainingCategory = {
      id: component.categories[0].id,
      category: component.categories[0].category,
    };

    const button = getByText('Save and return');
    fireEvent.click(button);
    fixture.detectChanges();

    expect(setSelectedTrainingSpy).toHaveBeenCalledWith({
      trainingCategory: component.categories[0],
      title: 'Title',
      accredited: 'Yes',
      deliveredBy: null,
      externalProviderName: null,
      howWasItDelivered: 'Face to face',
      validityPeriodInMonth: null,
      doesNotExpire: null,
      completed: '2020-01-01',
      expires: '2021-01-01',
      notes: 'This is a note',
    });
    expect(spy).toHaveBeenCalledWith([
      'workplace',
      component.workplace.uid,
      'add-multiple-training',
      'confirm-training',
    ]);
  });

  it('should reset training service state and navigate to dashboard when pressing cancel when in the flow', async () => {
    const { getByText, spy, trainingSpy } = await setup();

    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(trainingSpy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'training-and-qualifications' });
  });

  it('should not clear selected staff and navigate when pressing cancel when in the flow', async () => {
    const { getByText, spy, trainingSpy } = await setup({ accessedFromSummary: true });

    const cancelButton = getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(trainingSpy).not.toHaveBeenCalled();
    expect(spy.calls.mostRecent().args[0]).toEqual(['../']);
  });

  it('should prefill the form if it has already been filled out', async () => {
    const { component } = await setup({ accessedFromSummary: false, prefill: true });

    const form = component.form;
    const {
      title,
      accredited,
      deliveredBy = null,
      externalProviderName = null,
      howWasItDelivered = null,
      validityPeriodInMonth = null,
      doesNotExpire = null,
      completed,
      expires,
      notes,
    } = component.trainingService.selectedTraining;
    const completedArr = completed.split('-');
    const expiresArr = expires.split('-');

    expect(form.value).toEqual({
      title,
      accredited,
      deliveredBy,
      externalProviderName,
      howWasItDelivered,
      validityPeriodInMonth,
      doesNotExpire,
      completed: { day: +completedArr[2], month: +completedArr[1], year: +completedArr[0] },
      expires: { day: +expiresArr[2], month: +expiresArr[1], year: +expiresArr[0] },
      notes,
    });
  });

  it('should set the notes section as open if there are some notes', async () => {
    const { component, getByText, getByTestId } = await setup({ accessedFromSummary: false, prefill: true });

    const { notes } = component.trainingService.selectedTraining;

    const notesSection = getByTestId('notesSection');

    expect(getByText('Close notes')).toBeTruthy();
    expect(notesSection.getAttribute('class')).not.toContain('govuk-visually-hidden');
    const notesTextArea = within(notesSection).getByRole('textbox', { name: 'Add a note' }) as HTMLTextAreaElement;
    expect(notesTextArea.value).toEqual(notes);
  });

  it('should display the remaining character count correctly if there are some notes', async () => {
    const { component, getByText } = await setup({ accessedFromSummary: false, prefill: true });

    const { notes } = component.trainingService.selectedTraining;

    const expectedRemainingCharCounts = component.notesMaxLength - notes.length;
    expect(getByText(`You have ${expectedRemainingCharCounts} characters remaining`)).toBeTruthy;
  });

  it('should not render certificate upload', async () => {
    const { queryByTestId } = await setup();
    const uploadSection = queryByTestId('uploadCertificate');
    expect(uploadSection).toBeFalsy();
  });

  describe('expiresDate', () => {
    it('should show', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.hideExpiresDate = false;
      fixture.detectChanges();
      const expiresDate = getByTestId('expiresDate');

      expect(expiresDate).toBeTruthy();
    });

    it('should not show', async () => {
      const { component, fixture, queryByTestId } = await setup();

      component.hideExpiresDate = true;
      fixture.detectChanges();

      const expiresDate = queryByTestId('expiresDate');

      expect(expiresDate).toBeFalsy();
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
      openNotesButton.click();

      fixture.detectChanges();

      const notesSection = getByTestId('notesSection');

      expect(getByText('Close notes')).toBeTruthy();
      expect(notesSection.getAttribute('class')).not.toContain('govuk-visually-hidden');
    });
  });

  describe('errors', () => {
    it('should show an error when Training record name less than 3 characters', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      component.form.get('title').setValue('a');
      component.form.get('title').markAsDirty();
      const finishButton = getByText('Continue');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(getAllByText('Training record name must be between 3 and 120 characters').length).toEqual(2);
    });

    it('should show an error when Training record name more than 120 characters', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      component.form
        .get('title')
        .setValue(
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        );
      component.form.get('title').markAsDirty();
      const finishButton = getByText('Continue');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(getAllByText('Training record name must be between 3 and 120 characters').length).toEqual(2);
    });

    it('should show an error when completed date not valid', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      component.form.get('completed').setValue({ day: 32, month: 12, year: 2000 });
      component.form.get('completed').markAsDirty();
      const finishButton = getByText('Continue');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(getAllByText('Date completed must be a valid date').length).toEqual(2);
    });

    it('should show an error when completed date is after today', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      const today = new Date();
      const todayDate = { day: 31, month: 12, year: today.getFullYear() + 1 };
      component.form.get('completed').setValue(todayDate);
      component.form.get('completed').markAsDirty();
      const finishButton = getByText('Continue');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(getAllByText('Date completed must be before today').length).toEqual(2);
    });

    it('should show an error when completed date is more than 100 years ago', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      const today = new Date();
      const todayDate = { day: 31, month: 12, year: today.getFullYear() - 101 };
      component.form.get('completed').setValue(todayDate);
      component.form.get('completed').markAsDirty();
      const finishButton = getByText('Continue');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(getAllByText('Date completed cannot be more than 100 years ago').length).toEqual(2);
    });

    xit('should show an error when expiry date not valid', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      component.form.get('expires').setValue({ day: 32, month: 12, year: 2000 });
      component.form.get('expires').markAsDirty();
      const finishButton = getByText('Continue');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(getAllByText('Expiry date must be a valid date').length).toEqual(2);
    });

    xit('should show an error when expiry date not valid and 0s are entered in the input fields', async () => {
      const { component, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      component.form.get('expires').setValue({ day: 0, month: 0, year: 0 });
      component.form.get('expires').markAsDirty();
      const finishButton = getByText('Continue');
      fireEvent.click(finishButton);
      fixture.detectChanges();
      expect(getAllByText('Expiry date must be a valid date').length).toEqual(2);
    });

    xit('should show an error when expiry date is before the completed date', async () => {
      const { component, getByTestId, getByText, fixture, getAllByText } = await setup();
      component.form.markAsDirty();
      const today = new Date();
      const completedDate = getByTestId('completedDate');
      userEvent.type(within(completedDate).getByLabelText('Day'), `7`);
      userEvent.type(within(completedDate).getByLabelText('Month'), `${today.getMonth() + 1}`);
      userEvent.type(within(completedDate).getByLabelText('Year'), `${today.getFullYear()}`);
      const expiresDate = getByTestId('expiresDate');
      userEvent.type(within(expiresDate).getByLabelText('Day'), `6`);
      userEvent.type(within(expiresDate).getByLabelText('Month'), `${today.getMonth() + 1}`);
      userEvent.type(within(expiresDate).getByLabelText('Year'), `${today.getFullYear()}`);
      fireEvent.click(getByText('Continue'));
      fixture.detectChanges();

      expect(getAllByText('Expiry date must be after date completed').length).toEqual(2);
    });

    describe('notes errors', () => {
      const veryLongString =
        'This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string. This is a very long string.';

      it('should show an error message if the notes is over 1000 characters', async () => {
        const { component, fixture, getByText, getByLabelText, getAllByText } = await setup();

        component.previousUrl = ['/goToPreviousUrl'];
        const openNotesButton = getByText('Open notes');
        openNotesButton.click();
        fixture.detectChanges();

        userEvent.type(getByLabelText('Add a note'), veryLongString);

        fireEvent.click(getByText('Continue'));
        fixture.detectChanges();

        expect(getAllByText('Notes must be 1000 characters or fewer').length).toEqual(2);
      });

      it('should open the notes section if the notes input is over 1000 characters and section is closed on submit', async () => {
        const { fixture, getByText, getByLabelText, getByTestId } = await setup({ accessedFromSummary: null });

        const openNotesButton = getByText('Open notes');
        openNotesButton.click();
        fixture.detectChanges();

        userEvent.type(getByLabelText('Add a note'), veryLongString);

        const closeNotesButton = getByText('Close notes');
        closeNotesButton.click();
        fixture.detectChanges();

        fireEvent.click(getByText('Continue'));
        fixture.detectChanges();

        const notesSection = getByTestId('notesSection');

        expect(getByText('Close notes')).toBeTruthy();
        expect(notesSection.getAttribute('class')).not.toContain('govuk-visually-hidden');
      });
    });
  });

  describe('change links', () => {
    it('should display a change link for number of staff selected', async () => {
      const { getByTestId } = await setup({ accessedFromSummary: false, prefill: true });

      const numberOfStaffSelected = getByTestId('numberOfStaffSelected');

      const changeStaffSelectedLink = within(numberOfStaffSelected).getByText('Change');

      expect(numberOfStaffSelected).toBeTruthy();
      expect(changeStaffSelectedLink).toBeTruthy();
    });

    it('should display a change link for training category selected if not accessed from summary page', async () => {
      const { component, fixture, getByTestId } = await setup({ accessedFromSummary: false, prefill: true });

      component.trainingCategory = {
        id: component.categories[0].id,
        category: component.categories[0].category,
      };

      fixture.detectChanges();

      const trainingCategoryDisplay = getByTestId('trainingCategoryDisplay');

      const changeTrainingCaegorySelectedLink = within(trainingCategoryDisplay).getByText('Change');

      expect(trainingCategoryDisplay).toBeTruthy();
      expect(changeTrainingCaegorySelectedLink).toBeTruthy();
    });

    it('should not display the number of staff and training category if accessed from summary page', async () => {
      const { queryByTestId } = await setup({ accessedFromSummary: true, prefill: true });

      const numberOfStaffSelected = queryByTestId('numberOfStaffSelected');
      const trainingCategoryDisplay = queryByTestId('trainingCategoryDisplay');

      expect(numberOfStaffSelected).toBeFalsy();
      expect(trainingCategoryDisplay).toBeFalsy();
    });

    it('should call setIsSelectStaffChange when change is clicked for staff', async () => {
      const { setUpdatingSelectedStaffForMultipleTrainingSpy, getByTestId } = await setup({
        accessedFromSummary: false,
        prefill: true,
      });

      const numberOfStaffSelected = getByTestId('numberOfStaffSelected');

      const changeStaffSelectedLink = within(numberOfStaffSelected).getByText('Change');

      fireEvent.click(changeStaffSelectedLink);

      expect(setUpdatingSelectedStaffForMultipleTrainingSpy).toHaveBeenCalledWith(true);
    });
  });
});
