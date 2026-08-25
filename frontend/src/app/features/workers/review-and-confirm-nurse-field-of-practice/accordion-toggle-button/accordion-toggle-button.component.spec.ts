import { AccordionToggleButtonComponent } from './accordion-toggle-button.component';
import { render } from '@testing-library/angular';
import { SharedModule } from '@shared/shared.module';
import userEvent from '@testing-library/user-event';

fdescribe('AccordionToggleButtonComponent', () => {
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
    const { getByText } = await setup();

    expect(getByText('Add details')).toBeTruthy();
  });

  it('should show "Hide details" when expanded', async () => {
    const { getByText } = await setup({ expandedAtStart: true });

    expect(getByText('Hide details')).toBeTruthy();
  });

  it('should toggle between "Add details" / "Hide details" on button click', async () => {
    const { getByText, getByRole } = await setup();

    expect(getByText('Add details')).toBeTruthy();

    userEvent.click(getByRole('button'));
    expect(getByText('Hide details')).toBeTruthy();
    userEvent.click(getByRole('button'));
    expect(getByText('Add details')).toBeTruthy();
  });

  it('should emit toggle event when clicked', async () => {
    const { component, getByRole } = await setup();
    const outputEmit = spyOn(component.toggleState, 'emit');

    userEvent.click(getByRole('button', { name: 'Add details' }));
    expect(outputEmit).toHaveBeenCalledWith(true);

    userEvent.click(getByRole('button', { name: 'Hide details' }));
    expect(outputEmit).toHaveBeenCalledWith(false);

    userEvent.click(getByRole('button', { name: 'Add details' }));
    expect(outputEmit).toHaveBeenCalledWith(true);
  });

  it('should show different button text when input signal buttonText has changed', async () => {
    const { fixture, getByText, getByRole } = await setup();

    expect(getByText('Add details')).toBeTruthy();

    fixture.componentRef.setInput('buttonText', {
      whenOpen: 'Hide details',
      whenClose: 'Change details',
    });

    fixture.detectChanges();
    expect(getByText('Change details')).toBeTruthy();

    userEvent.click(getByRole('button'));
    expect(getByText('Hide details')).toBeTruthy();

    userEvent.click(getByRole('button'));
    expect(getByText('Change details')).toBeTruthy();
  });
});
