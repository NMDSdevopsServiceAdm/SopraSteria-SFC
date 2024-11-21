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
  };

  const setup = async (overrides: any = {}) => {
    const { fixture, getByText, queryByText, getByTestId, queryByTestId } = await render(WdfSummaryPanel, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule],
      providers: [],
      componentProperties: {
        wdfStartDate: `1 April ${currentYear}`,
        wdfEndDate: `31 March ${currentYear + 1}`,
        ...overrides,
      },
    });
    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return { component, fixture, getByText, queryByText, getByTestId, queryByTestId, routerSpy };
  };

  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  describe('meeting funding requirements', () => {
    it('should display the correct message with timeframe for meeting WDF requirements for the workplace', async () => {
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

    it('should display the correct message with timeframe for meeting WDF requirements for the workplace if overall has met but workplace hasn\t', async () => {
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

    it('should display the correct message with timeframe for meeting WDF requirements for staff', async () => {
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

    it("should display the correct message with timeframe for meeting WDF requirements for staff if overall has met but staff hasn't", async () => {
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

    it('should display the correct message with timeframe for meeting WDF requirements for all other workplaces', async () => {
      const overrides = {
        parentOverallWdfEligibility: true,
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
      it('should show both messages as links', async () => {
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

      it('should show workplace without a link and staff with a link', async () => {
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

      it('should show workplace with a link and staff without a link', async () => {
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

      it('should navigate to workplace when clicked', async () => {
        const overrides = {
          workplaceWdfEligibilityStatus: true,
        };

        const { fixture, getByTestId, routerSpy } = await setup(overrides);

        const workplaceRow = getByTestId('workplace-row');

        const metFundingMessage = within(workplaceRow).getByTestId('met-funding-message');

        expect(metFundingMessage).toBeTruthy();

        fireEvent.click(metFundingMessage);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/wdf/data'], { fragment: 'workplace' });
      });

      it('should navigate to staff when clicked', async () => {
        const overrides = {
          staffWdfEligibilityStatus: true,
        };

        const { fixture, getByTestId, routerSpy } = await setup(overrides);

        const staffRow = getByTestId('staff-row');

        const metFundingMessage = within(staffRow).getByTestId('met-funding-message');

        expect(metFundingMessage).toBeTruthy();

        fireEvent.click(metFundingMessage);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/wdf/data'], { fragment: 'staff' });
      });
    });

    describe('parent', () => {
      it('should show all messages as clickable links', async () => {
        const overrides = {
          workplaceWdfEligibilityStatus: true,
          staffWdfEligibilityStatus: true,
          parentOverallWdfEligibility: true,
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

      it('should show all workplace without a link', async () => {
        const overrides = {
          workplaceWdfEligibilityStatus: true,
          staffWdfEligibilityStatus: true,
          parentOverallWdfEligibility: true,
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

      it('should navigate to all workplaces when clicked', async () => {
        const overrides = {
          parentOverallWdfEligibility: true,
          isParent: true,
        };

        const { fixture, getByTestId, routerSpy } = await setup(overrides);

        const allWorkplacesRow = getByTestId('workplaces-row');

        const metFundingMessage = within(allWorkplacesRow).getByTestId('met-funding-message');

        expect(metFundingMessage).toBeTruthy();

        fireEvent.click(metFundingMessage);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/wdf/data'], { fragment: 'workplaces' });
      });
    });
  });

  describe('not meeting funding requirements', () => {
    it('should display the not meeting WDF requirements message for the workplace', async () => {
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

    it('should display the not meeting WDF requirements message for staff', async () => {
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

    it('should display the not meeting WDF requirements message for all other workplaces', async () => {
      const overrides = {
        workplaceWdfEligibilityStatus: false,
        staffWdfEligibilityStatus: false,
        parentOverallWdfEligibility: false,
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

    describe('funding message links', () => {
      it('should navigate to workplace when clicked', async () => {
        const overrides = {
          workplaceWdfEligibilityStatus: false,
          overallWdfEligibility: false,
        };

        const { fixture, getByTestId, routerSpy } = await setup(overrides);

        const workplaceRow = getByTestId('workplace-row');

        const notMetFundingMessage = within(workplaceRow).getByTestId('not-met-funding-message');

        expect(notMetFundingMessage).toBeTruthy();

        fireEvent.click(notMetFundingMessage);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/wdf/data'], { fragment: 'workplace' });
      });

      it('should navigate to staff when clicked', async () => {
        const overrides = {
          staffWdfEligibilityStatus: false,
          overallWdfEligibility: false,
        };

        const { fixture, getByTestId, routerSpy } = await setup(overrides);

        const staffRow = getByTestId('staff-row');

        const notMetFundingMessage = within(staffRow).getByTestId('not-met-funding-message');

        expect(notMetFundingMessage).toBeTruthy();

        fireEvent.click(notMetFundingMessage);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/wdf/data'], { fragment: 'staff' });
      });

      it('should navigate to all workplaces when clicked', async () => {
        const overrides = {
          parentOverallWdfEligibility: false,
          isParent: true,
        };

        const { fixture, getByTestId, routerSpy } = await setup(overrides);

        const workplacesRow = getByTestId('workplaces-row');

        const notMetFundingMessage = within(workplacesRow).getByTestId('not-met-funding-message');

        expect(notMetFundingMessage).toBeTruthy();

        fireEvent.click(notMetFundingMessage);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/wdf/data'], { fragment: 'workplaces' });
      });
    });
  });
});
