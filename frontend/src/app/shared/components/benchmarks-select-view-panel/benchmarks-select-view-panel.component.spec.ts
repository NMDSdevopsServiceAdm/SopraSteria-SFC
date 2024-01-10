import { fireEvent, render } from '@testing-library/angular';
import { spy } from 'sinon';

import { BenchmarksSelectViewPanelComponent } from './benchmarks-select-view-panel.component';

describe('BenchmarksSelectViewPanelComponent', () => {
  async function setup() {
    const { fixture, getByTestId } = await render(BenchmarksSelectViewPanelComponent, {
      imports: [],
      declarations: [],
      providers: [],
      componentProperties: {
        handleViewToggle: {
          emit: spy(),
        } as any,
      },
    });

    const component = fixture.componentInstance;
    const toggleViewSpy = spyOn(component.handleViewToggle, 'emit').and.callThrough();

    return {
      component,
      fixture,
      getByTestId,
      toggleViewSpy,
    };
  }

  it('should render the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the false selection link as active when viewBenchmarksByCategory is false', async () => {
    const { getByTestId } = await setup();

    const falseItem = getByTestId('falseItem');
    const trueItem = getByTestId('trueItem');
    const falseLink = getByTestId('falseLink');
    const trueLink = getByTestId('trueLink');

    expect(falseItem.getAttribute('class')).toContain('asc-tabs__list-item--active');
    expect(falseLink.getAttribute('class')).toContain('asc-tabs__link--active');
    expect(trueItem.getAttribute('class')).not.toContain('asc-tabs__list-item--active');
    expect(trueLink.getAttribute('class')).not.toContain('asc-tabs__link--active');
  });

  it('should show the true selection link as active when viewBenchmarksByCategory is true', async () => {
    const { component, fixture, getByTestId } = await setup();

    component.toggleBoolean = true;
    fixture.detectChanges();

    const falseItem = getByTestId('falseItem');
    const trueItem = getByTestId('trueItem');
    const falseLink = getByTestId('falseLink');
    const trueLink = getByTestId('trueLink');

    expect(trueItem.getAttribute('class')).toContain('asc-tabs__list-item--active');
    expect(trueLink.getAttribute('class')).toContain('asc-tabs__link--active');
    expect(falseItem.getAttribute('class')).not.toContain('asc-tabs__list-item--active');
    expect(falseLink.getAttribute('class')).not.toContain('asc-tabs__link--active');
  });

  it('should emit handleViewToggle with true when the true link is clicked', async () => {
    const { getByTestId, toggleViewSpy } = await setup();

    const trueLink = getByTestId('trueLink');
    fireEvent.click(trueLink);

    expect(toggleViewSpy).toHaveBeenCalledWith(true);
  });

  it('should emit handleViewToggle with false when the false link is clicked', async () => {
    const { component, getByTestId, toggleViewSpy } = await setup();

    component.toggleBoolean = true;
    const falseLink = getByTestId('falseLink');
    fireEvent.click(falseLink);

    expect(toggleViewSpy).toHaveBeenCalledWith(false);
  });
});
