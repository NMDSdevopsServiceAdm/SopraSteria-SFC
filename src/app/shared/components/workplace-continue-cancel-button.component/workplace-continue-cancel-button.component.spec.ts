import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { fireEvent, render } from '@testing-library/angular';

import { WorkplaceContinueCancelButtonComponent } from './workplace-continue-cancel-button.component';

describe('WorkplaceContinueCancelButtonComponent', () => {
  const setup = async () =>
    render(WorkplaceContinueCancelButtonComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      componentProperties: {
        marginTop4: false,
      },
    });

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  it(`should render the 'Continue' button and 'Cancel' link`, async () => {
    const { getByText } = await setup();

    expect(getByText('Continue')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('should render the button without conditional margin class by default', async () => {
    const { getByTestId } = await setup();

    const container = getByTestId('button-container');
    expect(container.getAttribute('class')).not.toContain('govuk-!-margin-top-4');
  });

  it('should render the button with a margin top of 4 if marginTop4 is set to true', async () => {
    const { rerender, getByTestId } = await setup();

    const container = getByTestId('button-container');
    rerender({ marginTop4: true });
    expect(container.getAttribute('class')).toContain('govuk-!-margin-top-4');
  });

  it(`should emit the 'continue' and save event on button click`, async () => {
    const { fixture, getByText } = await setup();

    const spy = spyOn(fixture.componentInstance.clicked, 'emit');
    expect(spy).not.toHaveBeenCalled();

    fireEvent.click(getByText('Continue'));
    expect(spy).toHaveBeenCalledWith({ action: 'continue', save: true });
  });

  it(`should emit the 'continue' and save event on button click`, async () => {
    const { fixture, getByText } = await setup();

    const spy = spyOn(fixture.componentInstance.clicked, 'emit');
    expect(spy).not.toHaveBeenCalled();

    fireEvent.click(getByText('Cancel'));
    expect(spy).toHaveBeenCalledWith({ action: 'return', save: false });
  });
});
