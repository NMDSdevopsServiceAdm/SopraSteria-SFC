import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { createMockWdfReport } from '@core/test-utils/MockReportService';
import { WdfSummaryPanel } from '@shared/components/wdf-summary-panel/wdf-summary-panel.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { WdfOverviewComponent } from './wdf-overview.component';
import { provideActivatedRouteWithRouterLink } from '@core/test-utils/MockActivatedRoute';

describe('WdfOverviewComponent', () => {
  const setup = async (overrides: any = {}) => {
    const currentYear = new Date().getFullYear();

    const setupTools = await render(WdfOverviewComponent, {
      imports: [BrowserModule, RouterModule, SharedModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        {
          provide: EstablishmentService,
          useValue: {
            primaryWorkplace: {
              uid: 'some-uid',
              name: 'mock establishment name',
              nmdsId: 'mock nmdsId',
              isParent: overrides?.isParent,
            },
          },
        },
        provideActivatedRouteWithRouterLink({
          snapshot: {
            data: { report: createMockWdfReport(overrides) },
          },
        }),
        // {
        //   provide: ActivatedRoute,
        //   useValue: {
        //     snapshot: {
        //       data: { report: createMockWdfReport(overrides) },
        //     },
        //   },
        // },
        {
          provide: UserService,
          useValue: {
            getEstablishments: () => of(overrides.getParentAndSubs ?? null),
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      componentProperties: {
        wdfStartDate: `1 April ${currentYear}`,
        wdfEndDate: `31 March ${currentYear + 1}`,
        parentOverallWdfEligibility: overrides?.parentOverallWdfEligibility,
      },
      declarations: [WdfSummaryPanel],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
      routerSpy,
      currentYear,
    };
  };

  describe('Happy path', async () => {
    it('should render a WdfOverviewComponent', async () => {
      const { component } = await setup();
      expect(component).toBeTruthy();
    });

    it('should display the workplace name and the nmds ID in brackets in caption above title', async () => {
      const { component, getByText } = await setup();

      const workplaceName = component.workplace.name;
      const nmdsId = component.workplace.nmdsId;
      const workplaceIdCaption = `(Workplace ID: ${nmdsId})`;

      expect(getByText(workplaceName, { selector: '.govuk-caption-xl' })).toBeTruthy();
      expect(getByText(workplaceIdCaption)).toBeTruthy();
    });

    it('should display the page with title the correct timeframe ', async () => {
      const { getByText, currentYear } = await setup();

      const pageTitle = `Does your data meet funding requirements for ${currentYear} to ${currentYear + 1}?`;

      expect(getByText(pageTitle)).toBeTruthy();
    });

    it('should display a warning about eligibility', async () => {
      const { getByText } = await setup();

      const eligibilityText =
        "Your eligibility resets every year on 1 April, so you'll need to complete or update your data on or after this date.";

      expect(getByText(eligibilityText)).toBeTruthy();
    });

    it('should display the summary panel', async () => {
      const { getByTestId } = await setup();

      const summaryPanel = getByTestId('summaryPanel');

      expect(summaryPanel).toBeTruthy();
    });

    it('should display the workplace and staff row but not all workplaces', async () => {
      const { getByTestId, queryByTestId } = await setup();

      const workplaceRow = getByTestId('workplace-row');
      const staffRow = getByTestId('staff-row');
      const workplacesRow = queryByTestId('workplaces-row');

      expect(workplaceRow).toBeTruthy();
      expect(staffRow).toBeTruthy();
      expect(workplacesRow).toBeFalsy();
    });

    it('should display data has met paragraph', async () => {
      const overrides = {
        wdf: {
          overall: true,
          workplace: true,
          staff: true,
        },
      };

      const { getByText, getByTestId } = await setup(overrides);

      const dataMetFundingParagraph = getByTestId('dataMetFunding');
      const keepYourDataCurrentLink = getByText('Keep your data current');

      expect(dataMetFundingParagraph).toBeTruthy();
      expect(keepYourDataCurrentLink.getAttribute('href')).toEqual('/data');
    });

    it('should navigate to your data when Check your data is clicked', async () => {
      const { component, fixture, getByText, routerSpy } = await setup();

      const checkYourDataButton = getByText('Check your data');
      fireEvent.click(checkYourDataButton);
      fixture.detectChanges();

      expect(checkYourDataButton).toBeTruthy();
      expect(routerSpy).toHaveBeenCalledWith(['data'], { relativeTo: component.route });
    });

    it('should show the learn more link', async () => {
      const { getByText } = await setup();

      const learnMoreLink = getByText('Learn more about the funds that you can claim from');

      expect(learnMoreLink).toBeTruthy();
      expect(learnMoreLink.getAttribute('href')).toEqual('/learn-more');
    });

    it('should show the funding requirements link', async () => {
      const { getByText, currentYear } = await setup();

      const fundingRequirementsLink = getByText(
        `View the ASC-WDS funding requirements for ${currentYear} to ${currentYear + 1}`,
        { selector: 'a' },
      );

      expect(fundingRequirementsLink).toBeTruthy();
      expect(fundingRequirementsLink.getAttribute('href')).toEqual('/funding-requirements');
    });
  });

  describe('Unhappy path', async () => {
    it('should show the funding requirements link', async () => {
      const overrides = {
        wdf: {
          overall: false,
          workplace: false,
          staff: false,
        },
        isParent: false,
        parentOverallWdfEligibility: false,
      };

      const { getByText, currentYear } = await setup(overrides);

      const fundingRequirementsLink = getByText(
        `View the ASC-WDS funding requirements for ${currentYear} to ${currentYear + 1}`,
        { selector: 'a' },
      );

      expect(fundingRequirementsLink).toBeTruthy();
      expect(fundingRequirementsLink.getAttribute('href')).toEqual('/funding-requirements');
    });
  });

  describe('Parent workplaces happy path', () => {
    it('should display the summary panel', async () => {
      const overrides = {
        wdf: { overall: true, workplace: true, staff: true },
        isParent: true,
        parentOverallWdfEligibility: true,
      };

      const { getByTestId } = await setup(overrides);

      const summaryPanel = getByTestId('summaryPanel');

      expect(summaryPanel).toBeTruthy();
    });

    it('should display the workplace, staff and your all workplaces rows', async () => {
      const overrides = {
        wdf: { overall: true, workplace: true, staff: true },
        isParent: true,
        parentOverallWdfEligibility: true,
      };

      const { getByTestId } = await setup(overrides);

      const workplaceRow = getByTestId('workplace-row');
      const staffRow = getByTestId('staff-row');
      const workplacesRow = getByTestId('workplaces-row');

      expect(workplaceRow).toBeTruthy();
      expect(staffRow).toBeTruthy();
      expect(workplacesRow).toBeTruthy();
    });

    describe('Data has met paragraph', () => {
      it('should display data has met paragraph', async () => {
        const overrides = {
          wdf: { overall: true, workplace: true, staff: true },
          isParent: true,
          parentOverallWdfEligibility: true,
        };

        const { getByText, getByTestId } = await setup(overrides);

        const dataMetFundingParagraph = getByTestId('dataMetFunding');
        const keepYourDataCurrentLink = getByText('Keep your data current');

        expect(dataMetFundingParagraph).toBeTruthy();
        expect(keepYourDataCurrentLink.getAttribute('href')).toEqual('/data');
      });

      it('should display overall eligibility date from parent when parent has latest eligibility date', async () => {
        const overrides = {
          wdf: { overall: true, workplace: true, staff: true, overallWdfEligibility: '2024-07-31' },
          isParent: true,
          getParentAndSubs: {
            primary: { wdf: { overall: true, overallWdfEligibility: '2024-07-31' } },
            subsidaries: {
              establishments: [
                { wdf: { overall: true, overallWdfEligibility: '2024-06-11' } },
                { wdf: { overall: true, overallWdfEligibility: '2024-05-13' } },
              ],
            },
          },
        };

        const { getByText } = await setup(overrides);

        expect(getByText('Your data met the funding requirements on 31 July', { exact: false })).toBeTruthy();
      });

      it('should display overall eligibility date from latest sub when a sub has latest eligibility date', async () => {
        const overrides = {
          wdf: { overall: true, workplace: true, staff: true, overallWdfEligibility: '2024-07-31' },
          isParent: true,
          getParentAndSubs: {
            primary: { wdf: { overall: true, overallWdfEligibility: '2024-07-31' } },
            subsidaries: {
              establishments: [
                { wdf: { overall: true, overallWdfEligibility: '2024-06-11' } },
                { wdf: { overall: true, overallWdfEligibility: '2024-10-13' } },
              ],
            },
          },
        };

        const { getByText } = await setup(overrides);

        expect(getByText('Your data met the funding requirements on 13 October', { exact: false })).toBeTruthy();
      });
    });
  });

  describe('Parent workplaces unhappy path', () => {
    it('should not display data has met paragraph', async () => {
      const overrides = {
        wdf: { overall: false, workplace: false, staff: false },
        isParent: true,
        getParentAndSubs: {
          primary: { wdf: { overall: false, overallWdfEligibility: null } },
          subsidaries: {
            establishments: [
              { wdf: { overall: true, overallWdfEligibility: '2021-07-31' } },
              { wdf: { overall: false, overallWdfEligibility: null } },
            ],
          },
        },
      };

      const { queryByText, queryByTestId } = await setup(overrides);

      const dataMetFundingParagraph = queryByTestId('dataMetFunding');
      const keepYourDataCurrentLink = queryByText('Keep your data current');

      expect(dataMetFundingParagraph).toBeFalsy();
      expect(keepYourDataCurrentLink).toBeFalsy();
    });

    it('should display the funding requirements link when requirements are not met', async () => {
      const overrides = {
        wdf: { overall: false, workplace: false, staff: true },
        isParent: true,
        getParentAndSubs: {
          primary: { wdf: { overall: false, overallWdfEligibility: null } },
          subsidaries: {
            establishments: [
              { wdf: { overall: false, overallWdfEligibility: null } },
              { wdf: { overall: false, overallWdfEligibility: null } },
            ],
          },
        },
      };

      const { getByText, currentYear } = await setup(overrides);

      const fundingRequirementsLink = getByText(
        `View the ASC-WDS funding requirements for ${currentYear} to ${currentYear + 1}`,
        { selector: 'a' },
      );

      expect(fundingRequirementsLink).toBeTruthy();
      expect(fundingRequirementsLink.getAttribute('href')).toEqual('/funding-requirements');
    });

    it('should display some data not meeting message when not eligible overall but some sub workplaces are eligible', async () => {
      const overrides = {
        isParent: true,
        getParentAndSubs: {
          primary: { wdf: { overall: true, overallWdfEligibility: '2021-08-31' } },
          subsidaries: {
            establishments: [
              { wdf: { overall: true, overallWdfEligibility: '2021-07-31' } },
              { wdf: { overall: false, overallWdfEligibility: null } },
            ],
          },
        },
      };

      const { getByText, currentYear } = await setup(overrides);

      expect(
        getByText(`Some data does not meet the funding requirements for ${currentYear} to ${currentYear + 1}`),
      ).toBeTruthy();
    });

    it('should display meeting message for Your other workplaces when parent not eligible but all sub workplaces are eligible', async () => {
      const overrides = {
        isParent: true,
        wdf: { overall: false, workplace: false, staff: false },
        getParentAndSubs: {
          primary: { wdf: { overall: false, overallWdfEligibility: null } },
          subsidaries: {
            establishments: [
              { wdf: { overall: true, overallWdfEligibility: '2021-07-31' } },
              { wdf: { overall: true, overallWdfEligibility: '2021-09-31' } },
            ],
          },
        },
      };

      const { getByText, currentYear } = await setup(overrides);

      expect(
        getByText(`Your data has met the funding requirements for ${currentYear} to ${currentYear + 1}`),
      ).toBeTruthy();
    });
  });

  describe('getParentAndSubs', async () => {
    it('should calculate parentOverallWdfEligibility to be true if all workplaces are eligible', async () => {
      const overrides = {
        isParent: true,
        getParentAndSubs: {
          primary: { wdf: { overall: true, overallWdfEligibility: '2021-08-31' } },
          subsidaries: {
            establishments: [
              { wdf: { overall: true, overallWdfEligibility: '2021-07-31' } },
              { wdf: { overall: true, overallWdfEligibility: '2021-05-01' } },
            ],
          },
        },
      };

      const { component, fixture } = await setup(overrides);
      component.getParentOverallWdfEligibility();
      fixture.detectChanges();
      expect(component.parentOverallWdfEligibility).toBeTrue();
    });

    it('should calculate parentOverallWdfEligibility to be false if a workplace is ineligible', async () => {
      const overrides = {
        isParent: true,
        getParentAndSubs: {
          primary: { wdf: { overall: true, overallWdfEligibility: '2021-07-31' } },
          subsidaries: {
            establishments: [
              { wdf: { overall: true, overallWdfEligibility: '2021-07-31' } },
              { wdf: { overall: false, overallWdfEligibility: '' } },
            ],
          },
        },
      };

      const { component, fixture } = await setup(overrides);
      component.getParentOverallWdfEligibility();
      fixture.detectChanges();

      expect(component.parentOverallWdfEligibility).toBeFalse();
    });
  });
});
