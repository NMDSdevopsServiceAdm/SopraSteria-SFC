import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
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

describe('MoveWorkerDialog', () => {
  async function setup(role = Roles.Admin, subsidiaries = 2) {
    const component = await render(MoveWorkerDialogComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        UntypedFormBuilder,
        {
          provide: UserService,
          useFactory: MockUserService.factory(subsidiaries, role),
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
        {
          provide: Dialog,
          useValue: Dialog,
        },
        {
          provide: WindowRef,
          useValue: WindowRef,
        },
      ],
    });
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    return {
      component,
      router,
    };
  }

  it('should render a MoveWorkerDialog', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  // The following test doesn't work yet - we struggled to get the auto-suggest component working.
  // Leaving this here to follow up on

  // it('should filter out invalid workplaces for transfer', async () => {
  //   const { component } = await setup();
  //   component.fixture.detectChanges();
  //   const form = component.fixture.componentInstance.form;
  //   form.controls.workplaceNameOrPostCode.setValue('Primary Workplace');
  //   component.fixture.detectChanges();
  //   const text = component.getByText('Subsid Workplace, WA1 1BQ');
  // });
});
