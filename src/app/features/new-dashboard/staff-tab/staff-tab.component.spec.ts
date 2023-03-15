import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { NewDashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { NewStaffTabComponent } from './staff-tab.component';

describe('NewStaffTabComponent', () => {
  const setup = async (worker = true) => {
    const workerArr = worker ? ([workerBuilder()] as Worker[]) : [];
    const establishment = establishmentBuilder() as Establishment;

    const { fixture, getByTestId, queryByTestId } = await render(NewStaffTabComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: PermissionsService,
          useClass: MockPermissionsService,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
      ],
      declarations: [NewDashboardHeaderComponent],
      componentProperties: {
        workplace: establishment,
        workers: workerArr as Worker[],
        workerCount: workerArr.length,
      },
    });

    const component = fixture.componentInstance;

    const workerService = TestBed.inject(WorkerService) as WorkerService;
    const workerSpy = spyOn(workerService, 'setAddStaffRecordInProgress');

    return {
      component,
      getByTestId,
      queryByTestId,
      workerSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the no staff records section if there are no staff records', async () => {
    const { getByTestId, queryByTestId } = await setup(false);

    expect(getByTestId('no-staff-records')).toBeTruthy();
    expect(queryByTestId('staff-records')).toBeFalsy();
  });

  it('should show the staff records section if there are staff records', async () => {
    const { getByTestId, queryByTestId } = await setup();

    expect(getByTestId('staff-records')).toBeTruthy();
    expect(queryByTestId('no-staff-records')).toBeFalsy();
  });

  it('should call setAddStaffRecordInProgress when initialising component', async () => {
    const { component, workerSpy } = await setup();

    component.ngOnInit();
    expect(workerSpy).toHaveBeenCalledWith(false);
  });
});
