import { render } from '@testing-library/angular';
import { spy } from 'sinon';

import { BenchmarksSelectViewPanelComponent } from './benchmarks-select-view-panel.component';

describe('BenchmarksSelectViewPanelComponent', () => {
  async function setup() {
    const { fixture, getByText, getByTestId } = await render(BenchmarksSelectViewPanelComponent, {
      imports: [],
      declarations: [],
      providers: [],
      componentProperties: {
        toggleBoolean: false,
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
      getByText,
      getByTestId,
      toggleViewSpy,
    };
  }

  it('should render the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the pay link active when viewBenchmarksByCategory is false', async () => {
    const { getByText, getByTestId } = await setup();

    const payListItem = getByTestId('payListItem');
    const payLink = getByText('Pay');
    const recruitmentListItem = getByTestId('recruitmentListItem');
    const recruitmentLink = getByText('Recruitment and retention');

    expect(payListItem.getAttribute('class')).toContain('asc-tabs__list-item--active');
    expect(payLink.getAttribute('class')).toContain('asc-tabs__link--active');
    expect(recruitmentListItem.getAttribute('class')).not.toContain('asc-tabs__list-item--active');
    expect(recruitmentLink.getAttribute('class')).not.toContain('asc-tabs__link--active');
  });
});
