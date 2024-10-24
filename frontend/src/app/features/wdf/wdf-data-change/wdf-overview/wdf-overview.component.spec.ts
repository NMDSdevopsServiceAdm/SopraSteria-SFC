import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReportService } from '@core/services/report.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockReportService } from '@core/test-utils/MockReportService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import { WdfOverviewComponent } from './wdf-overview.component';
import { getTestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { WdfSummaryPanel } from '@shared/components/wdf-summary-panel/wdf-summary-panel.component';

describe('WdfOverviewComponent', () => {
  const currentYear = new Date().getFullYear();

  const setup = async (overrides: any = {}) => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText, queryByTestId } = await render(
      WdfOverviewComponent,
      {
        imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule],
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
          {
            provide: ReportService,
            useFactory: MockReportService.factory(overrides),
          },
        ],
        componentProperties: {
          wdfStartDate: `1 April ${currentYear}`,
          wdfEndDate: `31 March ${currentYear + 1}`,
          parentOverallWdfEligibility: overrides?.parentOverallWdfEligibility,
        },
        declarations: [WdfSummaryPanel],
      },
    );
    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText, queryByTestId, routerSpy };
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
      const expectedTitleCaption = `${workplaceName} (Workplace ID: ${nmdsId})`;

      expect(getByText(expectedTitleCaption)).toBeTruthy();
    });

    it('should display the page with title the correct timeframe ', async () => {
      const { getByText } = await setup();

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

    it('should not display the funding requirements inset text when requirements are met', async () => {
      const overrides = {
        wdf: {
          overall: true,
          workplace: true,
          staff: true,
        },
      };

      const { queryByTestId } = await setup(overrides);

      const fundingInsetText = queryByTestId('fundingInsetText');

      expect(fundingInsetText).toBeFalsy();
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
      expect(keepYourDataCurrentLink.getAttribute('href')).toEqual('/wdf/data');
    });

    it('should navigate to your data when Check your data is clicked', async () => {
      const { fixture, getByText, routerSpy } = await setup();

      const checkYourDataButton = getByText('Check your data');
      fireEvent.click(checkYourDataButton);
      fixture.detectChanges();

      expect(checkYourDataButton).toBeTruthy();
      expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'data']);
    });

    it('should show the learn more link', async () => {
      const { getByText } = await setup();

      const learnMoreLink = getByText('Learn more about the funds that you can claim from');

      expect(learnMoreLink).toBeTruthy();
      expect(learnMoreLink.getAttribute('href')).toEqual('/wdf/learn-more');
    });
  });

  describe('Unhappy path', async () => {
    it('should show the funding requirements inset text when requirements are not met', async () => {
      const overrides = {
        wdf: {
          overall: false,
          workplace: false,
          staff: false,
        },
        isParent: false,
        parentOverallWdfEligibility: false,
      };
      const { getByTestId } = await setup(overrides);

      const fundingInsetText = getByTestId('fundingInsetText');

      expect(fundingInsetText).toBeTruthy();
    });

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

      const { component, getByTestId } = await setup(overrides);

      const wdfStartYear = new Date(component.wdfStartDate).getFullYear();
      const wdfEndYear = new Date(component.wdfEndDate).getFullYear();

      const fundingInsetText = getByTestId('fundingInsetText');

      const fundingRequirementsLink = within(fundingInsetText).getByText(
        `The ASC-WDS funding requirements for ${wdfStartYear} to ${wdfEndYear}`,
      );

      expect(fundingRequirementsLink).toBeTruthy();
      expect(fundingRequirementsLink.getAttribute('href')).toEqual('/wdf/funding-requirements');
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
      expect(keepYourDataCurrentLink.getAttribute('href')).toEqual('/wdf/data');
    });

    it('should not display the funding requirements inset text when requirements are met', async () => {
      const overrides = {
        wdf: { overall: true, workplace: true, staff: true },
        isParent: true,
        parentOverallWdfEligibility: true,
      };

      const { queryByTestId } = await setup(overrides);

      const fundingInsetText = queryByTestId('fundingInsetText');

      expect(fundingInsetText).toBeFalsy();
    });
  });

  describe('Parent workplaces unhappy path', () => {
    it('should not display data has met paragraph', async () => {
      const overrides = {
        wdf: { overall: false, workplace: false, staff: false },
        isParent: true,
        parentOverallWdfEligibility: false,
      };

      const { queryByText, queryByTestId } = await setup(overrides);

      const dataMetFundingParagraph = queryByTestId('dataMetFunding');
      const keepYourDataCurrentLink = queryByText('Keep your data current');

      expect(dataMetFundingParagraph).toBeFalsy();
      expect(keepYourDataCurrentLink).toBeFalsy();
    });

    it('should display the funding requirements inset text when requirements are not met', async () => {
      const overrides = {
        wdf: { overall: false, workplace: true, staff: true },
        isParent: true,
        parentOverallWdfEligibility: false,
      };

      const { queryByTestId } = await setup(overrides);

      const fundingInsetText = queryByTestId('fundingInsetText');

      expect(fundingInsetText).toBeTruthy();
    });
  });

  describe('getParentAndSubs', async () => {
    it('should calculate parentOverallWdfEligibility to be true if all workplaces are eligible', async () => {
      const overrides = {
        isParent: true,
      };

      const { component, fixture } = await setup(overrides);

      component.workplaces = [
        { wdf: { overall: true, overallWdfEligibility: '2021-07-31' } },
        { wdf: { overall: true, overallWdfEligibility: '2021-05-01' } },
      ];

      component.getParentOverallWdfEligibility();
      fixture.detectChanges();

      expect(component.parentOverallWdfEligibility).toBeTrue();
    });

    it('should calculate parentOverallWdfEligibility to be false if a workplace is ineligible', async () => {
      const overrides = {
        isParent: true,
      };

      const { component, fixture } = await setup(overrides);

      component.workplaces = [
        { wdf: { overall: true, overallWdfEligibility: '2021-07-31' } },
        { wdf: { overall: false, overallWdfEligibility: '' } },
      ];

      component.getParentOverallWdfEligibility();
      fixture.detectChanges();

      expect(component.parentOverallWdfEligibility).toBeFalse();
    });

    it('should correctly calculate parentOverallEligibilityDate if all workplaces are eligible', async () => {
      const overrides = {
        isParent: true,
        parentOverallWdfEligibility: true,
      };

      const { component, fixture } = await setup(overrides);

      component.workplaces = [
        { wdf: { overall: true, overallWdfEligibility: '2021-07-31' } },
        { wdf: { overall: true, overallWdfEligibility: '2021-05-01' } },
      ];

      component.getLastOverallEligibilityDate();
      fixture.detectChanges();

      expect(component.parentOverallEligibilityDate).toEqual('31 July 2021');
    });
  });
});
