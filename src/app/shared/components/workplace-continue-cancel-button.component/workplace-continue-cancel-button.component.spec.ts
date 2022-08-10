import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { fireEvent, render } from '@testing-library/angular';

import { WorkplaceContinueCancelButtonComponent } from './workplace-continue-cancel-button.component';

describe('WorkplaceContinueCancelButtonComponent', () => {
  const setup = async () =>
    render(WorkplaceContinueCancelButtonComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
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
