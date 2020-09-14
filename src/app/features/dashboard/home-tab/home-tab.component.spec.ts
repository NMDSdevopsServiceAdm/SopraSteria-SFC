import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { Establishment } from '../../../../mockdata/establishment';
import { StartComponent } from '../../workplace/start/start.component';
import { WorkplaceRoutingModule } from '../../workplace/workplace-routing.module';
import { WorkplaceModule } from '../../workplace/workplace.module';
import { HomeTabComponent } from './home-tab.component';


describe('HomeTabComponent', () => {
  async function setup() {
    const component = await render(HomeTabComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule.withRoutes(
          [{path: 'workplace/4698f4a4-ab82-4906-8b0e-3f4972375927/start', component: StartComponent}]),
        WorkplaceModule,
        WorkplaceRoutingModule,
        HttpClientTestingModule],
      declarations: [
        HomeTabComponent,
      ],
      providers: [
        {
          provide: WorkerService,
          useClass: MockWorkerService
        },
        {
          provide: WindowRef,
          useClass: WindowRef
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
          deps: [HttpClient, Router, UserService]
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(1, true),
          deps: [HttpClient]
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService
        },
      ],
    });

    component.fixture.componentInstance.canEditEstablishment = true;
    component.fixture.componentInstance.workplace = Establishment;
    component.fixture.componentInstance.workplace.employerType = null;
    component.fixture.detectChanges();

    return {
      component
    };
  }

  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show flu jab when can add worker', async () => {
    const { component } = await setup();
    component.fixture.componentInstance.canEditEstablishment = true;
    component.fixture.detectChanges()

    expect(component.queryByTestId('flu-jab'));
  });
  it('should not show flu jab when cant add worker', async () => {
    const { component } = await setup();
    component.fixture.componentInstance.canEditEstablishment = false;
    component.fixture.detectChanges()

    expect(component.queryByTestId('flu-jab')).toBeNull();
  });
  it('has Add Workplace Information', async () => {
    // Arrange
    const { component } = await setup();

    // Act
    const link = component.getByTestId('add-workplace-info');

    // Assert
    expect(link.innerHTML).toContain('Add workplace information');
  });
});
