import { RouterTestingModule } from '@angular/router/testing';
import { fireEvent, render } from '@testing-library/angular';

import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SubmitButtonComponent } from './submit-button.component';

describe('SubmitButtonComponent', () => {
  const setup = async () =>
    render(SubmitButtonComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      componentProperties: {
        exitText: 'Exit',
        isExistingStaffRecord: false,
      },
    });

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the correct exit text with a fallback', async () => {
    const { rerender, getByText } = await setup();

    expect(getByText('Exit')).toBeTruthy();

    // update directive
    rerender({ exitText: 'Cancel FooBar' });
    expect(getByText('Cancel FooBar')).toBeTruthy();
  });

  it('should render the default view', async () => {
    const { getByText } = await setup();

    expect(getByText('Save and continue')).toBeTruthy();
    expect(getByText('View record summary')).toBeTruthy();
    expect(getByText('Exit')).toBeTruthy();
  });

  it('should render the correctly if an isExistingStaffRecord is true', async () => {
    const { fixture, getByText, queryByText } = await setup();

    fixture.componentInstance.isExistingStaffRecord = true;
    fixture.detectChanges();

    expect(getByText('Save and continue')).toBeTruthy();
    expect(getByText('View this staff record')).toBeTruthy();
    expect(queryByText('Exit')).toBe(null);
  });

  it(`should emit the 'continue' and save event on button click`, async () => {
    const { fixture, getByText } = await setup();

    const spy = spyOn(fixture.componentInstance.clicked, 'emit');
    expect(spy).not.toHaveBeenCalled();

    fireEvent.click(getByText('Save and continue'));
    expect(spy).toHaveBeenCalledWith({ action: 'continue', save: true });
  });

  it(`should emit 'summary' event on button click`, async () => {
    const { fixture, getByText } = await setup();

    const spy = spyOn(fixture.componentInstance.clicked, 'emit');
    expect(spy).not.toHaveBeenCalled();

    fireEvent.click(getByText('View record summary'));
    expect(spy).toHaveBeenCalledWith({ action: 'summary', save: false });
  });

  it(`should emit the 'exit' event on button click`, async () => {
    const { fixture, getByText } = await setup();

    const spy = spyOn(fixture.componentInstance.clicked, 'emit');
    expect(spy).not.toHaveBeenCalled();

    fireEvent.click(getByText('Exit'));
    expect(spy).toHaveBeenCalledWith({ action: 'exit', save: false });
  });
});
