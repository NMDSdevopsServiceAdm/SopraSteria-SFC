import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { fireEvent, render } from '@testing-library/angular';

import { SelectStaffErrorSummaryComponent } from './select-staff-error-summary.component';

describe('SelectStaffErrorSummaryComponent', () => {
  async function setup() {
    const { fixture, getByText, getByTestId } = await render(SelectStaffErrorSummaryComponent, {
      imports: [RouterModule, RouterTestingModule],
      declarations: [],
      providers: [],
      componentProperties: {
        errorsMap: [
          {
            item: 'error1',
            type: [
              {
                name: 'errorType',
                message: 'This is the error message',
              },
            ],
          },
        ],
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      getByText,
      getByTestId,
    };
  }

  it('should render the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the errors messages as links inside an error summary box', async () => {
    const { getByText, getByTestId } = await setup();

    expect(getByTestId('error-summary-box')).toBeTruthy();
    expect(getByText('This is the error message')).toBeTruthy();
  });

  it('should render the links with the correct href', async () => {
    const { getByText } = await setup();

    const errorLink = getByText('This is the error message');
    expect(errorLink.getAttribute('href')).toEqual('/#error1-error');
  });

  it('should call the focusOnField function when clicking the link', async () => {
    const { component, getByText } = await setup();

    const spy = spyOn(component, 'focusOnField');

    const errorLink = getByText('This is the error message');
    fireEvent.click(errorLink);

    expect(spy).toHaveBeenCalledWith('error1');
  });
});
