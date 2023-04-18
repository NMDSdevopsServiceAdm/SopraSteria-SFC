import { TabsService } from '@core/services/tabs.service';
import { MockTabsService } from '@core/test-utils/MockTabsService';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { Establishment } from '../../../../../mockdata/establishment';
import { SummarySectionComponent } from './summary-section.component';

describe('Summary section', () => {
  const setup = async (workplace = Establishment, workers = []) => {
    const { fixture, getByText, getByTestId } = await render(SummarySectionComponent, {
      imports: [SharedModule],
      providers: [
        {
          provide: TabsService,
          useClass: MockTabsService,
        },
      ],
      componentProperties: {
        workplace: workplace,
        workers: workers,
        navigateToTab: (event, selectedTab) => {
          event.preventDefault();
        },
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
      getByTestId,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('workplace summary section', () => {
    it('should show workplace link', async () => {
      const { getByText } = await setup();

      expect(getByText('Workplace')).toBeTruthy();
    });

    it('should show default summary message when no data needs to be adding or updating', async () => {
      const { getByTestId } = await setup();
      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).getByText('Remember to check and update this data often')).toBeTruthy();
    });

    it('should show the add workplace details message if the showAddWorkplaceDetailsBanner is true', async () => {
      const establishment = { ...Establishment, showAddWorkplaceDetailsBanner: true };
      const { getByText, getByTestId } = await setup(establishment);

      expect(getByText('Add more details to your workplace')).toBeTruthy();
      expect(getByTestId('orange-flag-0')).toBeTruthy();
    });
  });

  describe('staff record summary section', () => {
    it('should show staff record link', async () => {
      const { getByText } = await setup();

      expect(getByText('Staff records')).toBeTruthy();
    });

    it('should show start to add your staff message when there is no staff records', async () => {
      const { component, getByTestId } = await setup();

      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).getByText('You can start to add your staff records now')).toBeTruthy();
      expect(getByTestId('orange-flag-1')).toBeTruthy();
    });

    it('should show default summary message when no data needs to be adding or updating', async () => {
      const { getByTestId } = await setup(Establishment, [1]);

      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).getByText('Remember to check and update this data often')).toBeTruthy();
    });
  });

  describe('training and qualifications summary section', () => {
    it('should show training and qualifications link', async () => {
      const { getByText } = await setup();

      expect(getByText('Training and qualifications')).toBeTruthy();
    });

    it('should show default summary message when no data needs to be adding or updating', async () => {
      const { getByTestId } = await setup();
      const tAndQRow = getByTestId('training-and-qualifications-row');
      expect(within(tAndQRow).getByText('Remember to check and update this data often')).toBeTruthy();
    });
  });
});
