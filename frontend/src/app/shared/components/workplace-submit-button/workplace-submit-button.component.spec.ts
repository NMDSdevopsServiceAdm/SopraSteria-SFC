import { fireEvent, render } from '@testing-library/angular';

import { WorkplaceSubmitButtonComponent } from './workplace-submit-button.component';

describe('WorkplaceSubmitButtonComponent', () => {
  const setup = async (overrides: any = {}) =>
    render(WorkplaceSubmitButtonComponent, {
      imports: [],
      componentProperties: {
        return: false,
        callToAction: 'Save and continue',
        recordSummary: true,
        canExit: false,
        exitText: 'Cancel',
        marginTop2: false,
        marginTop4: false,
        continue: false,
        ...overrides,
      },
    });

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the button without conditional margin class by default', async () => {
    const { getByTestId } = await setup();

    const container = getByTestId('button-container');
    expect(container.getAttribute('class')).not.toContain('govuk-!-margin-top-2');
    expect(container.getAttribute('class')).not.toContain('govuk-!-margin-top-4');
  });

  it('should render the button with a margin top of 2 if marginTop2 is set to true', async () => {
    const { rerender, getByTestId } = await setup();

    const container = getByTestId('button-container');
    rerender({ marginTop2: true });
    expect(container.getAttribute('class')).toContain('govuk-!-margin-top-2');
  });

  it('should render the button with a margin top of 4 if marginTop4 is set to true', async () => {
    const { rerender, getByTestId } = await setup();

    const container = getByTestId('button-container');
    rerender({ marginTop4: true });
    expect(container.getAttribute('class')).toContain('govuk-!-margin-top-4');
  });

  describe('return is false', () => {
    it(`should render the 'Save and continue' button and 'Skip this question' link`, async () => {
      const { getByText, queryByText } = await setup();

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

    describe('hasConditionalRouting', () => {
      it('should render "Save and continue" button when hasConditionalRouting is false', async () => {
        const overrides = { return: false, hasConditionalRouting: false };
        const { getByText } = await setup(overrides);

        expect(getByText('Save and continue')).toBeTruthy();
      });

      it('should render "Save and continue" button when hasConditionalRouting is true', async () => {
        const overrides = { return: false, hasConditionalRouting: true };
        const { getByText } = await setup(overrides);

        expect(getByText('Save and continue')).toBeTruthy();
      });
    });
  });

  describe('return is true', () => {
    describe('continue is true', () => {
      it(`should render the 'Continue' button and 'Cancel' link`, async () => {
        const overrides = { return: true, continue: true };
        const { getByText } = await setup(overrides);

        expect(getByText('Continue')).toBeTruthy();
        expect(getByText('Cancel')).toBeTruthy();
      });

      it('should render the correct cancel text with a fallback', async () => {
        const overrides = { return: true, continue: true };
        const { rerender, getByText } = await setup(overrides);

        expect(getByText('Cancel')).toBeTruthy();

        // update directive
        rerender({ exitText: 'Exit' });
        expect(getByText('Exit')).toBeTruthy();
      });
    });
    describe('continue is false', () => {
      it(`should render the 'Save and continue' button and 'Cancel' link`, async () => {
        const overrides = { return: true, continue: false };
        const { getByText } = await setup(overrides);

        expect(getByText('Save and return')).toBeTruthy();
        expect(getByText('Cancel')).toBeTruthy();
      });

      it('should render the correct cancel text with a fallback', async () => {
        const overrides = { return: true, continue: false };
        const { rerender, getByText } = await setup(overrides);

        expect(getByText('Cancel')).toBeTruthy();

        // update directive
        rerender({ exitText: 'Exit' });
        expect(getByText('Exit')).toBeTruthy();
      });
    });

    describe('hasConditionalRouting', () => {
      it('should render "Save and return" button when hasConditionalRouting is false', async () => {
        const overrides = { return: true, hasConditionalRouting: false };
        const { getByText } = await setup(overrides);

        expect(getByText('Save and return')).toBeTruthy();
        expect(getByText('Cancel')).toBeTruthy();
      });

      it('should render "Save" button when hasConditionalRouting is true', async () => {
        const overrides = { return: true, hasConditionalRouting: true };
        const { getByText } = await setup(overrides);

        expect(getByText('Save')).toBeTruthy();
        expect(getByText('Cancel')).toBeTruthy();
      });
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
