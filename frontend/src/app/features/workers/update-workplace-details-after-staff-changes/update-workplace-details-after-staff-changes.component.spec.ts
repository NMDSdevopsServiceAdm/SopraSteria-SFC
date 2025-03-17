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
});
