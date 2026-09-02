import { AccordionToggleButtonComponent } from './accordion-toggle-button.component';
import { render } from '@testing-library/angular';
import { SharedModule } from '@shared/shared.module';
import userEvent from '@testing-library/user-event';

describe('AccordionToggleButtonComponent', () => {
  const setup = async (overrides: any = {}) => {
    const expandedAtStart = overrides?.expandedAtStart ?? false;

    const setuptools = await render(AccordionToggleButtonComponent, {
      imports: [SharedModule],
      componentInputs: { expandedAtStart },
      providers: [],
    });

    const fixture = setuptools.fixture;
    const component = fixture.componentInstance;

    return {
      ...setuptools,
      component,
      fixture,
    };
  };

  it('should create the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a toggle button with "Add details" by default', async () => {
    const { getByRole } = await setup();

    expect(getByRole('button', { name: 'Add details' })).toBeTruthy();
  });

  it('should show the button text as "Hide details" when expanded', async () => {
    const { getByRole } = await setup({ expandedAtStart: true });

    expect(getByRole('button', { name: 'Hide details' })).toBeTruthy();
  });

  it('should toggle between two states on button click', async () => {
    const { getByTestId, getByRole } = await setup();

    const button = getByRole('button');

    expect(button.textContent.trim()).toEqual('Add details');
    expect(getByTestId('chevron')).toHaveClass('govuk-accordion-nav__chevron--down');

    userEvent.click(button);

    expect(button.textContent.trim()).toEqual('Hide details');
    expect(getByTestId('chevron')).toHaveClass('govuk-accordion-nav__chevron--up');

    userEvent.click(button);

    expect(button.textContent.trim()).toEqual('Add details');
    expect(getByTestId('chevron')).toHaveClass('govuk-accordion-nav__chevron--down');
  });

  it('should emit a toggle event when clicked', async () => {
    const { component, getByRole } = await setup();
    const outputEmit = spyOn(component.clickEmitter, 'emit');

    const button = getByRole('button');
    userEvent.click(button);
    expect(outputEmit).toHaveBeenCalledWith(true);

    userEvent.click(button);
    expect(outputEmit).toHaveBeenCalledWith(false);

    outputEmit.calls.reset();
    userEvent.click(button);
    expect(outputEmit).toHaveBeenCalledWith(true);
  });

  it('should show different button text when input signal buttonText has changed', async () => {
    const { fixture, getByRole } = await setup();

    const button = getByRole('button');
    expect(button.textContent.trim()).toEqual('Add details');

    fixture.componentRef.setInput('buttonText', {
      whenOpen: 'Hide details',
      whenClose: 'Change details',
    });

    fixture.detectChanges();
    expect(button.textContent.trim()).toEqual('Change details');

    userEvent.click(button);
    expect(button.textContent.trim()).toEqual('Hide details');

    userEvent.click(button);
    expect(button.textContent.trim()).toEqual('Change details');
  });
});
