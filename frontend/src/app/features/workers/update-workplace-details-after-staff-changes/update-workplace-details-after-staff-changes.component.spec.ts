import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import {
  UpdateWorkplaceAfterStaffChangesService,
  WorkplaceUpdateFlowType,
} from '@core/services/update-workplace-after-staff-changes.service';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockUpdateWorkplaceAfterStaffChangesService } from '@core/test-utils/MockUpdateWorkplaceAfterStaffChangesService';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UpdateWorkplaceDetailsAfterStaffChangesComponent } from './update-workplace-details-after-staff-changes.component';

describe('UpdateWorkplaceDetailsAfterStaffChangesComponent', () => {
  async function setup(overrides: any = {}) {
    const workplace = { ...establishmentBuilder(), ...overrides.workplace };
    const flowType = overrides?.flowType || WorkplaceUpdateFlowType.ADD;
    const alertSpy = jasmine.createSpy('addAlert').and.returnValue(Promise.resolve(true));

    const setupTools = await render(UpdateWorkplaceDetailsAfterStaffChangesComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: EstablishmentService,
          useValue: { establishment: workplace },
        },
        {
          provide: UpdateWorkplaceAfterStaffChangesService,
          useFactory: MockUpdateWorkplaceAfterStaffChangesService.factory(
            overrides?.updateWorkplaceAfterStaffChangesService,
          ),
        },
        {
          provide: AlertService,
          useValue: { addAlert: alertSpy },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { flowType },
            },
          },
        },
        BackLinkService,
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
    };
  }

  it('should render the UpdateWorkplaceDetailsAfterStaffChangesComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the Check information title and sub heading', async () => {
    const { getByText } = await setup();

    expect(getByText('Check this information and make any changes before you continue')).toBeTruthy();
    expect(getByText('Total number of staff, vacancies and starters')).toBeTruthy();
  });

  describe('Views when user has visited pages', () => {
    it('should display warning text when user has not visited all of the update question pages', async () => {
      const { getByText } = await setup({
        updateWorkplaceAfterStaffChangesService: { allUpdatePagesVisitedForAdd: () => false },
      });

      expect(
        getByText('This data does not update automatically when you add staff records.', { exact: false }),
      ).toBeTruthy();
      expect(getByText('You need to check and change these yourself.', { exact: false })).toBeTruthy();
    });

    it('should not display warning text when user has visited all of the update question pages', async () => {
      const { queryByText } = await setup({
        updateWorkplaceAfterStaffChangesService: { allUpdatePagesVisited: () => true },
      });

      expect(
        queryByText('This data does not update automatically when you add staff records.', { exact: false }),
      ).toBeFalsy();
      expect(queryByText('You need to check and change these yourself.', { exact: false })).toBeFalsy();
    });

    it('should add alert with starters in message when user has visited all update question pages from add version', async () => {
      const { alertSpy } = await setup({
        updateWorkplaceAfterStaffChangesService: { allUpdatePagesVisited: () => true },
      });

      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Total number of staff, vacancies and starters information saved',
      });
    });

    it('should add alert with leavers in message when user has visited all update question pages from delete version', async () => {
      const { alertSpy } = await setup({
        flowType: WorkplaceUpdateFlowType.DELETE,
        updateWorkplaceAfterStaffChangesService: { allUpdatePagesVisited: () => true },
      });

      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Total number of staff, vacancies and leavers information saved',
      });
    });
  });

  describe('Subtitle', () => {
    it('should include starters in subtitle when on added staff version of page', async () => {
      const { getByText } = await setup();

      expect(getByText('Total number of staff, vacancies and starters')).toBeTruthy();
    });

    it('should include leavers in subtitle when on deleted staff version of page', async () => {
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

      expect(changeLink.getAttribute('href')).toEqual(`/update-total-staff`);
      expect(within(numberOfStaffRow).queryByText('4')).toBeTruthy();
    });

    it('should display dash and an Add link if there is no value for number of staff', async () => {
      const { queryByTestId } = await setup({ workplace: { numberOfStaff: null } });

      const numberOfStaffRow = queryByTestId('numberOfStaff');
      const addLink = within(numberOfStaffRow).queryByText('Add');

      expect(addLink.getAttribute('href')).toEqual(`/update-total-staff`);
      expect(within(numberOfStaffRow).queryByText('-')).toBeTruthy();
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

      expect(link.getAttribute('href')).toEqual(`/update-vacancies`);
      expect(within(vacanciesRow).queryByText('-')).toBeTruthy();
    });

    it("should display Don't know and Change link when set to Don't know", async () => {
      const { getByTestId } = await setup({ workplace: { vacancies: "Don't know" } });

      const vacanciesRow = getByTestId('vacancies');
      const link = within(vacanciesRow).queryByText('Change');

      expect(link.getAttribute('href')).toEqual(`/update-vacancies`);
      expect(within(vacanciesRow).queryByText("Don't know")).toBeTruthy();
    });

    it('should show None and a Change link when set to None', async () => {
      const { getByTestId } = await setup({ workplace: { vacancies: 'None' } });

      const vacanciesRow = getByTestId('vacancies');
      const link = within(vacanciesRow).queryByText('Change');

      expect(link.getAttribute('href')).toEqual(`/update-vacancies`);
      expect(within(vacanciesRow).queryByText('None')).toBeTruthy();
    });

    it(`should show one job vacancy with number of vacancies and a Change link when one job has vacancies`, async () => {
      const vacancies = [{ jobId: 1, title: 'Administrative', total: 3 }];
      const { getByTestId } = await setup({ workplace: { vacancies } });

      const vacanciesRow = getByTestId('vacancies');
      const link = within(vacanciesRow).queryByText('Change');

      expect(link.getAttribute('href')).toEqual(`/update-vacancies`);
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

      expect(link.getAttribute('href')).toEqual(`/update-vacancies`);
      expect(within(vacanciesRow).queryByText(`3 x administrative`)).toBeTruthy();
      expect(within(vacanciesRow).queryByText('2 x nursing')).toBeTruthy();
      expect(within(vacanciesRow).queryByText('4 x other care providing role: special care worker')).toBeTruthy();
    });
  });

  describe('New starters in the last 12 months', () => {
    it('should show the correct wording', async () => {
      const { getByTestId } = await setup();

      const startersRow = getByTestId('starters');

      expect(within(startersRow).getByText('New starters in the last 12 months')).toBeTruthy();
    });

    it('should show dash and have Add link when starters is null', async () => {
      const { getByTestId } = await setup({ workplace: { starters: null } });

      const startersRow = getByTestId('starters');
      const link = within(startersRow).queryByText('Add');

      expect(link.getAttribute('href')).toEqual(`/update-starters`);
      expect(within(startersRow).queryByText('-')).toBeTruthy();
    });

    it("should show Don't know and a Change link when starters is set to Don't know", async () => {
      const { getByTestId } = await setup({ workplace: { starters: "Don't know" } });

      const startersRow = getByTestId('starters');
      const link = within(startersRow).queryByText('Change');

      expect(link.getAttribute('href')).toEqual(`/update-starters`);
      expect(within(startersRow).queryByText("Don't know")).toBeTruthy();
    });

    it('should show None and a Change link when starters is set to None', async () => {
      const { getByTestId } = await setup({ workplace: { starters: 'None' } });

      const startersRow = getByTestId('starters');
      const link = within(startersRow).queryByText('Change');

      expect(link.getAttribute('href')).toEqual(`/update-starters`);
      expect(within(startersRow).queryByText(`None`)).toBeTruthy();
    });

    it('should show one job with number of starters and a Change link when there is one job with starters', async () => {
      const starters = [{ jobId: 1, title: 'Administrative', total: 3 }];
      const { getByTestId } = await setup({ workplace: { starters } });

      const startersRow = getByTestId('starters');
      const link = within(startersRow).queryByText('Change');

      expect(link.getAttribute('href')).toEqual(`/update-starters`);
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

      expect(link.getAttribute('href')).toEqual(`/update-starters`);
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

  it('should navigate to the staff records tab on click of Continue', async () => {
    const { getByText, routerSpy } = await setup();

    const continueButton = getByText('Continue');
    userEvent.click(continueButton);

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], {
      fragment: 'staff-records',
    });
  });
});
