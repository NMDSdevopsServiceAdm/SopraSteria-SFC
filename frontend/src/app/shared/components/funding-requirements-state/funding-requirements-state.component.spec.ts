import { render, within } from '@testing-library/angular';
import { SharedModule } from '@shared/shared.module';
import { WdfModule } from '../../../features/wdf/wdf-data-change/wdf.module';
import { FundingRequirementsStateComponent } from './funding-requirements-state.component';

describe('FundingRequirementsStateComponent', () => {
  const setup = async (overrides: any = {}) => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText, queryByTestId } = await render(
      FundingRequirementsStateComponent,
      {
        imports: [SharedModule, WdfModule],
        providers: [],
        componentProperties: {
          ...overrides,
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

  it('should render a FundingRequirementsStateComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show the green tick if eligible', async () => {
    const overrides = {
      currentWdfEligibility: true,
    };
    const { getByTestId } = await setup(overrides);

    const requirementsStateText = getByTestId('requirements-state');

    expect(getByTestId('green-tick')).toBeTruthy();
    expect(within(requirementsStateText).getByText('Meeting')).toBeTruthy();
  });

  describe('orange warning flag', () => {
    it('should show the correct message if singeStaffRecord is true', async () => {
      const overrides = {
        currentWdfEligibility: false,
        overallWdfEligibility: true,
        singeStaffRecord: true,
      };
      const { getByTestId } = await setup(overrides);
      const requirementsStateText = getByTestId('requirements-state');

      expect(getByTestId('orange-flag')).toBeTruthy();
      expect(within(requirementsStateText).getByText('New staff record')).toBeTruthy();
    });

    it('should show the correct message if singeStaffRecord false', async () => {
      const overrides = {
        currentWdfEligibility: false,
        overallWdfEligibility: true,
        singeStaffRecord: false,
      };
      const { getByTestId } = await setup(overrides);
      const requirementsStateText = getByTestId('requirements-state');

      expect(getByTestId('orange-flag')).toBeTruthy();
      expect(within(requirementsStateText).getByText('Not meeting')).toBeTruthy();
    });
  });

  it('should show the red cross', async () => {
    const overrides = {
      currentWdfEligibility: false,
      overallWdfEligibility: false,
    };
    const { getByTestId } = await setup(overrides);

    const requirementsStateText = getByTestId('requirements-state');

    expect(getByTestId('red-flag')).toBeTruthy();
    expect(within(requirementsStateText).getByText('Not meeting')).toBeTruthy();
  });
});
