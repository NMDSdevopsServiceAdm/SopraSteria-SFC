import { fireEvent, render, within } from '@testing-library/angular';
import { spy } from 'sinon';

import { SelectViewPanelComponent } from './select-view-panel.component';

describe('SelectViewPanelComponent', () => {
  async function setup(overrides: any = {}) {
    const setupTools = await render(SelectViewPanelComponent, {
      imports: [],
      declarations: [],
      providers: [],
      componentProperties: {
        handleTabChange: {
          emit: spy(),
        } as any,
        tabs: [
          { name: 'Tab0', fragment: 'tab0' },
          { name: 'Tab1', fragment: 'tab1' },
        ],
        ...overrides,
      },
    });

    const component = setupTools.fixture.componentInstance;
    const handleTabChangeSpy = spyOn(component.handleTabChange, 'emit').and.callThrough();

    return {
      component,
      handleTabChangeSpy,
      ...setupTools,
    };
  }

  it('should render the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Two tabs', () => {
    async function setupTwoTabs(overrides = {}) {
      const tabs = [
        { name: 'Tab0', fragment: 'tab0' },
        { name: 'Tab1', fragment: 'tab1' },
      ];

      const setupTools = await setup({ tabs, ...overrides });

      const firstTab = setupTools.getByTestId('tab0');
      const secondTab = setupTools.getByTestId('tab1');
      const firstTabLink = within(firstTab).getByText(tabs[0].name);
      const secondTabLink = within(secondTab).getByText(tabs[1].name);

      return { ...setupTools, firstTab, secondTab, firstTabLink, secondTabLink, tabs };
    }

    it('should set the first tab as active on load if no activeTabIndex passed in', async () => {
      const { firstTab, firstTabLink, secondTab, secondTabLink } = await setupTwoTabs();

      expect(firstTab.getAttribute('class')).toContain('asc-tabs__list-item--active');
      expect(firstTabLink.getAttribute('class')).toContain('asc-tabs__link--active');
      expect(secondTab.getAttribute('class')).not.toContain('asc-tabs__list-item--active');
      expect(secondTabLink.getAttribute('class')).not.toContain('asc-tabs__link--active');
    });

    it('should set the second tab as active on load if activeTabIndex passed in as 1', async () => {
      const { firstTab, firstTabLink, secondTab, secondTabLink } = await setupTwoTabs({ activeTabIndex: 1 });

      expect(secondTab.getAttribute('class')).toContain('asc-tabs__list-item--active');
      expect(secondTabLink.getAttribute('class')).toContain('asc-tabs__link--active');
      expect(firstTab.getAttribute('class')).not.toContain('asc-tabs__list-item--active');
      expect(firstTabLink.getAttribute('class')).not.toContain('asc-tabs__link--active');
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

  describe('More than two tabs', () => {
    async function setupThreeTabs(overrides = {}) {
      const tabs = [
        { name: 'Tab0', fragment: 'tab0' },
        { name: 'Tab1', fragment: 'tab1' },
        { name: 'Tab2', fragment: 'tab2' },
      ];

      const setupTools = await setup({ tabs, ...overrides });

      const thirdTab = setupTools.getByTestId('tab2');
      const thirdTabLink = within(thirdTab).getByText(tabs[2].name);

      return { ...setupTools, thirdTab, thirdTabLink, tabs };
    }

    it('should set the third tab as active on load if activeTabIndex passed in as 2', async () => {
      const { thirdTab, thirdTabLink } = await setupThreeTabs({ activeTabIndex: 2 });

      expect(thirdTab.getAttribute('class')).toContain('asc-tabs__list-item--active');
      expect(thirdTabLink.getAttribute('class')).toContain('asc-tabs__link--active');
    });

    it('should set the third tab as active after clicking third tab', async () => {
      const { fixture, thirdTab, thirdTabLink } = await setupThreeTabs({ activeTabIndex: 0 });

      fireEvent.click(thirdTabLink);
      fixture.detectChanges();

      expect(thirdTab.getAttribute('class')).toContain('asc-tabs__list-item--active');
      expect(thirdTabLink.getAttribute('class')).toContain('asc-tabs__link--active');
    });

    it('should emit handleTabChange with third index (2) when third tab is clicked', async () => {
      const { thirdTabLink, handleTabChangeSpy } = await setupThreeTabs({ activeTabIndex: 0 });

      fireEvent.click(thirdTabLink);

      expect(handleTabChangeSpy).toHaveBeenCalledWith(2);
    });
  });
});
