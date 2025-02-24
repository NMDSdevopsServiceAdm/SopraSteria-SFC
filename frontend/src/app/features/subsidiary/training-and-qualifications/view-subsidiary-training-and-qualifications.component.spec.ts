import { fireEvent, render } from '@testing-library/angular';
import { ViewSubsidiaryTrainingAndQualificationsComponent } from './view-subsidiary-training-and-qualifications.component';
import { WindowRef } from '@core/services/window.ref';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { getTestBed } from '@angular/core/testing';
import { NewTrainingLinkPanelComponent } from '@features/new-dashboard/training-tab/training-link-panel/training-link-panel.component';
import { TrainingInfoPanelComponent } from '@shared/components/training-info-panel/training-info-panel.component';
import { TrainingSelectViewPanelComponent } from '@shared/components/training-select-view-panel/training-select-view-panel.component';
import { TrainingAndQualificationsSummaryComponent } from '@shared/components/training-and-qualifications-summary/training-and-qualifications-summary.component';
import { TrainingAndQualificationsCategoriesComponent } from '@shared/components/training-and-qualifications-categories/training-and-qualifications-categories.component';

describe('ViewSubsidiaryTrainingAndQualificationsComponent', () => {
  const setup = async (override: any = {}) => {
    const workers = override?.withWorkers && ([workerBuilder(), workerBuilder()] as Worker[]);
    const establishment = establishmentBuilder() as Establishment;
    const setupTools = await render(ViewSubsidiaryTrainingAndQualificationsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [
        NewDashboardHeaderComponent,
        NewTrainingLinkPanelComponent,
        TrainingInfoPanelComponent,
        TrainingSelectViewPanelComponent,
        TrainingAndQualificationsSummaryComponent,
        TrainingAndQualificationsCategoriesComponent,
      ],
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
                    totalRecords: override?.totalRecords,
                  } as TrainingCounts,
                },
              },
              queryParamMap: { get: () => null },
            },
            queryParamMap: { get: () => null },
          },
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

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
    };
    const { component } = await setup(override);
    expect(component).toBeTruthy();
  });

  it('should show number of training and qualifications records and staff', async () => {
    const override = {
      withWorkers: true,
      totalRecords: 4,
    };

    const { component, getByText } = await setup(override);

    expect(getByText('Training and qualifications (4)')).toBeTruthy();

    component.workers.forEach((worker) => {
      expect(getByText(worker.nameOrId)).toBeTruthy();
    });
  });

  it('should show a message if there are workers with no records', async () => {
    const override = {
      withWorkers: true,
      totalRecords: 0,
    };

    const { getByTestId, getByText } = await setup(override);
    const noTandQRecords = getByTestId('noTandQRecords');
    const noTandQRecordsMessage = getByText(
      "You've not added any training or qualification records yet. Many care providers store their staff training and qualification records in ASC-WDS and get alerts when training is about to expire.",
    );

    expect(noTandQRecords).toBeTruthy();
    expect(noTandQRecordsMessage).toBeTruthy();
  });

  it('should show a link to add staff records if there is no staff and should navigateToStaffRecords', async () => {
    const override = {
      withWorkers: false,
      totalRecords: 0,
    };

    const { component, fixture, getByTestId, getByText, routerSpy } = await setup(override);

    const addStaffLink = getByText('add some staff records');
    fireEvent.click(addStaffLink);
    fixture.detectChanges();

    expect(getByTestId('no-staff-records')).toBeTruthy();
    expect(routerSpy).toHaveBeenCalledWith(['/subsidiary', component.workplace.uid, 'staff-records']);
  });
});
