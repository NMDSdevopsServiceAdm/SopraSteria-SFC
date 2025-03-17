import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { UpdateWorkplaceDetailsAfterStaffChangesComponent } from './update-workplace-details-after-staff-changes.component';

describe('UpdateWorkplaceDetailsAfterStaffChangesComponent', () => {
  async function setup() {
    const setupTools = await render(UpdateWorkplaceDetailsAfterStaffChangesComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [UntypedFormBuilder],
    });

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
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
});
