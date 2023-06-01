import { fireEvent, render } from '@testing-library/angular';
import { spy } from 'sinon';

import { BenchmarksSelectComparisonGroupsComponent } from './benchmarks-select-comparison-group.component';

describe('BenchmarksSelectComparisonGroupsComponent', () => {
  async function setup() {
    const { fixture, getByText, getByTestId } = await render(BenchmarksSelectComparisonGroupsComponent, {
      imports: [],
      declarations: [],
      providers: [],
      componentProperties: {
        mainServiceName: 'main service',
        localAuthorityLocation: 'Leeds',
        viewBenchmarksComparisonGroups: false,
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

  it('should show the main service input as checked when viewBenchmarksComparisonGroups is false', async () => {
    const { getByText, getByTestId } = await setup();

    const mainServiceInput = getByTestId('main-service-input');
    const goodAndOutstandingInput = getByTestId('good-and-outstanding-input');

    expect((mainServiceInput as HTMLInputElement).checked).toBeTruthy();
    expect((goodAndOutstandingInput as HTMLInputElement).checked).toBeFalsy();
  });

  it('should show the good and outstand input as checked when viewByTrainingCategory is true', async () => {
    const { component, getByText, getByTestId } = await setup();

    component.viewBenchmarksComparisonGroups = true;
    const mainServiceInput = getByTestId('main-service-input');
    const goodAndOutstandingInput = getByTestId('good-and-outstanding-input');

    expect((goodAndOutstandingInput as HTMLInputElement).checked).toBeTruthy();
    expect((mainServiceInput as HTMLInputElement).checked).toBeFalsy();
  });

  it('should emit handleViewToggle with true when the training link is clicked', async () => {
    const { getByTestId, toggleViewSpy } = await setup();

    const mainServiceInput = getByTestId('main-service-input');
    fireEvent.change(mainServiceInput);

    expect(toggleViewSpy).toHaveBeenCalledWith(true);
  });

  it('should emit handleViewToggle with false when the staff link is clicked', async () => {
    const { component, getByTestId, toggleViewSpy } = await setup();

    component.viewBenchmarksComparisonGroups = true;
    const goodAndOutstandingInput = getByTestId('good-and-outstanding-input');
    fireEvent.change(goodAndOutstandingInput);

    expect(toggleViewSpy).toHaveBeenCalledWith(false);
  });
});
