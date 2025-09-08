import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { VacanciesAndTurnoverService } from '@core/services/vacancies-and-turnover.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockVacanciesAndTurnoverService } from '@core/test-utils/MockVacanciesAndTurnoverService';
import { mockLeaveReasons, MockWorkerServiceWithUpdateWorker, workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { repeat } from 'lodash';
import { of } from 'rxjs';

import { DeleteStaffRecordComponent } from './delete-staff-record.component';

fdescribe('DeleteStaffRecordComponent', () => {
  const mockWorker = workerBuilder() as Worker;

  const setup = async (overrides: any = {}) => {
    const hasAnyTrainingOrQualifications = overrides?.hasAnyTrainingOrQualifications ?? true;

    const setupTools = await render(DeleteStaffRecordComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: WorkerService,
          useFactory: MockWorkerServiceWithUpdateWorker.factory(mockWorker),
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                reasonsForLeaving: mockLeaveReasons,
                totalNumberOfStaff: 2,
                ...overrides.snapshot,
                workerHasAnyTrainingOrQualifications: {
                  hasAnyTrainingOrQualifications,
                },
              },
            },
          },
        },
        {
          provide: VacanciesAndTurnoverService,
          useClass: MockVacanciesAndTurnoverService,
        },
        AlertService,
        WindowRef,
      ],
    });
    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const workerService = injector.inject(WorkerService) as WorkerService;
    const deleteWorkerSpy = spyOn(workerService, 'deleteWorker').and.returnValue(of(null));

    const alertService = injector.inject(AlertService) as AlertService;
    const alertServiceSpy = spyOn(alertService, 'addAlert');

    const vacanciesAndTurnoverService = injector.inject(VacanciesAndTurnoverService) as VacanciesAndTurnoverService;

    return {
      ...setupTools,
      component,
      routerSpy,
      workerService,
      deleteWorkerSpy,
      alertServiceSpy,
      vacanciesAndTurnoverService,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it("should show a page heading and the worker's name as caption", async () => {
      const { getByRole, getByTestId } = await setup();

      expect(getByRole('heading', { name: 'Delete staff record' })).toBeTruthy();

      const caption = getByTestId('section-heading');
      expect(caption.textContent).toContain(mockWorker.nameOrId);
    });

    it('should show a list of radio buttons for choosing the reason to delete record', async () => {
      const { getByRole, getByText } = await setup();

      expect(getByText('Select why you want to delete this staff record')).toBeTruthy();
      mockLeaveReasons.forEach(({ reason }) => {
        expect(getByRole('radio', { name: reason })).toBeTruthy();
      });
    });

    it('should show a checkbox to confirm deleting record', async () => {
      const { getByRole } = await setup();

      const checkboxText = /I know that this action will permanently delete/;

      expect(getByRole('checkbox', { name: checkboxText })).toBeTruthy();
    });

    it('should show a red CTA button "Delete this staff record"', async () => {
      const { getByRole } = await setup();

      expect(getByRole('button', { name: 'Delete this staff record' })).toBeTruthy();
    });

    it('should show a textedit box to enter details when "For a reason not listed" is chosen', async () => {
      const { fixture, getByRole, getByTestId } = await setup();

      userEvent.click(getByRole('radio', { name: 'For a reason not listed' }));
      fixture.detectChanges();

      const detailsInput = getByTestId('other-reason-details');
      expect(within(detailsInput).getByRole('textbox')).toBeTruthy();
      expect(detailsInput.className).not.toContain('govuk-radios__conditional--hidden');
    });
  });

  describe('text change depending on whether worker has training and qualifications', () => {
    describe('worker has training and qualifications record', () => {
      it('should warn about the action will permanently delete T&Q records and any certificates', async () => {
        const { getByText } = await setup({ hasAnyTrainingOrQualifications: true });
        const expectedText = `It'll permanently delete this staff record and their training and qualification records (and any certificates) from ASC-WDS.`;
        expect(getByText(expectedText)).toBeTruthy();
      });

      it('should mention about T&Q records in checkbox label text and validation message', async () => {
        const { getByLabelText } = await setup({ hasAnyTrainingOrQualifications: true });
        const expectedText = `I know that this action will permanently delete this staff record and their training and qualification records (and any certificates) from ASC-WDS.`;

        expect(getByLabelText(expectedText)).toBeTruthy();
      });
    });

    describe('worker does not have training and qualifications record', () => {
      it('should only mention about staff record in warning text', async () => {
        const { getByText } = await setup({ hasAnyTrainingOrQualifications: false });
        const expectedText = `It will permanently delete this staff record from ASC-WDS.`;
        expect(getByText(expectedText)).toBeTruthy();
      });

      it('should mention about T&Q records in checkbox label text and validation message', async () => {
        const { getByLabelText } = await setup({ hasAnyTrainingOrQualifications: false });
        const expectedText = `I know that this action will permanently delete this staff record from ASC-WDS.`;

        expect(getByLabelText(expectedText)).toBeTruthy();
      });
    });
  });

  describe('form submit and validations', () => {
    it('should call workerService deleteWorker on submit', async () => {
      const { component, getByRole, deleteWorkerSpy } = await setup();

      userEvent.click(getByRole('checkbox', { name: /I know that/ }));
      userEvent.click(getByRole('radio', { name: mockLeaveReasons[3].reason }));
      userEvent.click(getByRole('button', { name: 'Delete this staff record' }));

      const expectedReason = {
        reason: {
          id: mockLeaveReasons[3].id,
        },
      };

      expect(deleteWorkerSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, expectedReason);
    });

    it('should call deleteWorker with reason being null if user did not select any reason', async () => {
      const { component, getByRole, deleteWorkerSpy } = await setup();

      userEvent.click(getByRole('checkbox', { name: /I know that/ }));
      userEvent.click(getByRole('button', { name: 'Delete this staff record' }));

      expect(deleteWorkerSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, null);
    });

    it('should call deleteWorker with both reason id and detail if user chose "For a reason not listed" and also input some text', async () => {
      const { component, deleteWorkerSpy, fixture, getByRole } = await setup();

      userEvent.click(getByRole('radio', { name: 'For a reason not listed' }));
      userEvent.type(getByRole('textbox'), 'Some very specific reason');
      userEvent.click(getByRole('checkbox', { name: /I know that/ }));
      userEvent.click(getByRole('button', { name: 'Delete this staff record' }));
      fixture.detectChanges();

      expect(deleteWorkerSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        reason: { id: 8, other: 'Some very specific reason' },
      });
    });

    it('should navigate to staff record page and show an alert when worker is successfully deleted and more than one staff record', async () => {
      const { component, getByRole, routerSpy, alertServiceSpy } = await setup();

      userEvent.click(getByRole('checkbox', { name: /I know that/ }));
      userEvent.click(getByRole('button', { name: 'Delete this staff record' }));

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        'delete-another-staff-record',
      ]);

      await routerSpy.calls.mostRecent().returnValue;
      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: `Staff record deleted (${component.worker.nameOrId})`,
      });
    });

    it('should navigate to check this information page and show an alert when worker is successfully deleted and is last staff record', async () => {
      const { component, getByRole, routerSpy, alertServiceSpy } = await setup({ snapshot: { totalNumberOfStaff: 1 } });

      userEvent.click(getByRole('checkbox', { name: /I know that/ }));
      userEvent.click(getByRole('button', { name: 'Delete this staff record' }));

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        'update-workplace-details-after-deleting-staff',
      ]);

      await routerSpy.calls.mostRecent().returnValue;
      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: `Staff record deleted (${component.worker.nameOrId})`,
      });
    });

    it('should clear doYouWantToAddOrDeleteAnswer and clearDoYouWantToDownloadTrainAndQualsAnswer on deletion to ensure no side effects from previous visits to delete another page', async () => {
      const { getByRole, vacanciesAndTurnoverService, workerService } = await setup();

      const clearDoYouWantToAddOrDeleteAnswerSpy = spyOn(
        vacanciesAndTurnoverService,
        'clearDoYouWantToAddOrDeleteAnswer',
      );

      const clearDoYouWantToDownloadTrainAndQualsAnswerSpy = spyOn(
        workerService,
        'clearDoYouWantToDownloadTrainAndQualsAnswer',
      );

      userEvent.click(getByRole('checkbox', { name: /I know that/ }));
      userEvent.click(getByRole('button', { name: 'Delete this staff record' }));

      expect(clearDoYouWantToAddOrDeleteAnswerSpy).toHaveBeenCalled();
      expect(clearDoYouWantToDownloadTrainAndQualsAnswerSpy).toHaveBeenCalled();
    });

    it('should show an error message if confirmation checkbox is not ticked', async () => {
      const { fixture, getByRole, getByText, getAllByText, deleteWorkerSpy } = await setup();
      const expectedErrorMessage =
        'Confirm that you know this action will permanently delete this staff record and their training and qualification records (and any certificates) from ASC-WDS.';

      userEvent.click(getByRole('button', { name: 'Delete this staff record' }));
      fixture.detectChanges();

      expect(getByText('There is a problem')).toBeTruthy();
      expect(getAllByText(expectedErrorMessage)).toHaveSize(2);

      expect(deleteWorkerSpy).not.toHaveBeenCalled();
    });

    it('should show a slight different error message if worker does not have any training and qualifications', async () => {
      const { fixture, getByRole, getByText, getAllByText, deleteWorkerSpy } = await setup({
        hasAnyTrainingOrQualifications: false,
      });
      const expectedErrorMessage =
        'Confirm that you know this action will permanently delete this staff record from ASC-WDS.';

      userEvent.click(getByRole('button', { name: 'Delete this staff record' }));
      fixture.detectChanges();

      expect(getByText('There is a problem')).toBeTruthy();
      expect(getAllByText(expectedErrorMessage)).toHaveSize(2);

      expect(deleteWorkerSpy).not.toHaveBeenCalled();
    });

    it('should show an error message if the text in provide details textbox exceeds the max length allowed', async () => {
      const { fixture, getByRole, getByText, getAllByText, deleteWorkerSpy } = await setup();

      userEvent.click(getByRole('radio', { name: 'For a reason not listed' }));
      fixture.detectChanges();

      const provideDetailsTextbox = getByRole('textbox', { name: 'Provide details (optional)' });
      userEvent.type(provideDetailsTextbox, repeat('a', 501));

      userEvent.click(getByRole('checkbox', { name: /I know that/ }));
      userEvent.click(getByRole('button', { name: 'Delete this staff record' }));
      fixture.detectChanges();

      expect(getByText('There is a problem')).toBeTruthy();
      expect(getAllByText('Provide details must be 500 characters or fewer')).toHaveSize(2);

      expect(deleteWorkerSpy).not.toHaveBeenCalled();
    });
  });
});
