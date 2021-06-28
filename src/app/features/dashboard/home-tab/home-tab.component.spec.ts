import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowToken } from '@core/services/window';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import {
  StaffMismatchBannerComponent,
} from '@features/dashboard/home-tab/staff-mismatch-banner/staff-mismatch-banner.component';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { Establishment } from '../../../../mockdata/establishment';
import { StartComponent } from '../../workplace/start/start.component';
import { WorkplaceRoutingModule } from '../../workplace/workplace-routing.module';
import { WorkplaceModule } from '../../workplace/workplace.module';
import { HomeTabComponent } from './home-tab.component';

const MockWindow = {
  dataLayer: {
    push: () => {
      return;
    },
  },
};

describe('HomeTabComponent', () => {
  async function setup() {
    const component = await render(HomeTabComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule.withRoutes([
          { path: 'workplace/4698f4a4-ab82-4906-8b0e-3f4972375927/start', component: StartComponent },
        ]),
        WorkplaceModule,
        WorkplaceRoutingModule,
        HttpClientTestingModule,
      ],
      declarations: [HomeTabComponent, StaffMismatchBannerComponent],
      providers: [
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(1, true),
          deps: [HttpClient],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        { provide: WindowToken, useValue: MockWindow },
      ],
    });

    component.fixture.componentInstance.canEditEstablishment = true;
    component.fixture.componentInstance.workplace = Establishment;
    component.fixture.componentInstance.workplace.employerType = null;
    component.fixture.detectChanges();

    return {
      component,
    };
  }

  it('should create', async () => {
    const { component } = await setup();

    component.fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('has Add Workplace Information', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    const link = component.getByTestId('add-workplace-info');

    // Assert
    expect(link.innerHTML).toContain('Add workplace information');
    expect(link.getAttribute('href')).toContain('start');
  });
  it('Add staff banner has correct title', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.updateStaffRecords = true;
    component.fixture.detectChanges();

    const link = component.getByTestId('add-staff-banner');
    // Assert
    expect(link.innerHTML).toContain('Add staff records');
  });

  it('should not show the more staff records banner if there are equal staff records', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workerCount = 10;
    component.fixture.componentInstance.workplace.numberOfStaff = 10;
    component.fixture.componentInstance.canViewListOfWorkers = true;
    component.fixture.componentInstance.workplace.eightWeeksFromFirstLogin = new Date('1970-01-01').toString();

    component.fixture.detectChanges();

    const childDebugElement = component.fixture.debugElement.query(By.directive(StaffMismatchBannerComponent));
    // Assert
    expect(childDebugElement).toBeFalsy();
  });
  it('should  show the more staff records banner if the user does  have permissions to viewListOfWorkers', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workerCount = 11;
    component.fixture.componentInstance.workplace.numberOfStaff = 10;
    component.fixture.componentInstance.workplace.eightWeeksFromFirstLogin = new Date('1970-01-01').toString();

    component.fixture.componentInstance.canViewListOfWorkers = true;

    component.fixture.detectChanges();
    const childDebugElement = component.fixture.debugElement.query(By.directive(StaffMismatchBannerComponent));
    // Assert
    expect(childDebugElement).toBeTruthy();
  });

  it('should not show the more staff records banner if the user doesnt  have permissions to addWorker', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workerCount = 11;
    component.fixture.componentInstance.workplace.numberOfStaff = 10;
    component.fixture.componentInstance.workplace.eightWeeksFromFirstLogin = new Date('1970-01-01').toString();

    component.fixture.componentInstance.canViewListOfWorkers = true;
    component.fixture.componentInstance.canAddWorker = false;

    component.fixture.detectChanges();
    const childDebugElement = component.fixture.debugElement.query(By.directive(StaffMismatchBannerComponent));
    // Assert
    expect(childDebugElement).toBeFalsy();
  });

  it('should not show the staff mismatch banner if no workers have been added', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workerCount = 0;
    component.fixture.componentInstance.workplace.numberOfStaff = 10;
    component.fixture.componentInstance.workplace.eightWeeksFromFirstLogin = new Date('1970-01-01').toString();

    component.fixture.componentInstance.canViewListOfWorkers = true;
    component.fixture.componentInstance.canAddWorker = true;

    component.fixture.detectChanges();
    const childDebugElement = component.fixture.debugElement.query(By.directive(StaffMismatchBannerComponent));
    // Assert
    expect(childDebugElement).toBeFalsy();
  });

  it('should show the staff mismatch banner if the eight weeks date is in the past', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workerCount = 12;
    component.fixture.componentInstance.workplace.numberOfStaff = 10;
    component.fixture.componentInstance.workplace.eightWeeksFromFirstLogin = new Date('1970-01-01').toString();

    component.fixture.componentInstance.canViewListOfWorkers = true;
    component.fixture.componentInstance.canAddWorker = true;

    component.fixture.detectChanges();
    const childDebugElement = component.fixture.debugElement.query(By.directive(StaffMismatchBannerComponent));
    // Assert
    expect(childDebugElement).toBeTruthy();
  });
  it('should not show the staff mismatch banner if the eight weeks date is in the future', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workerCount = 12;
    component.fixture.componentInstance.workplace.numberOfStaff = 10;
    component.fixture.componentInstance.workplace.eightWeeksFromFirstLogin = new Date('2999-01-01').toString();

    component.fixture.componentInstance.canViewListOfWorkers = true;
    component.fixture.componentInstance.canAddWorker = true;

    component.fixture.detectChanges();
    const childDebugElement = component.fixture.debugElement.query(By.directive(StaffMismatchBannerComponent));
    // Assert
    expect(childDebugElement).toBeFalsy();
  });
});
