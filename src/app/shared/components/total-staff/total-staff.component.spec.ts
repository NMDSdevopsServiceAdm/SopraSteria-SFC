import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { render } from '@testing-library/angular';

import { TotalStaffComponent } from './total-staff.component';

describe('TotalStaffComponent', () => {
  const setup = async (showHint = true) => {
    const { fixture, getByTestId, queryByTestId } = await render(TotalStaffComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      componentProperties: {
        establishmentUid: 'mock-uid',
        showHint,
      },
    });

    const component = fixture.componentInstance;

    return { component, getByTestId, queryByTestId };
  };

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the hint if show hint is true', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('hint')).toBeTruthy();
  });

  it('should not show the hint if showHint is set to false', async () => {
    const { queryByTestId } = await setup(false);

    expect(queryByTestId('hint')).toBeFalsy();
  });
});
