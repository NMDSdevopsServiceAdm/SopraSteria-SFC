import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { WdfSummaryPanel } from './wdf-summary-panel.component';

describe('WdfSummaryPanel', () => {
  const currentYear = new Date().getFullYear();

  const messages = {
    fundingMet: `Your data has met the funding requirements for ${currentYear} to ${currentYear + 1}`,
    fundingNotMet: `Your data does not meet the funding requirements for ${currentYear} to ${currentYear + 1}`,
    fundingMetBySomeSubs: `Some data does not meet the funding requirements for ${currentYear} to ${currentYear + 1}`,
  };

  const setup = async (overrides: any = {}) => {
    const setupTools = await render(WdfSummaryPanel, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule],
      providers: [],
      componentProperties: {
        wdfStartDate: `1 April ${currentYear}`,
        wdfEndDate: `31 March ${currentYear + 1}`,
        ...overrides,
      },
    });
    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return { ...setupTools, component, routerSpy };
  };

  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  describe('meeting funding requirements', () => {
    it('should display the correct message with timeframe for meeting funding requirements for the workplace', async () => {
      const overrides = {
        workplaceWdfEligibilityStatus: true,
        overallWdfEligibility: false,
      };

      const { getByTestId } = await setup(overrides);

      const workplaceRow = getByTestId('workplace-row');

      expect(workplaceRow).toBeTruthy();
      expect(within(workplaceRow).queryByText(messages.fundingNotMet)).toBeFalsy();
      expect(within(workplaceRow).getByText(messages.fundingMet)).toBeTruthy();
      expect(within(workplaceRow).getByTestId('green-tick')).toBeTruthy();
    });

    it('should display the correct message with timeframe for meeting funding requirements for the workplace if overall has met but workplace hasn\t', async () => {
      const overrides = {
        workplaceWdfEligibilityStatus: false,
        overallWdfEligibility: true,
      };

      const { getByTestId } = await setup(overrides);

      const workplaceRow = getByTestId('workplace-row');

      expect(workplaceRow).toBeTruthy();
      expect(within(workplaceRow).queryByText(messages.fundingNotMet)).toBeFalsy();
      expect(within(workplaceRow).getByText(messages.fundingMet)).toBeTruthy();
      expect(within(workplaceRow).getByTestId('green-tick')).toBeTruthy();
    });

    it('should display the correct message with timeframe for meeting funding requirements for staff', async () => {
      const overrides = {
        staffWdfEligibilityStatus: true,
        overallWdfEligibility: false,
      };

      const { getByTestId } = await setup(overrides);

      const staffRow = getByTestId('staff-row');

      expect(staffRow).toBeTruthy();
      expect(within(staffRow).queryByText(messages.fundingNotMet)).toBeFalsy();
      expect(within(staffRow).getByText(messages.fundingMet)).toBeTruthy();
      expect(within(staffRow).getByTestId('green-tick')).toBeTruthy();
    });

    it("should display the correct message with timeframe for meeting funding requirements for staff if overall has met but staff hasn't", async () => {
      const overrides = {
        staffWdfEligibilityStatus: false,
        overallWdfEligibility: true,
      };

      const { getByTestId } = await setup(overrides);

      const staffRow = getByTestId('staff-row');

      expect(staffRow).toBeTruthy();
      expect(within(staffRow).queryByText(messages.fundingNotMet)).toBeFalsy();
      expect(within(staffRow).getByText(messages.fundingMet)).toBeTruthy();
      expect(within(staffRow).getByTestId('green-tick')).toBeTruthy();
    });

    it('should display the correct message with timeframe for meeting funding requirements for all other workplaces', async () => {
      const overrides = {
        subsidiariesOverallWdfEligibility: true,
        isParent: true,
      };

      const { getByTestId } = await setup(overrides);

      const workplacesRow = getByTestId('workplaces-row');

      expect(workplacesRow).toBeTruthy();
      expect(within(workplacesRow).queryByText(messages.fundingNotMet)).toBeFalsy();
      expect(within(workplacesRow).getByText(messages.fundingMet)).toBeTruthy();
      expect(within(workplacesRow).getByTestId('green-tick')).toBeTruthy();
    });

    describe('funding message links', () => {
      it('should show both messages as links when no active fragment', async () => {
        const overrides = {
          workplaceWdfEligibilityStatus: true,
          staffWdfEligibilityStatus: true,
        };

        const { getByTestId } = await setup(overrides);

        const workplaceRow = getByTestId('workplace-row');
        const staffRow = getByTestId('staff-row');

        const workplaceFundingMessage = within(workplaceRow).getByRole('link');
        const staffFundingMessage = within(staffRow).getByRole('link');

        expect(workplaceFundingMessage).toBeTruthy();
        expect(staffFundingMessage).toBeTruthy();
      });

      it('should show workplace without a link and staff with a link when workplace is the active fragment', async () => {
        const overrides = {
          workplaceWdfEligibilityStatus: true,
          staffWdfEligibilityStatus: true,
          activatedFragment: 'workplace',
        };

        const { getByTestId } = await setup(overrides);

        const workplaceRow = getByTestId('workplace-row');
        const staffRow = getByTestId('staff-row');

        const workplaceFundingMessage = within(workplaceRow).queryByRole('link');
        const staffFundingMessage = within(staffRow).getByRole('link');

        expect(workplaceFundingMessage).toBeFalsy();
        expect(staffFundingMessage).toBeTruthy();
      });

      it('should show workplace with a link and staff without a link when staff is the active fragment', async () => {
        const overrides = {
          workplaceWdfEligibilityStatus: true,
          staffWdfEligibilityStatus: true,
          activatedFragment: 'staff',
        };

        const { getByTestId } = await setup(overrides);

        const workplaceRow = getByTestId('workplace-row');
        const staffRow = getByTestId('staff-row');

        const workplaceFundingMessage = within(workplaceRow).getByRole('link');
        const staffFundingMessage = within(staffRow).queryByRole('link');

        expect(workplaceFundingMessage).toBeTruthy();
        expect(staffFundingMessage).toBeFalsy();
      });
    });

    describe('parent', () => {
      it('should show all messages as clickable links when no active fragment', async () => {
        const overrides = {
          workplaceWdfEligibilityStatus: true,
          staffWdfEligibilityStatus: true,
          subsidiariesOverallWdfEligibility: true,
          isParent: true,
        };

        const { getByTestId } = await setup(overrides);

        const workplaceRow = getByTestId('workplace-row');
        const staffRow = getByTestId('staff-row');
        const allWorkplacesRow = getByTestId('workplaces-row');

        const workplaceFundingMessage = within(workplaceRow).getByRole('link');
        const staffFundingMessage = within(staffRow).getByRole('link');
        const allWorkplacesFundingMessage = within(allWorkplacesRow).getByRole('link');

        expect(workplaceFundingMessage).toBeTruthy();
        expect(staffFundingMessage).toBeTruthy();
        expect(allWorkplacesFundingMessage).toBeTruthy();
      });

      it('should show your other workplaces without a link when fragment is active', async () => {
        const overrides = {
          workplaceWdfEligibilityStatus: true,
          staffWdfEligibilityStatus: true,
          subsidiariesOverallWdfEligibility: true,
          isParent: true,
          activatedFragment: 'workplaces',
        };

        const { getByTestId } = await setup(overrides);

        const workplaceRow = getByTestId('workplace-row');
        const staffRow = getByTestId('staff-row');
        const allWorkplacesRow = getByTestId('workplaces-row');

        const workplaceFundingMessage = within(workplaceRow).getByRole('link');
        const staffFundingMessage = within(staffRow).getByRole('link');
        const allWorkplacesFundingMessage = within(allWorkplacesRow).queryByRole('link');

        expect(workplaceFundingMessage).toBeTruthy();
        expect(staffFundingMessage).toBeTruthy();
        expect(allWorkplacesFundingMessage).toBeFalsy();
      });
    });
  });

  describe('not meeting funding requirements', () => {
    it('should display the not meeting funding requirements message for the workplace', async () => {
      const overrides = {
        workplaceWdfEligibilityStatus: false,
        staffWdfEligibilityStatus: false,
        overallWdfEligibility: false,
      };

      const { getByTestId } = await setup(overrides);

      const workplaceRow = getByTestId('workplace-row');

      expect(workplaceRow).toBeTruthy();
      expect(within(workplaceRow).queryByText(messages.fundingMet)).toBeFalsy();
      expect(within(workplaceRow).getByText(messages.fundingNotMet)).toBeTruthy();
      expect(within(workplaceRow).getByTestId('red-flag')).toBeTruthy();
    });

    it('should display the not meeting funding requirements message for staff', async () => {
      const overrides = {
        workplaceWdfEligibilityStatus: false,
        staffWdfEligibilityStatus: false,
        overallWdfEligibility: false,
      };

      const { getByTestId } = await setup(overrides);

      const staffRow = getByTestId('staff-row');

      expect(staffRow).toBeTruthy();
      expect(within(staffRow).queryByText(messages.fundingMet)).toBeFalsy();
      expect(within(staffRow).getByText(messages.fundingNotMet)).toBeTruthy();
      expect(within(staffRow).getByTestId('red-flag')).toBeTruthy();
    });

    it('should display the not meeting funding requirements message for all other workplaces', async () => {
      const overrides = {
        workplaceWdfEligibilityStatus: false,
        staffWdfEligibilityStatus: false,
        subsidiariesOverallWdfEligibility: false,
        isParent: true,
        overallWdfEligibility: false,
      };

      const { getByTestId } = await setup(overrides);

      const workplacesRow = getByTestId('workplaces-row');

      expect(workplacesRow).toBeTruthy();
      expect(within(workplacesRow).queryByText(messages.fundingMet)).toBeFalsy();
      expect(within(workplacesRow).getByText(messages.fundingNotMet)).toBeTruthy();
      expect(within(workplacesRow).getByTestId('red-flag')).toBeTruthy();
    });

    it('should display some data not meeting requirements message when ineligible but some sub workplaces are meeting', async () => {
      const overrides = {
        workplaceWdfEligibilityStatus: false,
        staffWdfEligibilityStatus: false,
        subsidiariesOverallWdfEligibility: false,
        someSubsidiariesMeetingRequirements: true,
        isParent: true,
        overallWdfEligibility: false,
      };

      const { getByTestId } = await setup(overrides);

      const workplacesRow = getByTestId('workplaces-row');

      expect(within(workplacesRow).getByText(messages.fundingMetBySomeSubs)).toBeTruthy();
      expect(within(workplacesRow).getByTestId('red-flag')).toBeTruthy();

      expect(within(workplacesRow).queryByText(messages.fundingMet)).toBeFalsy();
      expect(within(workplacesRow).queryByText(messages.fundingNotMet)).toBeFalsy();
    });
  });

  describe('Navigation', () => {
    [
      {
        scenario: 'with funding/data in url when not on data page',
        expectedLink: ['/funding/data'],
        onDataPage: false,
      },
      {
        scenario: 'with no url when already on the data page',
        expectedLink: [],
        onDataPage: true,
      },
    ].forEach(({ scenario, onDataPage, expectedLink }) => {
      [{ isEligible: true }, { isEligible: false }].forEach(({ isEligible }) => {
        const linkId = isEligible ? 'met-funding-message' : 'not-met-funding-message';

        it(`should navigate to workplace when ${linkId} clicked ${scenario}`, async () => {
          const overrides = {
            workplaceWdfEligibilityStatus: isEligible,
            overallWdfEligibility: isEligible,
            onDataPage,
          };

          const { fixture, getByTestId, routerSpy } = await setup(overrides);

          const workplaceRow = getByTestId('workplace-row');

          const notMetFundingMessage = within(workplaceRow).getByTestId(linkId);

          expect(notMetFundingMessage).toBeTruthy();

          fireEvent.click(notMetFundingMessage);
          fixture.detectChanges();

          expect(routerSpy).toHaveBeenCalledWith(expectedLink, { fragment: 'workplace' });
        });

        it(`should navigate to staff when ${linkId} clicked ${scenario}`, async () => {
          const overrides = {
            staffWdfEligibilityStatus: isEligible,
            overallWdfEligibility: isEligible,
            onDataPage,
          };

          const { fixture, getByTestId, routerSpy } = await setup(overrides);

          const staffRow = getByTestId('staff-row');

          const notMetFundingMessage = within(staffRow).getByTestId(linkId);

          expect(notMetFundingMessage).toBeTruthy();

          fireEvent.click(notMetFundingMessage);

          expect(routerSpy).toHaveBeenCalledWith(expectedLink, { fragment: 'staff' });
        });

        it(`should navigate to your other workplaces when clicked ${scenario}`, async () => {
          const overrides = {
            subsidiariesOverallWdfEligibility: isEligible,
            isParent: true,
            onDataPage,
          };

          const { fixture, getByTestId, routerSpy } = await setup(overrides);

          const workplacesRow = getByTestId('workplaces-row');

          const notMetFundingMessage = within(workplacesRow).getByTestId(linkId);

          expect(notMetFundingMessage).toBeTruthy();

          fireEvent.click(notMetFundingMessage);
          fixture.detectChanges();

          expect(routerSpy).toHaveBeenCalledWith(expectedLink, { fragment: 'workplaces' });
        });
      });
    });
  });
});
