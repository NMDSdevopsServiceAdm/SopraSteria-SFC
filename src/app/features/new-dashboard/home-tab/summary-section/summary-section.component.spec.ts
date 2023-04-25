import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { TabsService } from '@core/services/tabs.service';
import { MockEstablishmentServiceCheckCQCDetails } from '@core/test-utils/MockEstablishmentService';
import { MockTabsService } from '@core/test-utils/MockTabsService';
import { SharedModule } from '@shared/shared.module';
import { Worker } from '@core/model/worker.model';
import { render, within } from '@testing-library/angular';
import dayjs from 'dayjs';

import { Establishment } from '../../../../../mockdata/establishment';
import { SummarySectionComponent } from './summary-section.component';
import { workerWithCreatedDate } from '@core/test-utils/MockWorkerService';
const workers = [workerWithCreatedDate] as Worker[];
describe('Summary section', () => {
  const setup = async (
    checkCqcDetails = false,
    workplace = Establishment,
    workerCount = Establishment.numberOfStaff,
  ) => {
    const { fixture, getByText, queryByText, getByTestId, queryByTestId } = await render(SummarySectionComponent, {
      imports: [SharedModule, HttpClientTestingModule],
      providers: [
        {
          provide: TabsService,
          useClass: MockTabsService,
        },
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceCheckCQCDetails.factory(checkCqcDetails),
          deps: [HttpClient],
        },
      ],
      componentProperties: {
        workplace: workplace,

        navigateToTab: (event, selectedTab) => {
          event.preventDefault();
        },
        workerCount,
        workers: workers as Worker[],
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
      queryByText,
      getByTestId,
      queryByTestId,
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
      const { getByTestId } = await setup(true, establishment);

      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).getByText('Add more details to your workplace')).toBeTruthy();
      expect(within(workplaceRow).getByTestId('orange-flag')).toBeTruthy();
    });

    it('should show the check cqc details message if checkCQCDetails banner is true and the showAddWorkplaceDetailsBanner is false', async () => {
      const { getByTestId } = await setup(true);

      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).getByText('You need to check your CQC details')).toBeTruthy();
      expect(within(workplaceRow).getByTestId('orange-flag')).toBeTruthy();
    });

    it('should show the total staff error if it is not available', async () => {
      const establishment = { ...Establishment, numberOfStaff: undefined };
      const { getByTestId } = await setup(false, establishment);

      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).getByText(`You've not added your total number of staff`)).toBeTruthy();
      expect(within(workplaceRow).getByTestId('red-flag')).toBeTruthy();
    });

    it('should show the staff total does not match staff records warning when they do not match and it is after eight weeks since first login', async () => {
      const establishment = {
        ...Establishment,
        eightWeeksFromFirstLogin: dayjs(new Date()).subtract(1, 'day').toString(),
      };
      const { getByTestId } = await setup(false, establishment, 102);

      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).getByText('Staff total does not match staff records added')).toBeTruthy();
      expect(within(workplaceRow).getByTestId('orange-flag')).toBeTruthy();
    });

    it('should not show the staff total does not match staff records warning when they do not match if is less than eight weeks since first login', async () => {
      const establishment = { ...Establishment, eightWeeksFromFirstLogin: dayjs(new Date()).add(1, 'day').toString() };
      const { getByTestId } = await setup(false, establishment, 102);

      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).queryByText('Staff total does not match staff records added')).toBeFalsy();
      expect(within(workplaceRow).queryByTestId('orange-flag')).toBeFalsy();
    });

    it('should show a warning saying that vacancy and turnover data has not been added if they have not been added', async () => {
      const establishment = { ...Establishment, leavers: null, vacancies: null, starters: null };
      const { getByTestId } = await setup(false, establishment);

      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).getByText(`You've not added any vacancy and turnover data`)).toBeTruthy();
      expect(within(workplaceRow).getByTestId('orange-flag')).toBeTruthy();
    });
  });

  describe('staff record summary section', () => {
    it('should show staff record link', async () => {
      const { getByText } = await setup();

      expect(getByText('Staff records')).toBeTruthy();
    });

    it('should show default summary message when no data needs to be adding or updating', async () => {
      const { getByTestId } = await setup(false, Establishment, 100);

      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).getByText('Remember to check and update this data often')).toBeTruthy();
    });

    it('should show start to add your staff message when there is no staff records', async () => {
      const { getByTestId } = await setup(false, Establishment, 0);

      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).getByText('You can start to add your staff records now')).toBeTruthy();
      expect(getByTestId('orange-flag')).toBeTruthy();
    });

    it('should show staff record does not match message when the number of staff is more than the staff record', async () => {
      const establishment = {
        ...Establishment,
        eightWeeksFromFirstLogin: dayjs(new Date()).subtract(1, 'day').toString(),
      };
      const { getByTestId } = await setup(false, establishment, 102);

      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).getByText('Staff records added does not match staff total')).toBeTruthy();
      expect(within(staffRecordsRow).getByTestId('orange-flag')).toBeTruthy();
    });

    it('should not show staff record does not match message when the number of staff is equal to the staff record', async () => {
      const establishment = {
        ...Establishment,
        eightWeeksFromFirstLogin: dayjs(new Date()).subtract(1, 'day').toString(),
      };
      const { getByTestId } = await setup(false, establishment);

      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).queryByText('Staff records added does not match staff total')).toBeFalsy();
    });

    it('should not show staff record does not match message when there is no staff record', async () => {
      const establishment = {
        ...Establishment,
        eightWeeksFromFirstLogin: dayjs(new Date()).subtract(1, 'day').toString(),
      };
      const { getByTestId } = await setup(establishment);
      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).queryByText('Staff records added does not match staff total')).toBeFalsy();
    });

    it('should not show staff record does not match message when the eight week date is in the future ', async () => {
      const establishment = {
        ...Establishment,
        eightWeeksFromFirstLogin: dayjs(new Date()).add(1, 'day').toString(),
      };
      const { fixture, getByTestId } = await setup(establishment);
      fixture.detectChanges();
      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).queryByText('Staff records added does not match staff total')).toBeFalsy();
    });

    it('should  show "No staff records added in the last 12 months" message when stablishment has more than 10 staff and workplace created date and last worker added date is more than 12 month ', async () => {
      const establishment = {
        ...Establishment,
        created: dayjs('2021-03-31').add(12, 'M'),
      };

      const { fixture, component, getByTestId } = await setup(false, establishment);
      const workerCreatedDate = dayjs(component.workers[0].created).add(12, 'M');

      component.now >= establishment.created;
      component.now >= workerCreatedDate;

      fixture.detectChanges();
      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).queryByText('No staff records added in the last 12 months')).toBeTruthy();
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
