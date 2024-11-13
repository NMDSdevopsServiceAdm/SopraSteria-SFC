import { fireEvent, render, within } from '@testing-library/angular';
import { spy } from 'sinon';

import { SelectViewPanelComponent } from './select-view-panel.component';

describe('SelectViewPanelComponent', () => {
  async function setup(overrides: {tabs?: any[]} = {}) {
    const setupSuite = await render(SelectViewPanelComponent, {
      imports: [],
      declarations: [],
      providers: [],
      componentProperties: {
        handleTabChange: {
          emit: spy(),
        } as any,
        tabs: [{ name: 'Tab0', fragment: 'tab0' }, { name: 'Tab1', fragment: 'tab1' }],
        ...overrides,
      },
    });

    const component = setupSuite.fixture.componentInstance;
    const handleTabChangeSpy = spyOn(component.handleTabChange, 'emit').and.callThrough();

    return {
      component,
      handleTabChangeSpy,
      ...setupSuite,
    };
  }

  it('should render the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Two tabs', () => {
    async function setupTwoTabs() {
      const tabs = [{ name: 'Tab0', fragment: 'tab0' }, { name: 'Tab1', fragment: 'tab1' }];

      const setupSuite = await setup({ tabs });

      const firstTab = setupSuite.getByTestId('tab0');
      const secondTab = setupSuite.getByTestId('tab1');
      const firstTabLink = within(firstTab).getByText(tabs[0].name);
      const secondTabLink = within(secondTab).getByText(tabs[1].name);

      return { ...setupSuite, firstTab, secondTab, firstTabLink, secondTabLink, tabs }
    }

    it('should set the first tab as active on load', async () => {
      const { firstTab, firstTabLink, secondTab, secondTabLink } = await setupTwoTabs();

      expect(firstTab.getAttribute('class')).toContain('asc-tabs__list-item--active');
      expect(firstTabLink.getAttribute('class')).toContain('asc-tabs__link--active');
      expect(secondTab.getAttribute('class')).not.toContain('asc-tabs__list-item--active');
      expect(secondTabLink.getAttribute('class')).not.toContain('asc-tabs__link--active');
    });

    it('should set the second tab as active after clicking second tab', async () => {
      const { fixture, firstTab, firstTabLink, secondTab, secondTabLink } = await setupTwoTabs();

      fireEvent.click(secondTabLink);
      fixture.detectChanges();

      expect(secondTab.getAttribute('class')).toContain('asc-tabs__list-item--active');
      expect(secondTabLink.getAttribute('class')).toContain('asc-tabs__link--active');
      expect(firstTab.getAttribute('class')).not.toContain('asc-tabs__list-item--active');
      expect(firstTabLink.getAttribute('class')).not.toContain('asc-tabs__link--active');
    });

    it('should emit handleTabChange with second index (1) when second tab is clicked', async () => {
      const { handleTabChangeSpy, secondTabLink } = await setupTwoTabs();

      fireEvent.click(secondTabLink);

      expect(handleTabChangeSpy).toHaveBeenCalledWith(1);
    });

    it('should emit handleTabChange with first index (0) when the first tab link is clicked', async () => {
      const { component, fixture, handleTabChangeSpy, firstTabLink } = await setupTwoTabs();

      component.activeTabIndex = 1;
      fixture.detectChanges();

      fireEvent.click(firstTabLink);

      expect(handleTabChangeSpy).toHaveBeenCalledWith(0);
    });
  });
});
