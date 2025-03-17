import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { TotalNumberOfStaffComponent } from './total-number-of-staff.component';

fdescribe('TotalNumberOfStaffComponent', () => {
  const setup = async () => {
    const setupTools = await render(TotalNumberOfStaffComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [],
    });

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should show a page heading', async () => {
      const { getByRole } = await setup();

      const expectedHeading = 'Update the total number of staff for your workplace';
      expect(getByRole('heading', { level: 1, name: expectedHeading })).toBeTruthy();
    });

    it('should show a reveal text to explain Why we ask for this information', async () => {
      const { getByText } = await setup();
      const revealText = getByText('Why we ask for this information');

      expect(revealText).toBeTruthy();
      userEvent.click(revealText);

      const revealTextContent =
        'We need to know the total number of staff employed in workplaces so that we can calculate how many people work in the sector. ' +
        'We also use it to work out turnover and vacancy rates, staff to service ratios and to see if the sector is growing.';
      expect(getByText(revealTextContent)).toBeTruthy();
    });

    it('should show a Save and return button and a Cancel link', async () => {
      const { getByRole, getByText } = await setup();

      expect(getByRole('button', { name: 'Save and return' })).toBeTruthy();

      const cancelLink = getByText('Cancel');
      expect(cancelLink).toBeTruthy();
    });

    it('should show an input box for number of staff', async () => {
      const { getByLabelText, getByText } = await setup();

      expect(getByText('Number of staff')).toBeTruthy();
      expect(getByLabelText('Number of staff')).toBeTruthy();
    });
  });
});
