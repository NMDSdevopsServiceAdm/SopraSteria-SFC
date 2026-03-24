import { fireEvent, render } from '@testing-library/angular';
import { NewPillWithLinkComponent } from './new-pill-with-link.component';

describe('NewPillWithLinkComponent', () => {
  async function setup(overrides: any = {}) {
    const setupTools = await render(NewPillWithLinkComponent, {
      imports: [],
      providers: [],
      componentProperties: {
        showNewPill: overrides?.showNewPill ?? false,
        linkText: overrides?.linkText ?? '',
      },
    });
    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
    };
  }

  it('should render a NewPillWithLinkComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('new pill', () => {
    it('should not show if showNewPill is false', async () => {
      const { queryByTestId } = await setup({ showNewPill: false });

      expect(queryByTestId('new-pill')).toBeFalsy();
    });

    it('should show if showNewPill is true', async () => {
      const { getByTestId } = await setup({ showNewPill: true });

      expect(getByTestId('new-pill')).toBeTruthy();
    });
  });

  it('should show the provided linkText', async () => {
    const textForLink = 'Update pay for multiple staff';
    const { getByText } = await setup({ showNewPill: true, linkText: textForLink });

    expect(getByText(textForLink)).toBeTruthy();
  });

  it('should emit an event when the link is clicked', async () => {
    const textForLink = 'Update pay for multiple staff';
    const { getByText, fixture } = await setup({ linkText: textForLink });

    const link = getByText(textForLink);
    const spy = spyOn(fixture.componentInstance.clicked, 'emit');
    fireEvent.click(link);
    expect(spy).toHaveBeenCalled();
  });
});
