import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
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
      declarations: [HomeTabComponent],
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

    const link = component.getByTestId('add-staff-banner');
    // Assert
    expect(link.innerHTML).toContain('Add staff records');
  });
  it('should show the more staff records banner', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workersCount = 10;
    component.fixture.componentInstance.workplace.numberOfStaff = 9;

    component.fixture.detectChanges();

    const moreRecords = component.getByTestId('morerecords');
    // Assert
    expect(moreRecords.innerHTML).toContain("You've more staff records than staff");
  });
  it('should not show the more staff records banner if there are less staff records', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workersCount = 10;
    component.fixture.componentInstance.workplace.numberOfStaff = 11;

    component.fixture.detectChanges();

    const moreRecords = component.queryAllByTestId('morerecords');
    // Assert
    expect(moreRecords.length).toEqual(0);
  });
  it('should not show the more staff records banner if there are equal staff records', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workersCount = 10;
    component.fixture.componentInstance.workplace.numberOfStaff = 10;

    component.fixture.detectChanges();

    const moreRecords = component.queryAllByTestId('morerecords');
    // Assert
    expect(moreRecords.length).toEqual(0);
  });
  it('should not show the more staff records banner if the user does not have persmission to viewListOfWorkers', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workersCount = 11;
    component.fixture.componentInstance.workplace.numberOfStaff = 10;

    component.fixture.componentInstance.canViewListOfWorkers = false;

    component.fixture.detectChanges();

    const moreRecords = component.queryAllByTestId('morerecords');
    // Assert
    expect(moreRecords.length).toEqual(0);
  });
  it('should contain the workplace and worker numbers', async () => {
    // Arrange
    const { component } = await setup();
    // Act
    component.fixture.componentInstance.workersCount = 14;
    component.fixture.componentInstance.workplace.numberOfStaff = 11;

    component.fixture.detectChanges();

    const moreRecords = component.getByTestId('morerecords');
    // Assert
    expect(moreRecords.innerHTML).toContain(String(component.fixture.componentInstance.workersCount));
    expect(moreRecords.innerHTML).toContain(String(component.fixture.componentInstance.workplace.numberOfStaff));
    expect(moreRecords.innerHTML).toContain(
      String(
        component.fixture.componentInstance.workersCount - component.fixture.componentInstance.workplace.numberOfStaff,
      ),
    );
  });
});
