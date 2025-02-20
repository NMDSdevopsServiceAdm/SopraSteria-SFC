import { render } from '@testing-library/angular';
import { ViewSubsidiaryTrainingAndQualificationsComponent } from './view-subsidiary-training-and-qualifications.component';
import { WindowRef } from '@core/services/window.ref';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockTrainingCategoryService } from '@core/test-utils/MockTrainingCategoriesService';
import { NewDashboardHeaderComponent } from '@shared/components/new-dashboard-header/dashboard-header.component';
import { SharedModule } from '@shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { TrainingService } from '@core/services/training.service';
import { MockTrainingService } from '@core/test-utils/MockTrainingService';

describe('ViewSubsidiaryTrainingAndQualificationsComponent', () => {
  const setup = async (withWorkers = true, totalRecords = 4) => {
    const workers = withWorkers && ([workerBuilder(), workerBuilder()] as Worker[]);
    const establishment = establishmentBuilder() as Establishment;
    const setupTools = await render(ViewSubsidiaryTrainingAndQualificationsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [NewDashboardHeaderComponent],
      providers: [
        WindowRef,
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
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
          useClass: MockPermissionsService,
        },
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
                    totalRecords,
                  } as TrainingCounts,
                },
              },
              queryParamMap: { get: () => null },
            },
          },
        },
      ],
    });

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
