import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { render } from '@testing-library/angular';

import { TotalStaffComponent } from './total-staff.component';

describe('TotalStaffComponent', () => {
  const setup = async (showHint = true) => {
    const { fixture, getByTestId, queryByTestId, getByText } = await render(TotalStaffComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      componentProperties: {
        establishmentUid: 'mock-uid',
        showHint,
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
