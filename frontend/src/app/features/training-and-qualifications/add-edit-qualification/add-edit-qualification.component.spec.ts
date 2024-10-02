import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { QualificationResponse } from '@core/model/qualification.model';
import { WorkerService } from '@core/services/worker.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { qualificationRecord } from '@core/test-utils/MockWorkerService';
import { MockWorkerServiceWithWorker } from '@core/test-utils/MockWorkerServiceWithWorker';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { AddEditQualificationComponent } from './add-edit-qualification.component';

describe('AddEditQualificationComponent', () => {
  async function setup(qualificationId = '1') {
    const { fixture, getByText, getByTestId, queryByText, getByLabelText, getAllByText } = await render(
      AddEditQualificationComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: new MockActivatedRoute({
              snapshot: {
                params: { qualificationId: qualificationId },
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
            }),
          },
          { provide: WorkerService, useClass: MockWorkerServiceWithWorker },
          { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        ],
      },
    );

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const workerService = injector.inject(WorkerService) as WorkerService;

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryByText,
      getByLabelText,
      routerSpy,
      getAllByText,
      workerService,
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

  describe('title', () => {
    it('should render the Add qualification details title', async () => {
      const { component, fixture, getByText } = await setup();

      component.qualificationId = null;
      fixture.detectChanges();

      expect(getByText('Add qualification record details')).toBeTruthy();
    });

    it('should render the Qualification details title when there is a qualification id and record', async () => {
      const { component, fixture, getByText } = await setup();

      component.record = qualificationRecord;
      fixture.detectChanges();

      expect(getByText('Qualification record details')).toBeTruthy();
    });
  });

  describe('delete link', () => {
    it('should render the delete link when editing qualification', async () => {
      const { component, fixture, getByText } = await setup();

      component.record = qualificationRecord;
      fixture.detectChanges();

      expect(getByText('Delete this qualification record')).toBeTruthy();
    });

    it('should not render the delete link when there is no qualification id', async () => {
      const { component, fixture, queryByText } = await setup();

      component.qualificationId = null;
      fixture.detectChanges();

      expect(queryByText('Delete this qualification record')).toBeFalsy();
    });

    it('should navigate to delete confirmation page', async () => {
      const { component, routerSpy, getByTestId } = await setup();
      const deleteQualificationRecord = getByTestId('delete-this-qualification-record');

      fireEvent.click(deleteQualificationRecord);
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'training-and-qualifications-record',
        component.worker.uid,
        'qualification',
        component.qualificationId,
        'delete',
      ]);
    });
  });

  describe('notes', async () => {
    it('should show number of characters label', async () => {
      const { getByText } = await setup(null);

      expect(getByText('You have 500 characters remaining')).toBeTruthy();
    });

    it('should show a count of how many characters there are remaining until the limit of the notes input', async () => {
      const { fixture, getByLabelText, getByText } = await setup(null);

      const notesTextBox = getByLabelText('Notes');
      userEvent.type(notesTextBox, 'aaaaa');
      fixture.detectChanges();
      expect(getByText('You have 495 characters remaining')).toBeTruthy();
    });

    it('should show by how many characters the user has exceeded the limit of the notes input', async () => {
      const { fixture, getByLabelText, getByText } = await setup(null);

      const notesTextBox = getByLabelText('Notes');

      userEvent.type(
        notesTextBox,
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      );
      fixture.detectChanges();
      expect(getByText('You have 4 characters too many')).toBeTruthy();
    });

    it('should show singular message when the user has exceeded the limit of the notes input by 1', async () => {
      const { fixture, getByLabelText, getByText } = await setup(null);

      const notesTextBox = getByLabelText('Notes');

      userEvent.type(
        notesTextBox,
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      );
      fixture.detectChanges();
      expect(getByText('You have 1 character too many')).toBeTruthy();
    });
  });

  describe('prefilling data for existing qualification', () => {
    const mockQualificationData = {
      created: '2024-10-01T08:53:35.143Z',
      notes: 'ihoihio',
      qualification: {
        group: 'Degree',
        id: 136,
        level: '6',
        title: 'Health and social care degree (level 6)',
      },

      uid: 'fd50276b-e27c-48a6-9015-f0c489302666',
      updated: '2024-10-01T08:53:35.143Z',
      updatedBy: 'duncan',
      year: 1999,
    } as QualificationResponse;

    const setupWithExistingQualification = async () => {
      const { component, workerService, fixture, getByText, queryByText } = await setup('mockQualificationId');

      spyOn(workerService, 'getQualification').and.returnValue(of(mockQualificationData));
      const updateQualificationSpy = spyOn(workerService, 'updateQualification').and.returnValue(of(null));

      component.ngOnInit();
      fixture.detectChanges();

      return { component, workerService, fixture, getByText, queryByText, updateQualificationSpy };
    };

    it('should display qualification group and title', async () => {
      const { getByText } = await setupWithExistingQualification();

      expect(getByText('Type: ' + mockQualificationData.qualification.group)).toBeTruthy();
      expect(getByText(mockQualificationData.qualification.title)).toBeTruthy();
    });

    it('should not have Change link when it is an existing qualification record', async () => {
      const { queryByText } = await setupWithExistingQualification();

      expect(queryByText('Change')).toBeFalsy();
    });

    it('should prefill notes box with notes when existing notes', async () => {
      const { fixture } = await setupWithExistingQualification();

      const notesBox = fixture.nativeElement.querySelector('#notes');

      expect(notesBox.value).toEqual(mockQualificationData.notes);
    });

    it('should prefill year input box with year from existing qualification', async () => {
      const { fixture } = await setupWithExistingQualification();

      const yearInput = fixture.nativeElement.querySelector('#year');

      expect(yearInput.value).toEqual(mockQualificationData.year.toString());
    });

    it('should make call to updateQualification with existing record details and updated fields when submitting for existing qual', async () => {
      const { component, fixture, getByText, updateQualificationSpy } = await setupWithExistingQualification();

      const yearInput = fixture.nativeElement.querySelector('#year');
      userEvent.clear(yearInput);
      userEvent.type(yearInput, '2023');

      const saveButton = getByText('Save and return');
      userEvent.click(saveButton);

      expect(updateQualificationSpy).toHaveBeenCalledWith(
        component.workplace.uid,
        component.worker.uid,
        component.qualificationId,
        {
          type: mockQualificationData.qualification.group,
          qualification: { id: mockQualificationData.qualification.id },
          year: 2023,
          notes: mockQualificationData.notes,
        },
      );
    });
  });

  describe('error messages', async () => {
    it('should show error message if year achieved is more than 100 years ago', async () => {
      const { getByLabelText, getByText, getAllByText } = await setup(null);

      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 101);
      const yearAchievedInput = getByLabelText('Year achieved');

      userEvent.type(yearAchievedInput, `${pastDate.getFullYear()}`);
      fireEvent.click(getByText('Save record'));

      expect(getAllByText('Year achieved must be this year or no more than 100 years ago').length).toEqual(2);
    });

    it('should show error message if year achieved is in the future', async () => {
      const { getByLabelText, getByText, getAllByText } = await setup(null);

      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const yearAchievedInput = getByLabelText('Year achieved');

      userEvent.type(yearAchievedInput, `${futureDate.getFullYear()}`);
      fireEvent.click(getByText('Save record'));

      expect(getAllByText('Year achieved must be this year or no more than 100 years ago').length).toEqual(2);
    });

    it('should show error messages if too many characters are entered into the notes input', async () => {
      const { fixture, getByLabelText, getByText, getAllByText, getByTestId } = await setup(null);

      const notesBox = getByLabelText('Notes');

      userEvent.type(
        notesBox,
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      );
      fireEvent.click(getByText('Save record'));
      expect(getAllByText('Notes must be 500 characters or fewer').length).toEqual(2);
    });
  });
});
