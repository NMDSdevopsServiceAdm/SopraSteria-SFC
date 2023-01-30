import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkerService } from '@core/services/worker.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { qualificationRecord } from '@core/test-utils/MockWorkerService';
import { MockWorkerServiceWithWorker } from '@core/test-utils/MockWorkerServiceWithWorker';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { AddEditQualificationComponent } from './add-edit-qualification.component';
import { QualificationFormComponent } from './qualification-form/qualification-form.component';

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
        declarations: [QualificationFormComponent],
      },
    );

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryByText,
      getByLabelText,
      routerSpy,
      getAllByText,
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
    it('should show label', async () => {
      const { fixture, getByLabelText, getByTestId } = await setup(null);

      const degreeRadio = getByLabelText('Degree');
      const conditionalForm = getByTestId('Degree');

      fireEvent.click(degreeRadio);

      fixture.detectChanges();
      expect(within(conditionalForm).getByText('You have 500 characters remaining')).toBeTruthy();
    });

    it('should show a count of how many characters there are remaining until the limit of the notes input', async () => {
      const { fixture, getByLabelText, getByTestId } = await setup(null);

      const degreeRadio = getByLabelText('Degree');
      const conditionalForm = getByTestId('Degree');

      fireEvent.click(degreeRadio);
      fixture.detectChanges();
      userEvent.type(within(conditionalForm).getByLabelText('Notes'), 'aaaaa');
      fixture.detectChanges();
      expect(within(conditionalForm).getByText('You have 495 characters remaining')).toBeTruthy();
    });

    it('should show by how many characters the user has exceeded the limit of the notes input', async () => {
      const { fixture, getByLabelText, getByTestId } = await setup(null);

      const degreeRadio = getByLabelText('Degree');
      const conditionalForm = getByTestId('Degree');

      fireEvent.click(degreeRadio);
      fixture.detectChanges();
      userEvent.type(
        within(conditionalForm).getByLabelText('Notes'),
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      );
      fixture.detectChanges();
      expect(within(conditionalForm).getByText('You have 1 character too many')).toBeTruthy();
    });
  });

  describe('error messages', async () => {
    it('should show error messages if no qualification type is selected', async () => {
      const { getByText, getAllByText } = await setup(null);

      fireEvent.click(getByText('Save record'));
      expect(getAllByText('Select the qualification type').length).toEqual(2);
    });

    it('should show error messages if no qualification name is selected', async () => {
      const { fixture, getByLabelText, getByText, getAllByText } = await setup(null);

      const degreeRadio = getByLabelText('Degree');
      fireEvent.click(degreeRadio);
      fixture.detectChanges();
      fireEvent.click(getByText('Save record'));
      expect(getAllByText('Select the qualification name').length).toEqual(2);
    });

    it('should show error messages if year achieved is out of acceptable range', async () => {
      const { fixture, getByLabelText, getByText, getAllByText, getByTestId } = await setup(null);

      const degreeRadio = getByLabelText('Degree');
      const conditionalForm = getByTestId('Degree');
      fireEvent.click(degreeRadio);
      fixture.detectChanges();
      userEvent.type(within(conditionalForm).getByLabelText('Year achieved'), '1000');
      fireEvent.click(getByText('Save record'));
      expect(getAllByText('Year achieved must be this year or fewer than 100 years in the past').length).toEqual(2);
    });

    it('should show error messages if too many characters are entered into the notes input', async () => {
      const { fixture, getByLabelText, getByText, getAllByText, getByTestId } = await setup(null);

      const degreeRadio = getByLabelText('Degree');
      const conditionalForm = getByTestId('Degree');
      fireEvent.click(degreeRadio);
      fixture.detectChanges();
      userEvent.type(
        within(conditionalForm).getByLabelText('Notes'),
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      );
      fireEvent.click(getByText('Save record'));
      expect(getAllByText('Notes must be 500 characters or fewer').length).toEqual(2);
    });
  });
});
