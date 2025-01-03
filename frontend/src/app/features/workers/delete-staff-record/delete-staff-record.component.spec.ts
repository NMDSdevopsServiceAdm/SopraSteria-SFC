import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';
import { mockLeaveReasons, MockWorkerServiceWithUpdateWorker, workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { DeleteStaffRecordComponent } from './delete-staff-record.component';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '@core/services/window.ref';
import userEvent from '@testing-library/user-event';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { of } from 'rxjs';

fdescribe('DeleteStaffRecordComponent', () => {
  const mockWorker = workerBuilder() as Worker;

  const setup = async (overrides: any = {}) => {
    const setupTools = await render(DeleteStaffRecordComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
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

    return {
      ...setupTools,
      component,
      routerSpy,
      workerService,
      deleteWorkerSpy,
      alertServiceSpy,
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

      const checkboxText =
        'I know that this action will permanently delete this staff record and any training and qualification records (and certificates) related to it.';

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

    it('should call deleteWorker with reason as null if user did not select a particular reason', async () => {
      const { component, getByRole, deleteWorkerSpy } = await setup();

      userEvent.click(getByRole('checkbox', { name: /I know that/ }));
      userEvent.click(getByRole('button', { name: 'Delete this staff record' }));

      expect(deleteWorkerSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, null);
    });

    it('should navigate to staff record page and show an alert when worker is successfully deleted', async () => {
      const { component, getByRole, routerSpy, alertServiceSpy } = await setup();

      userEvent.click(getByRole('checkbox', { name: /I know that/ }));
      userEvent.click(getByRole('button', { name: 'Delete this staff record' }));

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'staff-records' });

      await routerSpy.calls.mostRecent().returnValue;
      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: `${component.worker.nameOrId} has been deleted`,
      });
    });

    it('should show an error message if confirmation checkbox is not ticked', async () => {
      const { fixture, getByRole, getByText, getAllByText, deleteWorkerSpy } = await setup();
      const expectedErrorMessage =
        'Confirm that you know this action will permanently delete this staff record and any training and qualification records (and certificates) related to it';

      userEvent.click(getByRole('button', { name: 'Delete this staff record' }));
      fixture.detectChanges();

      expect(getByText('There is a problem')).toBeTruthy();
      expect(getAllByText(expectedErrorMessage)).toHaveSize(2);

      expect(deleteWorkerSpy).not.toHaveBeenCalled();
    });
  });
});
