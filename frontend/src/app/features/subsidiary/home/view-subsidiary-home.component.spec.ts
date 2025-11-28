import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BenchmarksResponse } from '@core/model/benchmarks-v2.model';
import { Roles } from '@core/model/roles.enum';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { BenchmarksV2Service } from '@core/services/benchmarks-v2.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { UserService } from '@core/services/user.service';
import { WindowToken } from '@core/services/window';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { NewArticleListComponent } from '@features/articles/new-article-list/new-article-list.component';
import { NewDashboardHeaderComponent } from '@shared/components/new-dashboard-header/dashboard-header.component';
import { SummarySectionComponent } from '@shared/components/summary-section/summary-section.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { Establishment } from '../../../../mockdata/establishment';
import { ViewSubsidiaryHomeComponent } from './view-subsidiary-home.component';

const MockWindow = {
  dataLayer: {
    push: () => {
      return;
    },
  },
};

describe('ViewSubsidiaryHomeComponent', () => {
  const setup = async (overrides: any = {}) => {
    const cqcStatusMatch = overrides?.cqcStatusMatch ?? true;
    const establishment = overrides?.establishment ?? Establishment;
    const comparisonDataAvailable = overrides?.comparisonDataAvailable ?? true;
    const noOfWorkplaces = overrides?.noOfWorkplaces ?? 9;

    const workers = [workerBuilder(), workerBuilder(), workerBuilder()] as Worker[];
    const listOfAllWorkers = overrides?.listOfAllWorkers ?? workers;
    const localStorageSetSpy = spyOn(localStorage, 'setItem');

    const setupTools = await render(ViewSubsidiaryHomeComponent, {
      imports: [SharedModule, RouterModule],
      providers: [
        WindowRef,
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canViewEstablishment', 'canViewListOfWorkers']),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(1, Roles.Admin),
          deps: [HttpClient],
        },
        {
          provide: BenchmarksV2Service,
          useValue: {
            benchmarksData: {
              newBenchmarks: {
                meta: comparisonDataAvailable
                  ? { workplaces: noOfWorkplaces, staff: 4, localAuthority: 'Test LA' }
                  : { workplaces: 0, staff: 0, localAuthority: 'Test LA' },
              } as BenchmarksResponse,
            },
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                establishment: establishment,
                workers: {
                  workersCreatedDate: [],
                  workerCount: 0,
                  trainingCounts: {} as TrainingCounts,
                  workersNotCompleted: [],
                  listOfAllWorkers,
                },
                cqcStatusCheck: { cqcStatusMatch },
              },
            },
            queryParams: of({ view: null }),
            url: of(null),
          },
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        { provide: WindowToken, useValue: MockWindow },
      provideHttpClient(), provideHttpClientTesting(),],
      declarations: [NewDashboardHeaderComponent, NewArticleListComponent, SummarySectionComponent],
      componentProperties: {
        subsidiaryWorkplace: establishment,
        canViewListOfWorkers: true,
        canViewEstablishment: true,
      },
      schemas: [NO_ERRORS_SCHEMA],
    });

    const component = setupTools.fixture.componentInstance;

    const parentsRequestService = TestBed.inject(ParentRequestsService);

    const tabsService = TestBed.inject(TabsService);
    const tabsServiceSpy = spyOnProperty(tabsService, 'selectedTab', 'set');

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      ...setupTools,
      component,
      parentsRequestService,
      tabsServiceSpy,
      routerSpy,
      localStorageSetSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show articles list', async () => {
    const { getByTestId } = await setup();
    expect(getByTestId('article-list')).toBeTruthy();
  });

  describe('Other links', () => {
    describe('Get your ASC-WDS certificate link', () => {
      it('should render the link with the correct href', async () => {
        const { getByText } = await setup();
        const link = getByText('Get your ASC-WDS certificate');
        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual('/asc-wds-certificate');
      });
    });

    describe('Bulk upload your data', () => {
      it('should not render the link when can bulk upload is false', async () => {
        const { queryByText, component, fixture } = await setup();

        component.canBulkUpload = false;
        fixture.detectChanges();

        expect(queryByText('Bulk upload your data')).toBeFalsy();
      });
    });

    describe('Does your data meet funding requirements link', () => {
      it('should not render the link in sub pages', async () => {
        const { queryByText, component, fixture } = await setup();

        expect(queryByText('Does your data meet funding requirements?')).toBeFalsy();
      });

      it('should still not render the link when view reports is true', async () => {
        const { queryByText, component, fixture } = await setup();
        component.canViewReports = true;
        fixture.detectChanges();
        expect(queryByText('Does your data meet WDF requirements?')).toBeFalsy();
      });
    });

    describe('About ASC-WDS link', () => {
      it('should render the link with the correct href', async () => {
        const { getByText } = await setup();
        const link = getByText('About ASC-WDS');
        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual('/about-ascwds');
      });
    });
  });

  describe('cards', () => {
    describe('Benchmarks', () => {
      describe('Where main service is one of the big 3', async () => {
        const establishment = {
          ...Establishment,
          mainService: {
            ...Establishment.mainService,
            reportingID: 8,
          },
          isRegulated: true,
        };

        it('should show the benchmarks card text non pluralised if there is only one workplace in the comparison data', async () => {
          const { getByText } = await setup({
            cqcStatusMatch: false,
            establishment,
            noOfWorkplaces: 1,
          });

          const benchmarksCardText = getByText('There is 1 workplace providing day care and day services in Test LA.');

          expect(benchmarksCardText).toBeTruthy();
        });

        it('without comparison data, should show a card with a link that takes you to the benchmarks tab', async () => {
          const { getByText, tabsServiceSpy } = await setup({
            cqcStatusMatch: false,
            establishment,
            comparisonDataAvailable: false,
          });

          const benchmarksLink = getByText('See how you compare against other workplaces');
          const benchmarksCardText = getByText(
            `Benchmarks can show how you're doing when it comes to pay, recruitment and retention.`,
          );
          fireEvent.click(benchmarksLink);

          expect(true).toBeTruthy();
          expect(benchmarksLink).toBeTruthy();
          expect(benchmarksCardText).toBeTruthy();
          expect(tabsServiceSpy).toHaveBeenCalledWith('benchmarks');
        });

        const testCases = [1, 2, 8];
        for (const serviceType of testCases) {
          const establishment = {
            ...Establishment,
            mainService: {
              ...Establishment.mainService,
              reportingID: serviceType,
            },
            isRegulated: true,
          };

          it('with comparison data, should show a card with a link that takes you to the benchmarks tab', async () => {
            const { getByText, tabsServiceSpy } = await setup({ cqcStatusMatch: false, establishment });

            const benchmarksLink = getByText(
              'See how your pay, recruitment and retention compares against other workplaces',
            );
            const benchmarksCardText = getByText(
              'There are 9 workplaces providing day care and day services in Test LA.',
            );
            fireEvent.click(benchmarksLink);

            expect(benchmarksLink).toBeTruthy();
            expect(benchmarksCardText).toBeTruthy();
            expect(tabsServiceSpy).toHaveBeenCalledWith('benchmarks');
          });
        }
      });

      describe('Where establishment is not big 3', async () => {
        const establishment = {
          ...Establishment,
          mainService: {
            ...Establishment.mainService,
            reportingID: 5,
          },
        };

        it('should show a card with a link that takes you to the benchmarks tab', async () => {
          const { getByText, tabsServiceSpy } = await setup({ cqcStatusMatch: false, establishment });

          const benchmarksLink = getByText('See how you compare against other workplaces');
          const benchmarksCardText = getByText('There are 9 workplaces providing adult social care in Test LA.');
          fireEvent.click(benchmarksLink);

          expect(benchmarksLink).toBeTruthy();
          expect(benchmarksCardText).toBeTruthy();
          expect(tabsServiceSpy).toHaveBeenCalledWith('benchmarks');
        });

        it('should show the benchmarks card text non pluralised if there is only one workplace in the comparison data', async () => {
          const { getByText } = await setup({ cqcStatusMatch: false, establishment, noOfWorkplaces: 1 });

          const benchmarksCardText = getByText('There is 1 workplace providing adult social care in Test LA.');

          expect(benchmarksCardText).toBeTruthy();
        });

        it('without comparison data, should show a card with a link that takes you to the benchmarks tab', async () => {
          const { getByText, tabsServiceSpy } = await setup({
            cqcStatusMatch: false,
            establishment,
            comparisonDataAvailable: false,
          });

          const benchmarksLink = getByText('See how you compare against other workplaces');
          const benchmarksCardText = getByText(
            `Benchmarks can show how you're doing when it comes to pay, recruitment and retention.`,
          );
          fireEvent.click(benchmarksLink);

          expect(benchmarksLink).toBeTruthy();
          expect(benchmarksCardText).toBeTruthy();
          expect(tabsServiceSpy).toHaveBeenCalledWith('benchmarks');
        });
      });
    });

    it('should show a card with a link that takes you to the benefits bundle page', async () => {
      const { getByText } = await setup();

      const benefitsBundleLink = getByText('View the ASC-WDS Benefits Bundle');

      expect(benefitsBundleLink).toBeTruthy();
      expect(benefitsBundleLink.getAttribute('href')).toBe('/benefits-bundle');
    });
  });

  describe('summary', () => {
    it('should show summary box', async () => {
      const { getByTestId } = await setup();

      const summaryBox = getByTestId('summaryBox');

      expect(summaryBox).toBeTruthy();
    });

    describe('workplace summary section', () => {
      it('should take you to the workplace tab when clicking the workplace link', async () => {
        const { getByText, tabsServiceSpy } = await setup();

        const workplaceLink = getByText('Workplace');

        fireEvent.click(workplaceLink);
        expect(tabsServiceSpy).toHaveBeenCalledWith('workplace');
      });

      it('should show a warning link which should navigate to the workplace tab', async () => {
        const establishment = { ...Establishment, showAddWorkplaceDetailsBanner: true };
        const { getByText, tabsServiceSpy } = await setup({
          cqcStatusMatch: false,
          establishment,
        });

        const link = getByText('Add more details to your workplace');

        expect(link).toBeTruthy();
        fireEvent.click(link);
        expect(tabsServiceSpy).toHaveBeenCalledWith('workplace');
      });
    });

    describe('staff records summary section', () => {
      it('should show staff records link and take you to the staff records tab', async () => {
        const { getByText, tabsServiceSpy } = await setup();

        const staffRecordsLink = getByText('Staff records');
        fireEvent.click(staffRecordsLink);

        expect(tabsServiceSpy).toHaveBeenCalledWith('staff-records');
      });
    });

    describe('training and qualifications summary section', () => {
      it('should show training and qualifications link that take you the training and qualifications tab', async () => {
        const { getByText, tabsServiceSpy } = await setup();

        const trainingAndQualificationsLink = getByText('Training and qualifications');
        fireEvent.click(trainingAndQualificationsLink);

        expect(tabsServiceSpy).toHaveBeenCalledWith('training-and-qualifications');
      });
    });
  });

  describe('should prep for individual staff record pagination', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should store a list of all worker ids in localstorage', async () => {
      const eighteenWorkers = Array(18)
        .fill(null)
        .map((_) => workerBuilder()) as Worker[];
      const overrides = { listOfAllWorkers: eighteenWorkers };

      const { localStorageSetSpy } = await setup(overrides);

      const expectedStaffRecordIds = JSON.stringify(eighteenWorkers.map((worker) => worker.uid));

      expect(localStorageSetSpy.calls.allArgs()).toContain(['ListOfWorkers', expectedStaffRecordIds]);
    });
  });
});