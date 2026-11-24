import { provideHttpClient } from '@angular/common/http';
import { fireEvent, render } from '@testing-library/angular';
import { ManageTrainingAndQualificationRecordsComponent } from './manage-training-and-qualification-records.component';
import { WindowRef } from '@core/services/window.ref';
import { provideHttpClientTesting } from '@angular/common/http/testing';
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
import { HttpClient } from '@angular/common/http';
import { UserService } from '@core/services/user.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';

describe('ManageTrainingAndQualificationRecords', () => {
  const setup = async (override: any = {}) => {
    const workers = override?.workers ?? ([workerBuilder(), workerBuilder()] as Worker[]);
    const establishment = establishmentBuilder() as Establishment;
    const trainingCourses = override?.trainingCourses ?? [];
    const totalRecords = override?.totalRecords ?? 4;

    const setupTools = await render(ManageTrainingAndQualificationRecordsComponent, {
      imports: [SharedModule, RouterModule],
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
          useFactory: MockPermissionsService.factory(override.permissions),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                establishment,
                trainingCourses,
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
            queryParamMap: { get: () => null },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      componentProperties: {
        canEditEstablishment: override.canEditEstablishment,
      },
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
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show number of training and qualifications records and staff', async () => {
    const { component, getByText } = await setup({ totalRecords: 4 });

    expect(getByText('Manage training and qualification records (4)')).toBeTruthy();

    component.workers.forEach((worker) => {
      expect(getByText(worker.nameOrId)).toBeTruthy();
    });
  });

  it('should show a message if there are workers with no records', async () => {
    const { getByText } = await setup({ totalRecords: 0 });
    const noTandQRecordsMessage = getByText(
      "You've not added any training or qualification records yet. Many care providers store their staff training and qualification records in ASC-WDS and get alerts when training is about to expire.",
    );

    expect(noTandQRecordsMessage).toBeTruthy();
  });

  it('should show a link to add staff records if there is no staff and should navigateToStaffRecords', async () => {
    const { fixture, getByText, routerSpy } = await setup({ workers: [], totalRecords: 0 });

    const addStaffLink = getByText('add some staff records');
    fireEvent.click(addStaffLink);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['dashboard'], { fragment: 'staff-records' });
  });

  it('renders the training link panel', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('trainingLinkPanel')).toBeTruthy();
  });

  it('should render the training info panel if there are workers', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('trainingInfoPanel')).toBeTruthy();
  });

  it('should show an alert message if there are no training records', async () => {
    const { getByTestId } = await setup({ totalRecords: 0 });

    expect(getByTestId('noTandQRecords')).toBeTruthy();
  });

  it('should not render the training info panel if there are no workers', async () => {
    const { queryByTestId } = await setup({ workers: [] });

    expect(queryByTestId('trainingInfoPanel')).toBeFalsy();
  });

  it('should display the noStaffRecords content if there are no staff records', async () => {
    const { getByTestId } = await setup({ workers: [] });

    expect(getByTestId('no-staff-records')).toBeTruthy();
  });

  describe('updateSortByValue', () => {
    it('should update the staff sort by value when called with staff-summary section', async () => {
      const { component } = await setup();

      const properties = { section: 'staff-summary', sortByValue: 'trainingExpiresSoon' };
      component.updateSortByValue(properties);

      expect(component.staffSortByValue).toEqual('trainingExpiresSoon');
      expect(component.trainingSortByValue).toEqual('0_expired');
    });

    it('should update the training sort by value when called with training-summary section', async () => {
      const { component } = await setup();

      const properties = { section: 'training-summary', sortByValue: '1_expires_soon' };
      component.updateSortByValue(properties);

      expect(component.trainingSortByValue).toEqual('1_expires_soon');
      expect(component.staffSortByValue).toEqual('trainingExpired');
    });
  });

  describe('staff and training views when there are workers', () => {
    it('should render the tab bar to show different views', async () => {
      const { getByText } = await setup();

      expect(getByText('Staff')).toBeTruthy();
      expect(getByText('Training')).toBeTruthy();
    });

    it('shoud render a tab bar with the default table showing t and qs by staff name', async () => {
      const { getByTestId, queryByTestId } = await setup();

      expect(getByTestId('trainingAndQualsSummary')).toBeTruthy();
      expect(queryByTestId('trainingAndQualsCategories')).toBeFalsy();
    });

    it('shoud render the t and qs by training when the training link is clicked', async () => {
      const { component, fixture, getByText, getByTestId, queryByTestId } = await setup();

      component.trainingCategories = [
        {
          category: 'training',
          id: 1,
          isMandatory: false,
          seq: 10,
          training: [],
        },
      ];

      const trainingLink = getByText('Training');
      fireEvent.click(trainingLink);
      fixture.detectChanges();

      expect(getByTestId('trainingAndQualsCategories')).toBeTruthy();
      expect(queryByTestId('trainingAndQualsSummary')).toBeFalsy();
    });

    it('should render the t and qs by staff when clicking on the staff link', async () => {
      const { component, fixture, getByText, getByTestId, queryByTestId } = await setup();

      component.trainingCategories = [
        {
          category: 'training',
          id: 1,
          isMandatory: false,
          seq: 10,
          training: [],
        },
      ];

      const trainingLink = getByText('Training');
      const staffLink = getByText('Staff');
      fireEvent.click(trainingLink);
      fixture.detectChanges();
      fireEvent.click(staffLink);
      fixture.detectChanges();

      expect(getByTestId('trainingAndQualsSummary')).toBeTruthy();
      expect(queryByTestId('trainingAndQualsCategories')).toBeFalsy();
    });
  });
});
