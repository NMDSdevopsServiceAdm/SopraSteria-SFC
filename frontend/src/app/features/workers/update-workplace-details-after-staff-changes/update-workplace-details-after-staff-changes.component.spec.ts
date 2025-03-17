import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { UpdateWorkplaceDetailsAfterStaffChangesComponent } from './update-workplace-details-after-staff-changes.component';

describe('UpdateWorkplaceDetailsAfterStaffChangesComponent', () => {
  async function setup(overrides: any = {}) {
    const workplace = { ...establishmentBuilder(), ...overrides.workplace };

    const setupTools = await render(UpdateWorkplaceDetailsAfterStaffChangesComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: EstablishmentService,
          useValue: { establishment: workplace },
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
      workplace,
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

  describe('Number of staff', () => {
    it('should display the number of staff and a Change link when question answered', async () => {
      const { queryByTestId, workplace } = await setup({ workplace: { numberOfStaff: 4 } });

      const numberOfStaffRow = queryByTestId('numberOfStaff');
      const changeLink = within(numberOfStaffRow).queryByText('Change');

      expect(changeLink.getAttribute('href')).toEqual(`/workplace/${workplace.uid}/update-total-staff`);
      expect(within(numberOfStaffRow).queryByText('4')).toBeTruthy();
    });

    it('should display dash and an Add link if there is no value for number of staff', async () => {
      const { queryByTestId, workplace } = await setup({ workplace: { numberOfStaff: null } });

      const numberOfStaffRow = queryByTestId('numberOfStaff');
      const addLink = within(numberOfStaffRow).queryByText('Add');

      expect(addLink.getAttribute('href')).toEqual(`/workplace/${workplace.uid}/update-total-staff`);
      expect(within(numberOfStaffRow).queryByText('-')).toBeTruthy();
    });
  });

  describe('Current staff vacancies', () => {
    it('should display dash and Add link when null', async () => {
      const { workplace, getByTestId } = await setup({ workplace: { vacancies: null } });

      const vacanciesRow = getByTestId('vacancies');
      const link = within(vacanciesRow).queryByText('Add');

      expect(link.getAttribute('href')).toEqual(`/workplace/${workplace.uid}/update-vacancies`);
      expect(within(vacanciesRow).queryByText('-')).toBeTruthy();
    });

    it("should display Don't know and Change link when set to Don't know", async () => {
      const { workplace, getByTestId } = await setup({ workplace: { vacancies: "Don't know" } });

      const vacanciesRow = getByTestId('vacancies');
      const link = within(vacanciesRow).queryByText('Change');

      expect(link.getAttribute('href')).toEqual(`/workplace/${workplace.uid}/update-vacancies`);
      expect(within(vacanciesRow).queryByText("Don't know")).toBeTruthy();
    });

    it('should show None and a Change link when set to None', async () => {
      const { workplace, getByTestId } = await setup({ workplace: { vacancies: 'None' } });

      const vacanciesRow = getByTestId('vacancies');
      const link = within(vacanciesRow).queryByText('Change');

      expect(link.getAttribute('href')).toEqual(`/workplace/${workplace.uid}/update-vacancies`);
      expect(within(vacanciesRow).queryByText('None')).toBeTruthy();
    });

    it(`should show one job vacancy with number of vacancies and a Change link when one job has vacancies`, async () => {
      const vacancies = [{ jobId: 1, title: 'Administrative', total: 3 }];
      const { workplace, getByTestId } = await setup({ workplace: { vacancies } });

      const vacanciesRow = getByTestId('vacancies');
      const link = within(vacanciesRow).queryByText('Change');

      expect(link.getAttribute('href')).toEqual(`/workplace/${workplace.uid}/update-vacancies`);
      expect(within(vacanciesRow).queryByText('3 Administrative')).toBeTruthy();
    });

    it('should show multiple job vacancies with the number of vacancies for each job and a Change link when multiple jobs have vacancies', async () => {
      const vacancies = [
        { jobId: 1, title: 'Administrative', total: 3 },
        { jobId: 2, title: 'Nursing', total: 2 },
        { jobId: 3, title: 'Other care providing role', total: 4, other: 'Special care worker' },
      ];
      const { workplace, getByTestId } = await setup({ workplace: { vacancies } });

      const vacanciesRow = getByTestId('vacancies');
      const link = within(vacanciesRow).queryByText('Change');

      expect(link.getAttribute('href')).toEqual(`/workplace/${workplace.uid}/update-vacancies`);
      expect(within(vacanciesRow).queryByText(`3 Administrative`)).toBeTruthy();
      expect(within(vacanciesRow).queryByText('2 Nursing')).toBeTruthy();
      expect(within(vacanciesRow).queryByText('4 Other care providing role: Special care worker')).toBeTruthy();
    });
  });
});
