import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Worker } from '@core/model/worker.model';
import { WorkerService } from '@core/services/worker.service';
import { mockLeaveReasons, MockWorkerServiceWithUpdateWorker, workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { DeleteStaffRecordComponent } from './delete-staff-record.component';
import { AlertService } from '@core/services/alert.service';
import { WindowRef } from '@core/services/window.ref';

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
        AlertService,
        WindowRef,
      ],
    });
    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      ...setupTools,
      component,
      routerSpy,
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
  });
});
