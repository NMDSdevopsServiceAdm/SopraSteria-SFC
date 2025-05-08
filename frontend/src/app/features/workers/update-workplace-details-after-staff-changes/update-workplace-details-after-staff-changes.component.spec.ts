import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { VacanciesAndTurnoverService, WorkplaceUpdateFlowType } from '@core/services/vacancies-and-turnover.service';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockVacanciesAndTurnoverService } from '@core/test-utils/MockVacanciesAndTurnoverService';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UpdateWorkplaceDetailsAfterStaffChangesComponent } from './update-workplace-details-after-staff-changes.component';

describe('UpdateWorkplaceDetailsAfterStaffChangesComponent', () => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  async function setup(overrides: any = {}) {
    const workplace = { ...establishmentBuilder(), ...overrides.workplace };
    const flowType = overrides?.flowType || WorkplaceUpdateFlowType.ADD;
    const totalNumberOfStaff = overrides?.totalNumberOfStaff ?? 10;
    const alertSpy = jasmine.createSpy('addAlert').and.returnValue(Promise.resolve(true));
    const showBackLinkSpy = jasmine.createSpy('setBacklink').and.returnValue(Promise.resolve(true));

    const setupTools = await render(UpdateWorkplaceDetailsAfterStaffChangesComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: EstablishmentService,
          useValue: { establishment: workplace },
        },
        {
          provide: VacanciesAndTurnoverService,
          useFactory: MockVacanciesAndTurnoverService.factory(overrides?.vacanciesAndTurnoverService),
        },
        {
          provide: AlertService,
          useValue: { addAlert: alertSpy },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { flowType, totalNumberOfStaff },
            },
          },
        },
        {
          provide: BackLinkService,
          useValue: {
            showBackLink: showBackLinkSpy,
          },
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate');

    return {
      ...setupTools,
      component,
      workplace,
      routerSpy,
      alertSpy,
      showBackLinkSpy,
    };
  }

  it('should render the UpdateWorkplaceDetailsAfterStaffChangesComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should clear any previous job roles selection stored in local service when page is loaded', async () => {
    const clearJobRolesSpy = jasmine.createSpy();
    await setup({
      vacanciesAndTurnoverService: { clearAllSelectedJobRoles: clearJobRolesSpy },
    });

    expect(clearJobRolesSpy).toHaveBeenCalled();
  });

  describe('Views when user has visited/submitted on update pages', () => {
    describe('Warning text', () => {
      it('should display when user has not visited all of the update question pages in add view', async () => {
        const { getByText } = await setup({
          vacanciesAndTurnoverService: {
            allUpdatePagesVisited: () => false,
            allUpdatePagesSubmitted: () => false,
          },
        });

        expect(
          getByText('This data does not update automatically when you add staff records.', { exact: false }),
        ).toBeTruthy();
        expect(getByText('You need to check and change these yourself.', { exact: false })).toBeTruthy();
      });

      it('should display when user has not visited all of the update question pages in delete view', async () => {
        const { getByText } = await setup({
          flowType: WorkplaceUpdateFlowType.DELETE,
          vacanciesAndTurnoverService: {
            allUpdatePagesVisited: () => false,
            allUpdatePagesSubmitted: () => false,
          },
        });

        expect(
          getByText('This data does not update automatically when you delete staff records.', { exact: false }),
        ).toBeTruthy();
        expect(getByText('You need to check and change these yourself.', { exact: false })).toBeTruthy();
      });

      it('should not display when user has visited all of the update question pages', async () => {
        const { queryByText } = await setup({
          vacanciesAndTurnoverService: {
            allUpdatePagesVisited: () => true,
            allUpdatePagesSubmitted: () => false,
          },
        });

        expect(
          queryByText('This data does not update automatically when you add staff records.', { exact: false }),
        ).toBeFalsy();
        expect(queryByText('You need to check and change these yourself.', { exact: false })).toBeFalsy();
      });
    });

    describe('Saved banner', () => {
      it('should add alert with starters in message when user has submitted on all update question pages from add version', async () => {
        const { alertSpy } = await setup({
          vacanciesAndTurnoverService: {
            allUpdatePagesVisited: () => true,
            allUpdatePagesSubmitted: () => true,
          },
        });

        expect(alertSpy).toHaveBeenCalledWith({
          type: 'success',
          message: 'Total number of staff, vacancies and starters information saved',
        });
      });

      it('should add alert with leavers in message when user has submitted on all update question pages from delete version', async () => {
        const { alertSpy } = await setup({
          flowType: WorkplaceUpdateFlowType.DELETE,
          vacanciesAndTurnoverService: {
            allUpdatePagesVisited: () => true,
            allUpdatePagesSubmitted: () => true,
          },
        });

        expect(alertSpy).toHaveBeenCalledWith({
          type: 'success',
          message: 'Total number of staff, vacancies and leavers information saved',
        });
      });

      it('should not add alert when user has visited but not submitted on all update question pages', async () => {
        const { alertSpy } = await setup({
          vacanciesAndTurnoverService: {
            allUpdatePagesVisited: () => true,
            allUpdatePagesSubmitted: () => false,
          },
        });

        expect(alertSpy).not.toHaveBeenCalled();
      });

      it('should not add alert when user has submitted on all update question pages but has already seen banner', async () => {
        const { alertSpy } = await setup({
          vacanciesAndTurnoverService: {
            allUpdatePagesVisited: () => true,
            allUpdatePagesSubmitted: () => true,
            hasViewedSavedBanner: true,
          },
        });

        expect(alertSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('Sub heading', () => {
    it('should include starters in sub heading when on added staff version of page', async () => {
      const { getByText } = await setup();

      expect(getByText('Total number of staff, vacancies and starters')).toBeTruthy();
    });

    it('should include leavers in sub heading when on deleted staff version of page', async () => {
      const { getByText } = await setup({ flowType: WorkplaceUpdateFlowType.DELETE });

      expect(getByText('Total number of staff, vacancies and leavers')).toBeTruthy();
    });
  });

  describe('Number of staff', () => {
    it('should show the correct wording', async () => {
      const { getByTestId } = await setup();

      const numberOfStaffRow = getByTestId('numberOfStaff');

      expect(within(numberOfStaffRow).getByText('Total number of staff')).toBeTruthy();
    });

    it('should display the number of staff and a Change link when question answered', async () => {
      const { queryByTestId } = await setup({ workplace: { numberOfStaff: 4 } });

      const numberOfStaffRow = queryByTestId('numberOfStaff');
      const changeLink = within(numberOfStaffRow).queryByText('Change');

      expect(changeLink.getAttribute('ng-reflect-router-link')).toEqual('update-total-staff');
      expect(within(numberOfStaffRow).queryByText('4')).toBeTruthy();
    });

    it('should display dash and an Add link if there is no value for number of staff', async () => {
      const { queryByTestId } = await setup({ workplace: { numberOfStaff: null } });

      const numberOfStaffRow = queryByTestId('numberOfStaff');
      const addLink = within(numberOfStaffRow).queryByText('Add');

      expect(addLink.getAttribute('ng-reflect-router-link')).toEqual('update-total-staff');
      expect(within(numberOfStaffRow).queryByText('-')).toBeTruthy();
    });

    it('should display 0 and a Change link if the number of staff is 0', async () => {
      const { queryByTestId } = await setup({ workplace: { numberOfStaff: 0 } });

      const numberOfStaffRow = queryByTestId('numberOfStaff');
      const changeLink = within(numberOfStaffRow).queryByText('Change');

      expect(changeLink.getAttribute('ng-reflect-router-link')).toEqual('update-total-staff');
      expect(within(numberOfStaffRow).queryByText('0')).toBeTruthy();
    });
  });

  describe('Current staff vacancies', () => {
    it('should show the correct wording', async () => {
      const { getByTestId } = await setup();

      const vacanciesRow = getByTestId('vacancies');

      expect(within(vacanciesRow).getByText('Current staff vacancies')).toBeTruthy();
    });

    it('should display dash and Add link when null', async () => {
      const { getByTestId } = await setup({ workplace: { vacancies: null } });

      const vacanciesRow = getByTestId('vacancies');
      const link = within(vacanciesRow).queryByText('Add');

      expect(link.getAttribute('ng-reflect-router-link')).toEqual('update-vacancies');
      expect(within(vacanciesRow).queryByText('-')).toBeTruthy();
    });

    it("should display Don't know and Change link when set to Don't know", async () => {
      const { getByTestId } = await setup({ workplace: { vacancies: "Don't know" } });

      const vacanciesRow = getByTestId('vacancies');
      const link = within(vacanciesRow).queryByText('Change');

      expect(link.getAttribute('ng-reflect-router-link')).toEqual('update-vacancies');
      expect(within(vacanciesRow).queryByText("Don't know")).toBeTruthy();
    });

    it('should show None and a Change link when set to None', async () => {
      const { getByTestId } = await setup({ workplace: { vacancies: 'None' } });

      const vacanciesRow = getByTestId('vacancies');
      const link = within(vacanciesRow).queryByText('Change');

      expect(link.getAttribute('ng-reflect-router-link')).toEqual('update-vacancies');
      expect(within(vacanciesRow).queryByText('None')).toBeTruthy();
    });

    it(`should show one job vacancy with number of vacancies and a Change link when one job has vacancies`, async () => {
      const vacancies = [{ jobId: 1, title: 'Administrative', total: 3 }];
      const { getByTestId } = await setup({ workplace: { vacancies } });

      const vacanciesRow = getByTestId('vacancies');
      const link = within(vacanciesRow).queryByText('Change');

      expect(link.getAttribute('ng-reflect-router-link')).toEqual('update-vacancies');
      expect(within(vacanciesRow).queryByText('3 x administrative')).toBeTruthy();
    });

    it('should show multiple job vacancies with the number of vacancies for each job and a Change link when multiple jobs have vacancies', async () => {
      const vacancies = [
        { jobId: 1, title: 'Administrative', total: 3 },
        { jobId: 2, title: 'Nursing', total: 2 },
        { jobId: 3, title: 'Other care providing role', total: 4, other: 'Special care worker' },
      ];
      const { getByTestId } = await setup({ workplace: { vacancies } });

      const vacanciesRow = getByTestId('vacancies');
      const link = within(vacanciesRow).queryByText('Change');

      expect(link.getAttribute('ng-reflect-router-link')).toEqual('update-vacancies');
      expect(within(vacanciesRow).queryByText(`3 x administrative`)).toBeTruthy();
      expect(within(vacanciesRow).queryByText('2 x nursing')).toBeTruthy();
      expect(within(vacanciesRow).queryByText('4 x other care providing role: special care worker')).toBeTruthy();
    });
  });

  describe('Starters in the last 12 months', () => {
    it('should show the correct wording', async () => {
      const { getByTestId } = await setup();

      const startersRow = getByTestId('starters');

      expect(within(startersRow).getByText('Starters in the last 12 months')).toBeTruthy();
    });

    it('should show dash and have Add link when starters is null', async () => {
      const { getByTestId } = await setup({ workplace: { starters: null } });

      const startersRow = getByTestId('starters');
      const link = within(startersRow).queryByText('Add');

      expect(link.getAttribute('ng-reflect-router-link')).toEqual('update-starters');
      expect(within(startersRow).queryByText('-')).toBeTruthy();
    });

    it("should show Don't know and a Change link when starters is set to Don't know", async () => {
      const { getByTestId } = await setup({ workplace: { starters: "Don't know" } });

      const startersRow = getByTestId('starters');
      const link = within(startersRow).queryByText('Change');

      expect(link.getAttribute('ng-reflect-router-link')).toEqual('update-starters');
      expect(within(startersRow).queryByText("Don't know")).toBeTruthy();
    });

    it('should show None and a Change link when starters is set to None', async () => {
      const { getByTestId } = await setup({ workplace: { starters: 'None' } });

      const startersRow = getByTestId('starters');
      const link = within(startersRow).queryByText('Change');

      expect(link.getAttribute('ng-reflect-router-link')).toEqual('update-starters');
      expect(within(startersRow).queryByText(`None`)).toBeTruthy();
    });

    it('should show one job with number of starters and a Change link when there is one job with starters', async () => {
      const starters = [{ jobId: 1, title: 'Administrative', total: 3 }];
      const { getByTestId } = await setup({ workplace: { starters } });

      const startersRow = getByTestId('starters');
      const link = within(startersRow).queryByText('Change');

      expect(link.getAttribute('ng-reflect-router-link')).toEqual('update-starters');
      expect(within(startersRow).queryByText(`3 x administrative`)).toBeTruthy();
    });

    it('should show jobs with number of starters for each job and a Change link when multiple jobs have starters', async () => {
      const starters = [
        { jobId: 1, title: 'Administrative', total: 3 },
        { jobId: 2, title: 'Nursing', total: 2 },
        { jobId: 3, title: 'Other care providing role', total: 4, other: 'Special care worker' },
      ];
      const { getByTestId } = await setup({ workplace: { starters } });

      const startersRow = getByTestId('starters');
      const link = within(startersRow).queryByText('Change');

      expect(link.getAttribute('ng-reflect-router-link')).toEqual('update-starters');
      expect(within(startersRow).queryByText(`3 x administrative`)).toBeTruthy();
      expect(within(startersRow).queryByText('2 x nursing')).toBeTruthy();
      expect(within(startersRow).queryByText('4 x other care providing role: special care worker')).toBeTruthy();
    });

    it('should not display starters section if on the staff deleted version of page', async () => {
      const { queryByTestId } = await setup({ flowType: WorkplaceUpdateFlowType.DELETE });

      const startersRow = queryByTestId('starters');
      expect(startersRow).toBeFalsy();
    });
  });

  describe('Leavers in the last 12 months', () => {
    it('should show the correct wording', async () => {
      const { getByTestId } = await setup({ flowType: WorkplaceUpdateFlowType.DELETE });

      const startersRow = getByTestId('leavers');

      expect(within(startersRow).getByText('Leavers in the last 12 months')).toBeTruthy();
    });

    it('should show dash and have Add link when leavers is null', async () => {
      const { getByTestId } = await setup({
        flowType: WorkplaceUpdateFlowType.DELETE,
        workplace: { leavers: null },
      });

      const leaversRow = getByTestId('leavers');
      const link = within(leaversRow).queryByText('Add');

      expect(link.getAttribute('ng-reflect-router-link')).toEqual('update-leavers');
      expect(within(leaversRow).queryByText('-')).toBeTruthy();
    });

    it("should show Don't know and a Change link when leavers is set to Don't know", async () => {
      const { getByTestId } = await setup({
        flowType: WorkplaceUpdateFlowType.DELETE,
        workplace: { leavers: "Don't know" },
      });

      const leaversRow = getByTestId('leavers');
      const link = within(leaversRow).queryByText('Change');

      expect(link.getAttribute('ng-reflect-router-link')).toEqual('update-leavers');
      expect(within(leaversRow).queryByText("Don't know")).toBeTruthy();
    });

    it('should show None and a Change link when leavers is set to None', async () => {
      const { getByTestId } = await setup({
        flowType: WorkplaceUpdateFlowType.DELETE,
        workplace: { leavers: 'None' },
      });

      const leaversRow = getByTestId('leavers');
      const link = within(leaversRow).queryByText('Change');

      expect(link.getAttribute('ng-reflect-router-link')).toEqual('update-leavers');
      expect(within(leaversRow).queryByText(`None`)).toBeTruthy();
    });

    it('should show one job with number of leavers and a Change link when there is one job with leavers', async () => {
      const leavers = [{ jobId: 1, title: 'Administrative', total: 3 }];
      const { getByTestId } = await setup({
        flowType: WorkplaceUpdateFlowType.DELETE,
        workplace: { leavers },
      });

      const leaversRow = getByTestId('leavers');
      const link = within(leaversRow).queryByText('Change');

      expect(link.getAttribute('ng-reflect-router-link')).toEqual('update-leavers');
      expect(within(leaversRow).queryByText(`3 x administrative`)).toBeTruthy();
    });

    it('should show jobs with number of leavers for each job and a Change link when multiple jobs have leavers', async () => {
      const leavers = [
        { jobId: 1, title: 'Administrative', total: 3 },
        { jobId: 2, title: 'Nursing', total: 2 },
        { jobId: 3, title: 'Other care providing role', total: 4, other: 'Special care worker' },
      ];
      const { getByTestId } = await setup({
        flowType: WorkplaceUpdateFlowType.DELETE,
        workplace: { leavers },
      });

      const leaversRow = getByTestId('leavers');
      const link = within(leaversRow).queryByText('Change');

      expect(link.getAttribute('ng-reflect-router-link')).toEqual('update-leavers');
      expect(within(leaversRow).queryByText(`3 x administrative`)).toBeTruthy();
      expect(within(leaversRow).queryByText('2 x nursing')).toBeTruthy();
      expect(within(leaversRow).queryByText('4 x other care providing role: special care worker')).toBeTruthy();
    });

    it('should not display leavers section if on the staff deleted version of page', async () => {
      const { queryByTestId } = await setup({ flowType: WorkplaceUpdateFlowType.ADD });

      const leaversRow = queryByTestId('leavers');
      expect(leaversRow).toBeFalsy();
    });
  });

  it('should navigate to the staff records tab on click of Continue', async () => {
    const { getByText, routerSpy } = await setup();

    const continueButton = getByText('Continue');
    userEvent.click(continueButton);

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], {
      fragment: 'staff-records',
    });
  });

  describe('Displaying back link', () => {
    it('should display back link when there is at least 1 staff record', async () => {
      const { showBackLinkSpy } = await setup({ totalNumberOfStaff: 1 });

      expect(showBackLinkSpy).toHaveBeenCalled();
    });

    it('should not display a back link when there are no staff records (come to page directly from delete)', async () => {
      const { showBackLinkSpy } = await setup({ totalNumberOfStaff: 0 });

      expect(showBackLinkSpy).not.toHaveBeenCalled();
    });
  });
});
