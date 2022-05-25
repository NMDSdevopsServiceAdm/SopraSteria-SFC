import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Alert } from '@core/model/alert.model';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { WorkplaceModule } from '../workplace.module';
import { CheckAnswersComponent } from './check-answers.component';

describe('CheckAnswersComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText, getByTestId } = await render(CheckAnswersComponent, {
      imports: [
        RouterModule,
        WorkplaceModule,
        HttpClientTestingModule,
        SharedModule,
        RouterTestingModule.withRoutes([{ path: 'dashboard', component: DashboardComponent }]),
      ],
      providers: [
        AlertService,
        WindowRef,
        {
          provide: PermissionsService,
          useClass: MockPermissionsService,
        },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: WorkerService, useClass: MockWorkerService },
      ],
    });

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    const alert = injector.inject(AlertService) as AlertService;

    const alertSpy = spyOn(alert, 'addAlert').and.callThrough();

    return {
      component,
      fixture,
      alertSpy,
      routerSpy,
      getByText,
      getAllByText,
      getByTestId,
    };
  }

  it('should render a CheckAnswersComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should display the Establishment name in heading', async () => {
    const { getByTestId, component } = await setup();

    expect(getByTestId('establishmentHeading').innerHTML).toContain(component.establishment.name);
  });

  it('should have link to the workplace on Confirm workplace details button', async () => {
    const { getByText, routerSpy, fixture } = await setup();

    const confirmDetailButton = getByText('Confirm workplace details');
    fireEvent.click(confirmDetailButton);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace' });
  });

  it('should display a confirmation alert when the confirm workplace details button has been clicked', async () => {
    const { getByText, alertSpy, fixture } = await setup();

    const confirmDetailButton = getByText('Confirm workplace details');
    fireEvent.click(confirmDetailButton);
    fixture.detectChanges();

    expect(alertSpy).toHaveBeenCalledWith({
      type: 'success',
      message: `You've confirmed the workplace details that you added`,
    } as Alert);
  });
});
