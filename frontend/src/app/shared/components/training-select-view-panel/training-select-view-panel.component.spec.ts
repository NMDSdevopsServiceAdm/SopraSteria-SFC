import { fireEvent, render } from '@testing-library/angular';
import { spy } from 'sinon';

import { TrainingSelectViewPanelComponent } from './training-select-view-panel.component';

describe('TrainingSelectViewPanelComponent', () => {
  async function setup() {
    const { fixture, getByText, getByTestId } = await render(TrainingSelectViewPanelComponent, {
      imports: [],
      declarations: [],
      providers: [],
      componentProperties: {
        viewTrainingByCategory: false,
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

  it('should show the staff link active when viewByTrainingCategory is false', async () => {
    const { getByText, getByTestId } = await setup();

    const staffListItem = getByTestId('staffListItem');
    const staffLink = getByText('Staff');
    const trainingListItem = getByTestId('trainingListItem');
    const trainingLink = getByText('Training');

    expect(staffListItem.getAttribute('class')).toContain('asc-tabs__list-item--active');
    expect(staffLink.getAttribute('class')).toContain('asc-tabs__link--active');
    expect(trainingListItem.getAttribute('class')).not.toContain('asc-tabs__list-item--active');
    expect(trainingLink.getAttribute('class')).not.toContain('asc-tabs__link--active');
  });

  it('should show the staff link active when viewByTrainingCategory is true', async () => {
    const { component, getByText, getByTestId } = await setup();

    component.viewTrainingByCategory = true;
    const staffListItem = getByTestId('staffListItem');
    const staffLink = getByText('Staff');
    const trainingListItem = getByTestId('trainingListItem');
    const trainingLink = getByText('Training');

    expect(trainingListItem.getAttribute('class')).toContain('asc-tabs__list-item--active');
    expect(trainingLink.getAttribute('class')).toContain('asc-tabs__link--active');
    expect(staffListItem.getAttribute('class')).not.toContain('asc-tabs__list-item--active');
    expect(staffLink.getAttribute('class')).not.toContain('asc-tabs__link--active');
  });

  it('should emit handleViewToggle with true when the training link is clicked', async () => {
    const { getByText, toggleViewSpy } = await setup();

    const trainingLink = getByText('Training');
    fireEvent.click(trainingLink);

    expect(toggleViewSpy).toHaveBeenCalledWith(true);
  });

  it('should emit handleViewToggle with true when the staff link is clicked', async () => {
    const { component, getByText, toggleViewSpy } = await setup();

    component.viewTrainingByCategory = true;
    const staffLink = getByText('Staff');
    fireEvent.click(staffLink);

    expect(toggleViewSpy).toHaveBeenCalledWith(false);
  });
});
