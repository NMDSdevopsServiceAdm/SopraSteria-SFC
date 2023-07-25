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
import { EstablishmentService } from '@core/services/establishment.service';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TabsService } from '@core/services/tabs.service';
import { UserService } from '@core/services/user.service';
import { WindowToken } from '@core/services/window';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentServiceCheckCQCDetails } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { NewArticleListComponent } from '@features/articles/new-article-list/new-article-list.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { of } from 'rxjs';

import { Establishment } from '../../../../mockdata/establishment';
import { NewDashboardHeaderComponent } from '../../../shared/components/new-dashboard-header/dashboard-header.component';
import { ParentHomeTabComponent } from './parent-home-tab.component';
import { SummarySectionComponent } from '../home-tab/summary-section/summary-section.component';

const MockWindow = {
  dataLayer: {
    push: () => {
      return;
    },
  },
};

describe('ParentHomeTabComponent', () => {
  const setup = async (
    checkCqcDetails = false,
    establishment = Establishment,
    comparisonDataAvailable = true,
    noOfWorkplaces = 9,
  ) => {
    const { fixture, getByText, queryByText, getByTestId, queryByTestId } = await render(ParentHomeTabComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        WindowRef,
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
          deps: [HttpClient, Router, UserService],
        },

        {
          provide: UserService,
          useFactory: MockUserService.factory(1, Roles.Admin),
          deps: [HttpClient],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
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
        { provide: WindowToken, useValue: MockWindow },
      ],
      declarations: [NewDashboardHeaderComponent, NewArticleListComponent, SummarySectionComponent],
      componentProperties: {
        workplace: establishment,
        meta: comparisonDataAvailable
          ? { workplaces: noOfWorkplaces, staff: 4, localAuthority: 'Test LA' }
          : ({ workplaces: 0, staff: 0, localAuthority: 'Test LA' } as Meta),
      },
      schemas: [NO_ERRORS_SCHEMA],
    });

    const component = fixture.componentInstance;

    const alertService = TestBed.inject(AlertService);
    const alertServiceSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const parentsRequestService = TestBed.inject(ParentRequestsService);

    const tabsService = TestBed.inject(TabsService);
    const tabsServiceSpy = spyOnProperty(tabsService, 'selectedTab', 'set');

    return {
      component,
      fixture,
      getByText,
      queryByText,
      getByTestId,
      queryByTestId,
      alertServiceSpy,
      parentsRequestService,
      tabsServiceSpy,
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
  });

  describe('summary', () => {
    it('should show summary box', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.canViewListOfWorkers = true;
      fixture.detectChanges();

      const summaryBox = getByTestId('summaryBox');

      expect(summaryBox).toBeTruthy();
    });

    it('should not show the summary section if the user does not have the correct permissions', async () => {
      const { component, fixture, queryByTestId } = await setup();

      component.canViewListOfWorkers = false;
      fixture.detectChanges();

      const summaryBox = queryByTestId('summaryBox');
      expect(summaryBox).toBeFalsy();
    });

    describe('workplace summary section', () => {
      it('should take you to the workplace tab when clicking the workplace link', async () => {
        const { component, fixture, getByText, tabsServiceSpy } = await setup();

        component.canViewListOfWorkers = true;
        fixture.detectChanges();

        const workplaceLink = getByText('Workplace');
        fireEvent.click(workplaceLink);

        expect(tabsServiceSpy).toHaveBeenCalledWith('workplace');
      });

      it('should show a warning link which should navigate to the workplace tab', async () => {
        const establishment = { ...Establishment, showAddWorkplaceDetailsBanner: true };
        const { component, fixture, getByText, tabsServiceSpy } = await setup(true, establishment);

        component.canViewListOfWorkers = true;
        fixture.detectChanges();

        const link = getByText('Add more details to your workplace');
        fireEvent.click(link);

        expect(link).toBeTruthy();
        expect(tabsServiceSpy).toHaveBeenCalledWith('workplace');
      });
    });

    describe('staff records summary section', () => {
      it('should show staff records link and take you to the staff records tab', async () => {
        const { component, fixture, getByText, tabsServiceSpy } = await setup();

        component.canViewListOfWorkers = true;
        fixture.detectChanges();

        const staffRecordsLink = getByText('Staff records');
        fireEvent.click(staffRecordsLink);

        expect(tabsServiceSpy).toHaveBeenCalledWith('staff-records');
      });
    });

    describe('training and qualifications summary section', () => {
      it('should show training and qualifications link that take you the training and qualifications tab', async () => {
        const { component, fixture, getByText, tabsServiceSpy } = await setup();

        component.canViewListOfWorkers = true;
        fixture.detectChanges();

        const trainingAndQualificationsLink = getByText('Training and qualifications');
        fireEvent.click(trainingAndQualificationsLink);

        expect(tabsServiceSpy).toHaveBeenCalledWith('training-and-qualifications');
      });
    });
  });
});
