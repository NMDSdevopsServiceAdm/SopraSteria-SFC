import { HttpClientTestingModule } from '@angular/common/http/testing';
import { render } from '@testing-library/angular';

import { TotalStaffComponent } from './total-staff.component';
import { SharedModule } from '@shared/shared.module';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';

describe('TotalStaffComponent', () => {
  const formBuilder = new UntypedFormBuilder();

  const setup = async (showHint = true) => {
    const { fixture, getByTestId, queryByTestId, getByText } = await render(TotalStaffComponent, {
      imports: [HttpClientTestingModule, SharedModule, ReactiveFormsModule],
      componentProperties: {
        establishmentUid: 'mock-uid',
        showHint,
        form: formBuilder.group({ totalStaff: '' }),
      },
    });

    const component = fixture.componentInstance;

    return { component, getByTestId, queryByTestId, getByText };
  };

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the reveal', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('totalStaffRevealTitle')).toBeTruthy();
    expect(getByTestId('totalStaffRevealText')).toBeTruthy();
  });
});
