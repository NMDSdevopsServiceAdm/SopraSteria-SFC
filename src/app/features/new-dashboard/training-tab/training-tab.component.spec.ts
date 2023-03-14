import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { NewDashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { NewTrainingTabComponent } from './training-tab.component';

fdescribe('NewTrainingTabComponent', () => {
  const setup = async (withWorkers = true, totalRecords = 4) => {
    const workers = withWorkers && ([workerBuilder(), workerBuilder()] as Worker[]);
    const establishment = establishmentBuilder() as Establishment;

    const { fixture, getByTestId } = await render(NewTrainingTabComponent, {
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
        trainingCounts: {
          totalRecords,
        } as TrainingCounts,
        workers: workers,
        workerCount: workers.length,
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByTestId,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the noStaffRecords content if there are no staff records', async () => {
    const { getByTestId } = await setup(false);

    expect(getByTestId('no-staff-records')).toBeTruthy();
  });
});
