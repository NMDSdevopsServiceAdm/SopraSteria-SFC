import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { fireEvent, render } from '@testing-library/angular';

import { WorkplaceSubmitButtonComponent } from './workplace-submit-button.component';

describe('WorkplaceSubmitButtonComponent', () => {
  const setup = async (shouldReturn = false) =>
    render(WorkplaceSubmitButtonComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      componentProperties: {
        return: shouldReturn,
        callToAction: 'Save and continue',
        recordSummary: true,
        canExit: false,
        exitText: 'Cancel',
        isExistingStaffRecord: true,
      },
    });

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  describe('return is false', () => {
    it(`should render the 'Save and continue' button and 'Skip this question' link when in staff flow`, async () => {
      const { getByText, queryByText } = await setup();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
      expect(queryByText('Cancel')).toBeFalsy();
    });

    it(`should render the 'Save and continue' button and 'Skip this question' link when in workplace flow`, async () => {
      const { fixture, getByText, queryByText } = await setup();

      fixture.componentInstance.isExistingStaffRecord = false;
      fixture.detectChanges();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Skip this question')).toBeTruthy();
      expect(queryByText('Cancel')).toBeFalsy();
    });

    it(`should render the 'Save and continue' button and 'Cancel' link when recordSummary is false, canExit is true`, async () => {
      const { fixture, getByText, queryByText } = await setup();

      const component = fixture.componentInstance;
      component.recordSummary = false;
      component.canExit = true;
      fixture.detectChanges();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
      expect(queryByText('View this staff record')).toBeFalsy();
      expect(queryByText('Skip this question')).toBeFalsy();
    });

    it('should render the correct cta button and cancel text with a fallback', async () => {
      const { fixture, rerender, getByText } = await setup();

      const component = fixture.componentInstance;
      component.recordSummary = false;
      component.canExit = true;
      fixture.detectChanges();

      expect(getByText('Save and continue')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();

      // update directive
      rerender({ callToAction: 'Call to action', exitText: 'Exit' });
      expect(getByText('Call to action')).toBeTruthy();
      expect(getByText('Exit')).toBeTruthy();
    });
  });

  describe('return is true', () => {
    it(`should render the 'Save and continue' button and 'Cancel' link`, async () => {
      const { getByText } = await setup(true);

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should render the correct cancel text with a fallback', async () => {
      const { rerender, getByText } = await setup(true);

      expect(getByText('Cancel')).toBeTruthy();

      // update directive
      rerender({ exitText: 'Exit' });
      expect(getByText('Exit')).toBeTruthy();
    });
  });

  it(`should emit the 'continue' and save event on button click`, async () => {
    const { fixture, getByText } = await setup();

    const spy = spyOn(fixture.componentInstance.clicked, 'emit');
    expect(spy).not.toHaveBeenCalled();

    fireEvent.click(getByText('Save and continue'));
    expect(spy).toHaveBeenCalledWith({ action: 'continue', save: true });
  });

  it(`should emit 'skip' event on button click`, async () => {
    const { fixture, getByText } = await setup();

    const spy = spyOn(fixture.componentInstance.clicked, 'emit');
    expect(spy).not.toHaveBeenCalled();

    fireEvent.click(getByText('Skip this question'));
    expect(spy).toHaveBeenCalledWith({ action: 'skip', save: false });
  });

  it(`should emit the 'exit' event on button click`, async () => {
    const { fixture, getByText } = await setup();

    fixture.componentInstance.canExit = true;
    fixture.detectChanges();

    const spy = spyOn(fixture.componentInstance.clicked, 'emit');
    expect(spy).not.toHaveBeenCalled();

    fireEvent.click(getByText('Cancel'));
    expect(spy).toHaveBeenCalledWith({ action: 'exit', save: false });
  });
});
