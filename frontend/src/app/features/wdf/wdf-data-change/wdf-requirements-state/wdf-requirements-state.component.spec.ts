import { render } from '@testing-library/angular';
import { SharedModule } from '@shared/shared.module';
import { WdfModule } from '../wdf.module';
import { WdfRequirementsStateComponent } from './wdf-requirements-state.component';

fdescribe('WdfRequirementsStateComponent', () => {
  const setup = async (overrides: any = {}) => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText, queryByTestId } = await render(
      WdfRequirementsStateComponent,
      {
        imports: [SharedModule, WdfModule],
        providers: [],
        componentProperties: {
          currentWdfEligibility: overrides?.currentWdfEligibility ?? false,
          overallWdfEligibility: overrides?.overallWdfEligibility ?? false,
        },
        declarations: [],
      },
    );
    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByTestId,
      queryByText,
      queryByTestId,
    };
  };

  it('should render a WdfRequirementsStateComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show the green tick if eligible', async () => {
    const overrides = {
      currentWdfEligibility: true,
    };
    const { getByTestId } = await setup(overrides);

    expect(getByTestId('green-tick')).toBeTruthy();
  });

  it('should show the orange warning flag', async () => {
    const overrides = {
      currentWdfEligibility: false,
      overallWdfEligibility: true,
    };
    const { getByTestId } = await setup(overrides);

    expect(getByTestId('orange-flag')).toBeTruthy();
  });

  it('should show the red cross', async () => {
    const overrides = {
      currentWdfEligibility: false,
      overallWdfEligibility: false,
    };
    const { getByTestId } = await setup(overrides);

    expect(getByTestId('red-flag')).toBeTruthy();
  });
});
