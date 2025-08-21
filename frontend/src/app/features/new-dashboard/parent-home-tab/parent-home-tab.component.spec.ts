import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Meta } from '@core/model/benchmarks.model';
import { Roles } from '@core/model/roles.enum';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { AlertService } from '@core/services/alert.service';
import { ArticlesService } from '@core/services/articles.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { UserService } from '@core/services/user.service';
import { WindowToken } from '@core/services/window';
import { WindowRef } from '@core/services/window.ref';
import { MockArticlesService } from '@core/test-utils/MockArticlesService';
import { MockEstablishmentServiceCheckCQCDetails } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { NewArticleListComponent } from '@features/articles/new-article-list/new-article-list.component';
import { SummarySectionComponent } from '@shared/components/summary-section/summary-section.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { Establishment } from '../../../../mockdata/establishment';
import { NewDashboardHeaderComponent } from '../../../shared/components/new-dashboard-header/dashboard-header.component';
import { ParentHomeTabComponent } from './parent-home-tab.component';

const MockWindow = {
  dataLayer: {
    push: () => {
      return;
    },
  },
};

describe('ParentHomeTabComponent', () => {
  const articleList = MockArticlesService.articleListFactory();
  const articles = MockArticlesService.articlesFactory();

  const setup = async (
    checkCqcDetails = false,
    establishment = Establishment,
    comparisonDataAvailable = true,
    noOfWorkplaces = 9,
    permissions = [],
    canAccessCms = true,
    overrides: any = {},
  ) => {
    const dataLayerPushSpy = jasmine.createSpy();
    const MockWindow = {
      dataLayer: {
        push: dataLayerPushSpy,
      },
    };

    const setupTools = await render(ParentHomeTabComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        WindowRef,
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(permissions),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(1, overrides.userRole ?? Roles.Edit),
          deps: [HttpClient],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                articleList: canAccessCms ? articleList : null,
                articles: canAccessCms ? articles : null,
                workers: {
                  workersCreatedDate: [],
                  workerCount: 0,
                  trainingCounts: {} as TrainingCounts,
                  workersNotCompleted: [],
                },
              },
            },
            queryParams: of({ view: null }),
            url: of(null),
          },
        },
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceCheckCQCDetails.factory(checkCqcDetails),
          deps: [HttpClient],
        },
        { provide: ArticlesService, useClass: MockArticlesService },
        { provide: WindowToken, useValue: MockWindow },
      ],
      declarations: [NewDashboardHeaderComponent, NewArticleListComponent, SummarySectionComponent],
      componentProperties: {
        workplace: establishment,
        meta: comparisonDataAvailable
          ? { workplaces: noOfWorkplaces, staff: 4, localAuthority: 'Test LA' }
          : ({ workplaces: 0, staff: 0, localAuthority: 'Test LA' } as Meta),
        canRunLocalAuthorityReport: false,
        article: { slug: '' },
      },
      schemas: [NO_ERRORS_SCHEMA],
    });

    const component = setupTools.fixture.componentInstance;

    const alertService = TestBed.inject(AlertService);
    const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const parentsRequestService = TestBed.inject(ParentRequestsService);

    const tabsService = TestBed.inject(TabsService);
    const tabsServiceSpy = spyOnProperty(tabsService, 'selectedTab', 'set');

    return {
      ...setupTools,
      component,
      alertServiceSpy,
      parentsRequestService,
      tabsServiceSpy,
      dataLayerPushSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
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
          const { getByText } = await setup(false, establishment, true, 1);

          const benchmarksCardText = getByText('There is 1 workplace providing day care and day services in Test LA.');

          expect(benchmarksCardText).toBeTruthy();
        });

        it('without comparison data, should show a card with a link that takes you to the benchmarks tab', async () => {
          const { getByText, tabsServiceSpy } = await setup(false, establishment, false);

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
            const { getByText, tabsServiceSpy } = await setup(false, establishment);

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
          const { getByText, tabsServiceSpy } = await setup(false, establishment);

          const benchmarksLink = getByText('See how you compare against other workplaces');
          const benchmarksCardText = getByText('There are 9 workplaces providing adult social care in Test LA.');
          fireEvent.click(benchmarksLink);

          expect(benchmarksLink).toBeTruthy();
          expect(benchmarksCardText).toBeTruthy();
          expect(tabsServiceSpy).toHaveBeenCalledWith('benchmarks');
        });

        it('should show the benchmarks card text non pluralised if there is only one workplace in the comparison data', async () => {
          const { getByText } = await setup(false, establishment, true, 1);

          const benchmarksCardText = getByText('There is 1 workplace providing adult social care in Test LA.');

          expect(benchmarksCardText).toBeTruthy();
        });

        it('without comparison data, should show a card with a link that takes you to the benchmarks tab', async () => {
          const { getByText, tabsServiceSpy } = await setup(false, establishment, false);

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

    it('should show a card with a link to bulk upload page when user has canBulkUpload permission', async () => {
      const { queryByTestId } = await setup(false, Establishment, true, 9, ['canBulkUpload']);

      const bulkUploadLink = queryByTestId('bulkUploadLink');

      expect(bulkUploadLink).toBeTruthy();
      expect(bulkUploadLink.innerHTML).toBe('Bulk upload your data');
      expect(bulkUploadLink.getAttribute('href')).toBe('/bulk-upload');
    });

    it('should show the bulk upload card without a link when user does not have canBulkUpload permission', async () => {
      const { getByText, queryByTestId } = await setup();

      const bulkUploadText = getByText('Bulk upload your data');
      const bulkUploadLink = queryByTestId('bulkUploadLink');

      expect(bulkUploadText).toBeTruthy();
      expect(bulkUploadLink).toBeFalsy();
    });

    it('should show the funding card with a link that takes you to the wdf page', async () => {
      const { getByText } = await setup(false, Establishment, true, 9, ['canViewWdfReport']);

      const wdfLink = getByText('Does your data meet funding requirements?');

      expect(wdfLink.getAttribute('href')).toBe('/funding');
    });

    it('should not show the funding card if user does not have permission to view reports', async () => {
      const { queryByText } = await setup();

      const wdfLink = queryByText('Does your data meet funding requirements?');

      expect(wdfLink).toBeFalsy();
    });

    it('should show a card with a link that takes you to the ASC-WDS certificate page', async () => {
      const { getByText } = await setup();

      const ascWdsCertificateLink = getByText('Get your ASC-WDS certificate');

      expect(ascWdsCertificateLink).toBeTruthy();
      expect(ascWdsCertificateLink.getAttribute('href')).toBe('/asc-wds-certificate');
    });

    it('should show a card with a link that takes you to the ASC-WDS news page', async () => {
      const { getByText } = await setup();

      const ascWdsNewsLink = getByText('ASC-WDS news');

      expect(ascWdsNewsLink).toBeTruthy();
      expect(ascWdsNewsLink.getAttribute('href')).toContain(articleList.data[0].slug);
    });

    it('should not show an ASC-WDS news card when user cannot access CMS', async () => {
      const { queryByText } = await setup(false, Establishment, true, 9, [], false);

      const ascWdsNewsLink = queryByText('ASC-WDS news');

      expect(ascWdsNewsLink).toBeFalsy();
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
        const { getByText, tabsServiceSpy } = await setup(false, Establishment, true, 9, ['canViewEstablishment']);

        const workplaceLink = getByText('Workplace');
        fireEvent.click(workplaceLink);

        expect(tabsServiceSpy).toHaveBeenCalledWith('workplace');
      });

      it('should show a warning link which should navigate to the workplace tab when showAddWorkplaceDetailsBanner is true for workplace', async () => {
        const establishment = { ...Establishment, showAddWorkplaceDetailsBanner: true };
        const { getByText, tabsServiceSpy } = await setup(false, establishment, true, 9, ['canViewEstablishment']);

        const link = getByText('Add more details to your workplace');
        fireEvent.click(link);

        expect(link).toBeTruthy();
        expect(tabsServiceSpy).toHaveBeenCalledWith('workplace');
      });
    });

    describe('staff records summary section', () => {
      it('should show staff records link and take you to the staff records tab if user has canViewListOfWorkers permission', async () => {
        const { getByText, tabsServiceSpy } = await setup(false, Establishment, true, 9, ['canViewListOfWorkers']);

        const staffRecordsLink = getByText('Staff records');
        fireEvent.click(staffRecordsLink);

        expect(tabsServiceSpy).toHaveBeenCalledWith('staff-records');
      });

      it('should show staff records as text if user does not have canViewListOfWorkers permission', async () => {
        const { getByText, tabsServiceSpy } = await setup();

        const staffRecordsLink = getByText('Staff records');
        fireEvent.click(staffRecordsLink);

        expect(tabsServiceSpy).not.toHaveBeenCalledWith('staff-records');
      });
    });

    describe('training and qualifications summary section', () => {
      it('should show training and qualifications link that take you the training and qualifications tab if user has canViewListOfWorkers permission', async () => {
        const { getByText, tabsServiceSpy } = await setup(false, Establishment, true, 9, ['canViewListOfWorkers']);

        const trainingAndQualificationsLink = getByText('Training and qualifications');
        fireEvent.click(trainingAndQualificationsLink);

        expect(tabsServiceSpy).toHaveBeenCalledWith('training-and-qualifications');
      });

      it('should show training and qualifications as text if user does not have canViewListOfWorkers permission', async () => {
        const { getByText, tabsServiceSpy } = await setup();

        const trainingAndQualificationsLink = getByText('Training and qualifications');
        fireEvent.click(trainingAndQualificationsLink);

        expect(tabsServiceSpy).not.toHaveBeenCalledWith('training-and-qualifications');
      });
    });
  });

  describe('Local authority progress link', () => {
    it('should not show link when not a local authority', async () => {
      const { queryByText } = await setup();

      expect(queryByText('Download local authority progress report (XLS)')).toBeFalsy();
    });

    it('should show the Local authority progress link when it is a local authority', async () => {
      const { component, fixture, queryAllByText } = await setup();

      component.canRunLocalAuthorityReport = true;

      fixture.detectChanges();

      expect(queryAllByText('Download local authority progress report (XLS)').length).toBe(1);
    });
  });

  describe('parent request approved banner', () => {
    it('should send alert after request to become a parent is approved', async () => {
      const { component, fixture, alertServiceSpy, getByText } = await setup();

      component.workplace.isParentApprovedBannerViewed = false;
      component.isParent = true;
      component.newHomeDesignParentFlag = true;

      const message = `Your request to become a parent has been approved`;

      fixture.detectChanges();
      component.ngOnInit();

      expect(alertServiceSpy).toHaveBeenCalledWith({
        type: 'success',
        message: message,
      });
    });

    it(`should not show if isParentApprovedBannerViewed has not been set`, async () => {
      const { component, fixture, queryByTestId } = await setup();

      component.isParentApprovedBannerViewed = null;
      component.isParent = true;
      component.newHomeDesignParentFlag = true;

      fixture.detectChanges();

      const alertBanner = queryByTestId('parentApprovedBanner');

      expect(alertBanner).toBeFalsy();
    });

    it('should show an alert when they become a parent', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.isParentApprovedBannerViewed = false;
      component.isParent = true;
      component.newHomeDesignParentFlag = true;

      fixture.detectChanges();
      const alertBanner = getByTestId('parentApprovedBanner');

      expect(alertBanner).toBeTruthy();
    });

    it(`should be removed after it's been viewed`, async () => {
      const { component, fixture, queryByTestId } = await setup();

      component.isParentApprovedBannerViewed = true;
      component.isParent = true;
      component.newHomeDesignParentFlag = true;

      fixture.detectChanges();

      const alertBanner = queryByTestId('parentApprovedBanner');

      expect(alertBanner).toBeFalsy();
    });
  });

  describe('Pushing userType to dataLayer', () => {
    [Roles.Admin, Roles.AdminManager].forEach((adminRole) => {
      it(`should push admin when role is ${adminRole} even if isParent is true`, async () => {
        const overrides = {
          userRole: adminRole,
        };
        const establishment = { ...Establishment, isParent: true };

        const { dataLayerPushSpy } = await setup(false, establishment, true, 9, [], true, overrides);

        expect(dataLayerPushSpy).toHaveBeenCalledWith({ userType: 'Admin' });
      });
    });

    [Roles.Edit, Roles.Read].forEach((role) => {
      it(`should push 'Parent' when role is ${role} and isParent is true`, async () => {
        const overrides = {
          userRole: role,
        };
        const establishment = { ...Establishment, isParent: true };

        const { dataLayerPushSpy } = await setup(false, establishment, true, 9, [], true, overrides);

        expect(dataLayerPushSpy).toHaveBeenCalledWith({ userType: 'Parent' });
      });
    });
  });
});
