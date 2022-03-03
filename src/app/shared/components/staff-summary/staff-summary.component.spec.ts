import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { establishmentBuilder, workerBuilder } from '../../../../../server/test/factories/models.js';
import { StaffSummaryComponent } from './staff-summary.component';

describe('StaffSummaryComponent', () => {
  async function setup(isWdf = false) {
    const establishment = establishmentBuilder() as Establishment;
    const workers = [workerBuilder(), workerBuilder(), workerBuilder()];

    const component = await render(StaffSummaryComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
          deps: [HttpClient, Router, UserService],
        },
      ],
      componentProperties: {
        workplace: establishment,
        workers: workers,
        wdfView: isWdf,
      },
    });

    return {
      component,
      workers,
    };
  }

  it('should render a StaffSummaryComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the correct information for given workers', async () => {
    const { component, workers } = await setup();

    component.fixture.componentInstance.canEditWorker = true;
    // update one of the fake workers
    workers[0].nameOrId = 'joe mocked';
    workers[0].jobRole = 'fake doctor';
    workers[0].completed = false;
    component.detectChanges();

    expect(component.getByText('joe mocked')).toBeTruthy();
    expect(component.getByText('fake doctor')).toBeTruthy();
    expect(component.getAllByText('Add more details').length).toBe(3);
  });

  it('should put staff meeting WDF at top of table when sorting by WDF requirements (meeting)', async () => {
    const { component } = await setup();
    component.fixture.componentInstance.workers[2].wdfEligible = true;

    component.fixture.componentInstance.sortByColumn('2_meeting');
    const workers = component.fixture.componentInstance.workers;
    component.fixture.detectChanges();

    expect(workers[0].wdfEligible).toEqual(true);
    expect(workers[1].wdfEligible).toEqual(false);
    expect(workers[2].wdfEligible).toEqual(false);
  });

  it('should put staff meeting WDF at bottom of table when sorting by WDF requirements (not meeting)', async () => {
    const { component } = await setup();
    component.fixture.componentInstance.workers[1].wdfEligible = true;

    component.fixture.componentInstance.sortByColumn('2_not_meeting');
    const workers = component.fixture.componentInstance.workers;
    component.fixture.detectChanges();

    expect(workers[0].wdfEligible).toEqual(false);
    expect(workers[1].wdfEligible).toEqual(false);
    expect(workers[2].wdfEligible).toEqual(true);
  });
});
