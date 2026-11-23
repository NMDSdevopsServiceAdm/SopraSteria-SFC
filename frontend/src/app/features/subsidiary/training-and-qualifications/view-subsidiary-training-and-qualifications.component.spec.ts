import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockRouter } from '@core/test-utils/MockRouter';
import { MockTrainingCategoryService } from '@core/test-utils/MockTrainingCategoriesService';
import { MockTrainingService } from '@core/test-utils/MockTrainingService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ViewSubsidiaryTrainingAndQualificationsComponent } from './view-subsidiary-training-and-qualifications.component';

describe('ViewSubsidiaryTrainingAndQualificationsComponent', () => {
  const setup = async (override: any = {}) => {
    const workers = override?.withWorkers && ([workerBuilder(), workerBuilder()] as Worker[]);
    const establishment = establishmentBuilder() as Establishment;
    const permissions = override.permissions ?? ['canEditWorker'];

    const routerSpy = jasmine.createSpy().and.returnValue(Promise.resolve(true));

    const setupTools = await render(ViewSubsidiaryTrainingAndQualificationsComponent, {
      imports: [SharedModule, RouterModule],
      providers: [
        WindowRef,
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: TrainingCategoryService,
          useClass: MockTrainingCategoryService,
        },
        {
          provide: TrainingService,
          useClass: MockTrainingService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(permissions),
          // deps: [HttpClient, Router, UserService],
        },
        { provide: Router, useFactory: MockRouter.factory({ navigate: routerSpy }) },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                establishment,
                workers: {
                  workers: workers,
                  workerCount: workers.length,
                  trainingCounts: {
                    totalRecords: override?.totalRecords,
                  } as TrainingCounts,
                },
              },
              queryParamMap: { get: () => null },
            },
            queryParamMap: { get: () => null },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
      routerSpy,
    };
  };

  it('should create', async () => {
    const override = {
      withWorkers: true,
      totalRecords: 4,
      permissions: ['canViewWorker', 'canEditWorker'],
    };
    const { component } = await setup(override);

    expect(component).toBeTruthy();
  });

  it('should redirect to "Manage training and qualification records" page if user has no edit right', async () => {
    const { routerSpy } = await setup({
      withWorkers: true,
      totalRecords: 4,
      permissions: ['canViewWorker'],
    });

    expect(routerSpy).toHaveBeenCalled();
  });
});
