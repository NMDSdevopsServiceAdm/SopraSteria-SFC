import { fireEvent, render, within } from '@testing-library/angular';
import { WdfSummaryPanel } from './wdf-summary-panel.component';
import { getTestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '@shared/shared.module';

describe('WdfSummaryPanel', () => {
  const currentYear = new Date().getFullYear();

  const messages = {
    fundingMet: 'Your data has met the funding requirements for 2024 to 2025',
    fundingNotMet: 'Your data does not meet the funding requirements for 2024 to 2025',
  };

  let isWorkplaceWdfEligibile = false;
  let isStaffWdfEligibile = false;
  let isParentOverallWdfEligibile = false;
  let isWorkplaceAParent = false;
  let isOverallWdfEligibile = false;

  const setup = async (
    workplaceWdfEligibilityStatus = isWorkplaceWdfEligibile,
    staffWdfEligibilityStatus = isStaffWdfEligibile,
    parentOverallWdfEligibility = isParentOverallWdfEligibile,
    isParent = isWorkplaceAParent,
    overallWdfEligibility = isOverallWdfEligibile,
  ) => {
    const { fixture, getByText, queryByText, getByTestId, queryByTestId } = await render(WdfSummaryPanel, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule],
      providers: [],
      componentProperties: {
        workplaceWdfEligibilityStatus: workplaceWdfEligibilityStatus,
        staffWdfEligibilityStatus: staffWdfEligibilityStatus,
        wdfStartDate: `1 April ${currentYear}`,
        wdfEndDate: `31 March ${currentYear + 1}`,
        isParent: isParent,
        parentOverallWdfEligibility: parentOverallWdfEligibility,
        overallWdfEligibility: overallWdfEligibility,
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
      isWorkplaceWdfEligibile = true;
      isOverallWdfEligibile = false;

      const { getByTestId } = await setup();

      const workplaceRow = getByTestId('workplace-row');

      expect(workplaceRow).toBeTruthy();
      expect(within(workplaceRow).queryByText(messages.fundingNotMet)).toBeFalsy();
      expect(within(workplaceRow).getByText(messages.fundingMet)).toBeTruthy();
      expect(within(workplaceRow).getByTestId('green-tick')).toBeTruthy();
    });

    it('should display the correct message with timeframe for meeting WDF requirements for the workplace if overall has met but workplace hasn\t', async () => {
      isWorkplaceWdfEligibile = false;
      isOverallWdfEligibile = true;

      const { getByTestId } = await setup();

      const workplaceRow = getByTestId('workplace-row');

      expect(workplaceRow).toBeTruthy();
      expect(within(workplaceRow).queryByText(messages.fundingNotMet)).toBeFalsy();
      expect(within(workplaceRow).getByText(messages.fundingMet)).toBeTruthy();
      expect(within(workplaceRow).getByTestId('green-tick')).toBeTruthy();
    });

    it('should display the correct message with timeframe for meeting WDF requirements for staff', async () => {
      isStaffWdfEligibile = true;
      isOverallWdfEligibile = false;

      const { getByTestId } = await setup();

      const staffRow = getByTestId('staff-row');

      expect(staffRow).toBeTruthy();
      expect(within(staffRow).queryByText(messages.fundingNotMet)).toBeFalsy();
      expect(within(staffRow).getByText(messages.fundingMet)).toBeTruthy();
      expect(within(staffRow).getByTestId('green-tick')).toBeTruthy();
    });

    it("should display the correct message with timeframe for meeting WDF requirements for staff if overall has met but staff hasn't", async () => {
      isStaffWdfEligibile = false;
      isOverallWdfEligibile = true;

      const { getByTestId } = await setup();

      const staffRow = getByTestId('staff-row');

      expect(staffRow).toBeTruthy();
      expect(within(staffRow).queryByText(messages.fundingNotMet)).toBeFalsy();
      expect(within(staffRow).getByText(messages.fundingMet)).toBeTruthy();
      expect(within(staffRow).getByTestId('green-tick')).toBeTruthy();
    });

    it('should display the correct message with timeframe for meeting WDF requirements for all other workplaces', async () => {
      isWorkplaceAParent = true;
      isParentOverallWdfEligibile = true;

      const { getByTestId } = await setup();

      const workplacesRow = getByTestId('workplaces-row');

      expect(workplacesRow).toBeTruthy();
      expect(within(workplacesRow).queryByText(messages.fundingNotMet)).toBeFalsy();
      expect(within(workplacesRow).getByText(messages.fundingMet)).toBeTruthy();
      expect(within(workplacesRow).getByTestId('green-tick')).toBeTruthy();
    });

    describe('funding message links', () => {
      it('should navigate to workplace when clicked', async () => {
        isWorkplaceWdfEligibile = true;

        const { fixture, getByTestId, routerSpy } = await setup();

        const workplaceRow = getByTestId('workplace-row');

        const metFundingMessage = within(workplaceRow).getByTestId('met-funding-message');

        expect(metFundingMessage).toBeTruthy();

        fireEvent.click(metFundingMessage);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/wdf/data'], { fragment: 'workplace' });
      });

      it('should navigate to staff when clicked', async () => {
        isStaffWdfEligibile = true;

        const { fixture, getByTestId, routerSpy } = await setup();

        const staffRow = getByTestId('staff-row');

        const metFundingMessage = within(staffRow).getByTestId('met-funding-message');

        expect(metFundingMessage).toBeTruthy();

        fireEvent.click(metFundingMessage);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/wdf/data'], { fragment: 'staff' });
      });

      it('should navigate to all workplaces when clicked', async () => {
        isWorkplaceAParent = true;
        isParentOverallWdfEligibile = true;

        const { fixture, getByTestId, routerSpy } = await setup();

        const workplacesRow = getByTestId('workplaces-row');

        const metFundingMessage = within(workplacesRow).getByTestId('met-funding-message');

        expect(metFundingMessage).toBeTruthy();

        fireEvent.click(metFundingMessage);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/wdf/data'], { fragment: 'workplaces' });
      });
    });
  });

  describe('not meeting funding requirements', () => {
    it('should display the not meeting WDF requirements message for the workplace', async () => {
      isWorkplaceWdfEligibile = false;
      isStaffWdfEligibile = false;
      isOverallWdfEligibile = false;

      const { getByTestId } = await setup();

      const workplaceRow = getByTestId('workplace-row');

      expect(workplaceRow).toBeTruthy();
      expect(within(workplaceRow).queryByText(messages.fundingMet)).toBeFalsy();
      expect(within(workplaceRow).getByText(messages.fundingNotMet)).toBeTruthy();
      expect(within(workplaceRow).getByTestId('red-flag')).toBeTruthy();
    });

    it('should display the not meeting WDF requirements message for staff', async () => {
      isWorkplaceWdfEligibile = false;
      isStaffWdfEligibile = false;
      isOverallWdfEligibile = false;

      const { getByTestId } = await setup();

      const staffRow = getByTestId('staff-row');

      expect(staffRow).toBeTruthy();
      expect(within(staffRow).queryByText(messages.fundingMet)).toBeFalsy();
      expect(within(staffRow).getByText(messages.fundingNotMet)).toBeTruthy();
      expect(within(staffRow).getByTestId('red-flag')).toBeTruthy();
    });

    it('should display the not meeting WDF requirements message for all other workplaces', async () => {
      isWorkplaceWdfEligibile = false;
      isStaffWdfEligibile = false;
      isWorkplaceAParent = true;
      isParentOverallWdfEligibile = false;
      isOverallWdfEligibile = false;

      const { getByTestId } = await setup();

      const workplacesRow = getByTestId('workplaces-row');

      expect(workplacesRow).toBeTruthy();
      expect(within(workplacesRow).queryByText(messages.fundingMet)).toBeFalsy();
      expect(within(workplacesRow).getByText(messages.fundingNotMet)).toBeTruthy();
      expect(within(workplacesRow).getByTestId('red-flag')).toBeTruthy();
    });

    describe('funding message links', () => {
      it('should navigate to workplace when clicked', async () => {
        isWorkplaceWdfEligibile = false;
        isOverallWdfEligibile = false;

        const { fixture, getByTestId, routerSpy } = await setup();

        const workplaceRow = getByTestId('workplace-row');

        const notMetFundingMessage = within(workplaceRow).getByTestId('not-met-funding-message');

        expect(notMetFundingMessage).toBeTruthy();

        fireEvent.click(notMetFundingMessage);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/wdf/data'], { fragment: 'workplace' });
      });

      it('should navigate to staff when clicked', async () => {
        isStaffWdfEligibile = false;
        isOverallWdfEligibile = false;

        const { fixture, getByTestId, routerSpy } = await setup();

        const staffRow = getByTestId('staff-row');

        const notMetFundingMessage = within(staffRow).getByTestId('not-met-funding-message');

        expect(notMetFundingMessage).toBeTruthy();

        fireEvent.click(notMetFundingMessage);
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/wdf/data'], { fragment: 'staff' });
      });

      it('should navigate to all workplaces when clicked', async () => {
        isWorkplaceAParent = true;
        isParentOverallWdfEligibile = false;

        const { fixture, getByTestId, routerSpy } = await setup();

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
