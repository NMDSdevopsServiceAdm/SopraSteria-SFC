import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { fireEvent, render } from '@testing-library/angular';

import { SubmitButtonComponent } from './submit-button.component';

describe('SubmitButtonComponent', () => {
  const setup = async (shouldReturn = false) =>
    render(SubmitButtonComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      componentProperties: {
        return: shouldReturn,
        callToAction: 'Save and continue',
        recordSummary: true,
        canExit: false,
        exitText: 'Exit',
        isExistingStaffRecord: true,
      },
    });

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  describe('return is false', () => {
    it(`should render the 'Save and continue' button and 'View this staff record' link when in staff flow`, async () => {
      const { getByText, queryByText } = await setup();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View this staff record')).toBeTruthy();
      expect(queryByText('Exit')).toBeFalsy();
    });

    it(`should render the 'Save and continue' button and 'View record summary' link when in workplace flow`, async () => {
      const { fixture, getByText, queryByText } = await setup();

      fixture.componentInstance.isExistingStaffRecord = false;
      fixture.detectChanges();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('View record summary')).toBeTruthy();
      expect(queryByText('Exit')).toBeFalsy();
    });

    it(`should render the 'Save and continue' button and 'Exit' link when recordSummary is false, canExit is true`, async () => {
      const { fixture, getByText, queryByText } = await setup();

      const component = fixture.componentInstance;
      component.recordSummary = false;
      component.canExit = true;
      component.isExistingStaffRecord = false;
      fixture.detectChanges();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Exit')).toBeTruthy();
      expect(queryByText('View this staff record')).toBeFalsy();
      expect(queryByText('View record summary')).toBeFalsy();
    });

    it('should render the correct cta button and exit text with a fallback', async () => {
      const { fixture, rerender, getByText } = await setup();

      const component = fixture.componentInstance;
      component.recordSummary = false;
      component.canExit = true;
      component.isExistingStaffRecord = false;
      fixture.detectChanges();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Exit')).toBeTruthy();

      // update directive
      rerender({ callToAction: 'Call to action', exitText: 'Cancel' });
      expect(getByText('Call to action')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  describe('return is true', () => {
    it(`should render the 'Save and continue' button and 'Exit' link`, async () => {
      const { getByText } = await setup(true);

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Exit')).toBeTruthy();
    });

    it('should render the correct exit text with a fallback', async () => {
      const { rerender, getByText } = await setup(true);

      expect(getByText('Exit')).toBeTruthy();

      // update directive
      rerender({ exitText: 'Cancel' });
      expect(getByText('Cancel')).toBeTruthy();
    });
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

    fireEvent.click(getByText('View this staff record'));
    expect(spy).toHaveBeenCalledWith({ action: 'summary', save: false });
  });

  it(`should emit the 'exit' event on button click`, async () => {
    const { fixture, getByText } = await setup();

    fixture.componentInstance.canExit = true;
    fixture.componentInstance.isExistingStaffRecord = false;
    fixture.detectChanges();

    const spy = spyOn(fixture.componentInstance.clicked, 'emit');
    expect(spy).not.toHaveBeenCalled();

    fireEvent.click(getByText('Exit'));
    expect(spy).toHaveBeenCalledWith({ action: 'exit', save: false });
  });
});
