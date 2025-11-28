import { of } from 'rxjs';

import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { Workplace } from '@core/model/my-workplaces.model';
import { Roles } from '@core/model/roles.enum';
import { AlertService } from '@core/services/alert.service';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockUserService, subsid1 } from '@core/test-utils/MockUserService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { MoveWorkerDialogComponent } from './move-worker-dialog.component';

describe('MoveWorkerDialog', () => {
  const mockCurrentWorkplaceUid = 'mock-workplace-uid';
  const mockWorkerUid = 'mock-worker-uid';
  const mockWorkerName = 'mock-worker';

  async function setup(overrides: any = {}) {
    const role = overrides?.role ?? Roles.Admin;
    const numberOfSubsidiaries = overrides?.numberOfSubsidiaries ?? 2;
    const parentWorkplaceUid = overrides?.parentWorkplaceUid ?? undefined;

    const setupTools = await render(MoveWorkerDialogComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: UserService,
          useFactory: MockUserService.factory(numberOfSubsidiaries, role),
          deps: [HttpClient],
        },
        AlertService,
        ErrorSummaryService,
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: DIALOG_DATA,
          useValue: {
            worker: { uid: mockWorkerUid, nameOrId: mockWorkerName },
            workplace: {
              uid: mockCurrentWorkplaceUid,
              primaryWorkplaceUid: mockCurrentWorkplaceUid,
              parentUid: parentWorkplaceUid,
            },
          },
        },
        WindowRef,
        {
          provide: Dialog,
          useValue: { close: () => {} },
        },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const workerService = injector.inject(WorkerService) as WorkerService;
    const alertService = injector.inject(AlertService) as AlertService;
    const updateWorkerSpy = spyOn(workerService, 'updateWorker').and.returnValue(of(null));
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    const addAlertSpy = spyOn(alertService, 'addAlert');
    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
      router,
      updateWorkerSpy,
      navigateSpy,
      addAlertSpy,
    };
  }

  it('should render a MoveWorkerDialog', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should trigger autocomplete on input', async () => {
    const { getByText, fixture, getByLabelText } = await setup();

    const validWorkplace = subsid1 as Workplace;
    const expectedAutoCompleteText = `${validWorkplace.name}, ${validWorkplace.postCode}`;

    const inputBox = getByLabelText('Enter a workplace name or postcode');

    userEvent.type(inputBox, validWorkplace.postCode.slice(0, 2));
    fixture.detectChanges();

    expect(getByText(expectedAutoCompleteText)).toBeTruthy();
  });

  describe('on form submit: ', () => {
    it('should show an error message if user did not enter the workplace name or postcode', async () => {
      const { getByText, getAllByText, fixture, updateWorkerSpy } = await setup();

      const expectedErrorMessage = 'Enter workplace name or post code.';

      userEvent.click(getByText('Transfer'));

      fixture.detectChanges();

      expect(getByText('There is a problem')).toBeTruthy();
      expect(getAllByText(expectedErrorMessage)).toHaveSize(2);

      expect(updateWorkerSpy).not.toHaveBeenCalled();
    });

    it('should show an error message if user entered an invalid workplace name / postcode', async () => {
      const { getByText, getAllByText, getByLabelText, fixture, updateWorkerSpy } = await setup();

      const expectedErrorMessage = 'Enter correct workplace name or post code.';

      const inputBox = getByLabelText('Enter a workplace name or postcode');
      userEvent.type(inputBox, 'some non exist workplace name');
      userEvent.click(getByText('Transfer'));

      fixture.detectChanges();

      expect(getByText('There is a problem')).toBeTruthy();
      expect(getAllByText(expectedErrorMessage)).toHaveSize(2);

      expect(updateWorkerSpy).not.toHaveBeenCalled();
    });

    it('should trigger updateWorker and navigation if user has chosen a valid workplace', async () => {
      const { fixture, getByText, getByLabelText, updateWorkerSpy, navigateSpy, addAlertSpy } = await setup();

      const validWorkplace = subsid1 as Workplace;
      const validInput = `${validWorkplace.name}, ${validWorkplace.postCode}`;
      const inputBox = getByLabelText('Enter a workplace name or postcode');
      userEvent.type(inputBox, validInput);
      userEvent.click(getByText('Transfer'));

      await fixture.whenStable();
      expect(updateWorkerSpy).toHaveBeenCalledWith(mockCurrentWorkplaceUid, mockWorkerUid, {
        establishmentId: subsid1.id,
      });
      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'staff-records' });
      expect(addAlertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: `${mockWorkerName} has been moved to ${subsid1.name}.`,
      });
    });

    it('should navigate to subsidairy staff records page if current workplace is a subsidairy', async () => {
      const { fixture, getByText, getByLabelText, updateWorkerSpy, navigateSpy, addAlertSpy } = await setup({
        parentWorkplaceUid: 'mock-parent-workplace-uid',
      });

      const validWorkplace = subsid1 as Workplace;
      const validInput = `${validWorkplace.name}, ${validWorkplace.postCode}`;
      const inputBox = getByLabelText('Enter a workplace name or postcode');
      userEvent.type(inputBox, validInput);
      userEvent.click(getByText('Transfer'));

      await fixture.whenStable();

      expect(updateWorkerSpy).toHaveBeenCalledWith(mockCurrentWorkplaceUid, mockWorkerUid, {
        establishmentId: subsid1.id,
      });
      expect(navigateSpy).toHaveBeenCalledWith(['/subsidiary', mockCurrentWorkplaceUid, 'staff-records']);
      expect(addAlertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: `${mockWorkerName} has been moved to ${subsid1.name}.`,
      });
    });
  });
});
