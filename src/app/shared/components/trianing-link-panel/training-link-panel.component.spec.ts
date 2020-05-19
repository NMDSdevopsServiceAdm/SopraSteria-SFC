import { DashboardComponent } from '@features/dashboard/dashboard.component';
import { render, within } from '@testing-library/angular';
import { HomeTabComponent } from '@features/dashboard/home-tab/home-tab.component';
import { SharedModule } from '@shared/shared.module';
import { Router, RouterModule } from '@angular/router';
import { WindowRef } from '@core/services/window.ref';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockNotificationsService } from '@core/test-utils/MockNotificationsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { HttpClient } from '@angular/common/http';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { getTestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { TrainingLinkPanelComponent } from '@shared/components/trianing-link-panel/trianing-link-panel.component.component';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';

describe('TrainingLinkPanelComponent', () => {
  async function setup() {
    const component =  await render(TrainingLinkPanelComponent, {
      imports: [
        RouterModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService
        },
        {
          provide: WorkerService,
          useClass: MockWorkerService
        }
      ]
    });

    const injector = getTestBed();
    const establishmentService = injector.get(EstablishmentService) as EstablishmentService;
    const router = injector.get(Router) as Router;

    return {
      component,
      establishmentService
    };
  }

  it('should render a TrainingLinkPanelComponent', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the latest date of any training record (1/1/20)', async () => {
    const { component } = await setup();

    component.getByText('Updated 1 January 2020');
  });
});

