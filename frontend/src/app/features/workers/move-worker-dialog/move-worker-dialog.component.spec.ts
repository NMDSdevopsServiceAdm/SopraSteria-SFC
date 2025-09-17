import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { Roles } from '@core/model/roles.enum';
import { AlertService } from '@core/services/alert.service';
import { Dialog, DIALOG_DATA } from '@core/services/dialog.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockUserService } from '@core/test-utils/MockUserService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { MoveWorkerDialogComponent } from './move-worker-dialog.component';
import userEvent from '@testing-library/user-event';

fdescribe('MoveWorkerDialog', () => {
  async function setup(overrides: any = {}) {
    const role = overrides?.role ?? Roles.Admin;
    const numberOfSubsidiaries = overrides?.numberOfSubsidiaries ?? 2;

    const setupTools = await render(MoveWorkerDialogComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, ReactiveFormsModule],
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
            worker: {},
            workplace: { uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd' },
            primaryWorkplaceUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
          },
        },
        WindowRef,
        {
          provide: Dialog,
          useValue: Dialog,
        },
        provideRouter([]),
      ],
    });
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
      router,
    };
  }

  it('should render a MoveWorkerDialog', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show an error message when user did not enter the workplace name or postcode', async () => {
    const { getByText, getAllByText, fixture } = await setup();

    const expectedErrorMessage = 'Enter workplace name or post code.';

    userEvent.click(getByText('Transfer'));

    fixture.detectChanges();

    expect(getByText('There is a problem')).toBeTruthy();
    expect(getAllByText(expectedErrorMessage)).toHaveSize(2);
  });

  it('should show an error message when user entered an invalid workplace name / postcode', async () => {
    const { getByText, getAllByText, getByLabelText, fixture } = await setup();

    const expectedErrorMessage = 'Enter correct workplace name or post code.';

    const inputBox = getByLabelText('Enter a workplace name or postcode');
    userEvent.type(inputBox, 'some non exist workplace name');
    userEvent.click(getByText('Transfer'));

    fixture.detectChanges();

    expect(getByText('There is a problem')).toBeTruthy();
    expect(getAllByText(expectedErrorMessage)).toHaveSize(2);
  });
});
