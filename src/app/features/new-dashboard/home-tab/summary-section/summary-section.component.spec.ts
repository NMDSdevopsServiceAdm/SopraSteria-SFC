import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { TabsService } from '@core/services/tabs.service';
import { MockEstablishmentServiceCheckCQCDetails } from '@core/test-utils/MockEstablishmentService';
import { MockTabsService } from '@core/test-utils/MockTabsService';
import { SharedModule } from '@shared/shared.module';

import { render, within } from '@testing-library/angular';
import dayjs from 'dayjs';

import { Establishment } from '../../../../../mockdata/establishment';
import { SummarySectionComponent } from './summary-section.component';

describe('Summary section', () => {
  const setup = async (
    checkCqcDetails = false,
    workplace = Establishment,
    workerCount = Establishment.numberOfStaff,
    trainingCounts = {} as TrainingCounts,
    WorkerCreatedDate = new Date('2021-03-31'),
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
        trainingCounts: trainingCounts,
        navigateToTab: (event, selectedTab) => {
          event.preventDefault();
        },
        workerCount,
        workerCreatedDate: WorkerCreatedDate,
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

    it('should not show the staff total does not match staff records warning when after eight weeks since first login is null', async () => {
      const establishment = { ...Establishment, eightWeeksFromFirstLogin: null };
      const { getByTestId } = await setup(false, establishment, 102);

      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).queryByText('Staff total does not match staff records added')).toBeFalsy();
      expect(within(workplaceRow).queryByTestId('orange-flag')).toBeFalsy();
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

    it('should show a warning saying that no vacancy data has been added if it has not been added, but starters data has been added', async () => {
      const establishment = { ...Establishment, leavers: null, vacancies: null, starters: 'None' };
      const { getByTestId } = await setup(false, establishment);

      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).getByText(`You've not added any staff vacancy data`)).toBeTruthy();
      expect(within(workplaceRow).getByTestId('orange-flag')).toBeTruthy();
    });

    it('should show a warning saying that no vacancy data has been added if it has not been added, but leavers data has been added', async () => {
      const establishment = { ...Establishment, leavers: 'None', vacancies: null, starters: null };
      const { getByTestId } = await setup(false, establishment);

      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).getByText(`You've not added any staff vacancy data`)).toBeTruthy();
      expect(within(workplaceRow).getByTestId('orange-flag')).toBeTruthy();
    });

    it('should show a warning saying that no vacancy data has been added if it has not been added, but both starters and leavers data has been added', async () => {
      const establishment = { ...Establishment, leavers: 'None', vacancies: null, starters: `Don't know` };
      const { getByTestId } = await setup(false, establishment);

      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).getByText(`You've not added any staff vacancy data`)).toBeTruthy();
      expect(within(workplaceRow).getByTestId('orange-flag')).toBeTruthy();
    });
  });

  describe('staff record summary section', () => {
    it('should show staff record link', async () => {
      const { getByText } = await setup();

      expect(getByText('Staff records')).toBeTruthy();
    });

    it('should show default summary message when no data needs to be adding or updating', async () => {
      const establishment = { ...Establishment, numberOfStaff: 10 };
      const { getByTestId } = await setup(false, establishment);

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

    it('should not show the Staff records added does not match staff total warning when after eight weeks since first login is null', async () => {
      const establishment = { ...Establishment, eightWeeksFromFirstLogin: null };
      const { getByTestId } = await setup(false, establishment, 102);

      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).queryByText('Staff records added does not match staff total')).toBeFalsy();
      expect(within(staffRecordsRow).queryByTestId('orange-flag')).toBeFalsy();
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
        numberOfStaff: 12,
      };

      const { fixture, component, getByTestId } = await setup(false, establishment, 12);

      fixture.detectChanges();
      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).queryByText('No staff records added in the last 12 months')).toBeTruthy();
    });

    it('should not  show "No staff records added in the last 12 months" message when stablishment has less thsn 10 staff and workplace created date and last worker added date is less than 12 months', async () => {
      const establishment = {
        ...Establishment,
        created: dayjs('2023-03-31').add(12, 'M'),
      };

      const { fixture, getByTestId, component } = await setup(false, establishment, 9);

      fixture.detectChanges();
      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).queryByText('No staff records added in the last 12 months')).toBeFalsy();
    });

    it('should not show "No staff records added in the last 12 months" message when stablishment has more than 10 staff  and and workplace created date is less than 12 month ', async () => {
      const establishment = {
        ...Establishment,
        created: dayjs('2021-03-31').add(12, 'M'),
      };

      const date = new Date();
      date.setDate(date.getMonth() - 1);
      const { fixture, component, getByTestId } = await setup(false, establishment, 12, {}, date);

      fixture.detectChanges();
      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).queryByText('No staff records added in the last 12 months')).toBeFalsy();
    });

    it('should not show "No staff records added in the last 12 months" message when stablishment has more than 10 staff  and last worker added date is less than 12 month ', async () => {
      const date = new Date();
      const establishment = {
        ...Establishment,
        created: date.setDate(date.getMonth() - 1),
      };

      date.setDate(date.getMonth() - 1);
      const { fixture, getByTestId } = await setup(false, establishment, 12, {});

      fixture.detectChanges();
      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).queryByText('No staff records added in the last 12 months')).toBeFalsy();
    });
  });

  describe('Training and Qualifications summary section', () => {
    it('should show training and qualifications link', async () => {
      const { getByText } = await setup();

      expect(getByText('Training and qualifications')).toBeTruthy();
    });

    it('should show default summary message when no data needs to be adding or updating', async () => {
      const { getByTestId } = await setup();
      const tAndQRow = getByTestId('training-and-qualifications-row');
      expect(within(tAndQRow).getByText('Remember to check and update this data often')).toBeTruthy();
    });

    describe('Missing mandatory training message', () => {
      it('should show when mandatory training is missing for multiple users', async () => {
        const trainingCounts = { missingMandatoryTraining: 2 };
        const { getByTestId } = await setup(false, Establishment, 2, trainingCounts);
        const tAndQRow = getByTestId('training-and-qualifications-row');
        expect(within(tAndQRow).queryByTestId('orange-flag')).toBeFalsy();
        expect(within(tAndQRow).getByTestId('red-flag')).toBeTruthy();
        expect(within(tAndQRow).getByText('2 staff are missing mandatory training')).toBeTruthy();
      });

      it('should show when mandatory training is missing for a single user', async () => {
        const trainingCounts = { missingMandatoryTraining: 1 };
        const { getByTestId } = await setup(false, Establishment, 2, trainingCounts);
        const tAndQRow = getByTestId('training-and-qualifications-row');
        expect(within(tAndQRow).queryByTestId('orange-flag')).toBeFalsy();
        expect(within(tAndQRow).getByTestId('red-flag')).toBeTruthy();
        expect(within(tAndQRow).getByText('1 staff is missing mandatory training')).toBeTruthy();
      });

      it('should not show when mandatory training is not missing', async () => {
        const trainingCounts = { missingMandatoryTraining: 0 };
        const { getByTestId } = await setup(false, Establishment, 2, trainingCounts);
        const tAndQRow = getByTestId('training-and-qualifications-row');
        expect(within(tAndQRow).queryByTestId('orange-flag')).toBeFalsy();
        expect(within(tAndQRow).queryByTestId('red-flag')).toBeFalsy();
        expect(within(tAndQRow).queryByText('0 staff are missing mandatory training')).toBeFalsy();
        expect(within(tAndQRow).queryByText('0 staff is missing mandatory training')).toBeFalsy();
      });
    });

    describe('Expired training message', () => {
      it('should show when training is expired for multiple users', async () => {
        const trainingCounts = { totalExpiredTraining: 2 };
        const { getByTestId } = await setup(false, Establishment, 2, trainingCounts);
        const tAndQRow = getByTestId('training-and-qualifications-row');
        expect(within(tAndQRow).queryByTestId('orange-flag')).toBeFalsy();
        expect(within(tAndQRow).getByTestId('red-flag')).toBeTruthy();
        expect(within(tAndQRow).getByText('2 training records have expired')).toBeTruthy();
      });

      it('should show when training is expired for a single user', async () => {
        const trainingCounts = { totalExpiredTraining: 1 };
        const { getByTestId } = await setup(false, Establishment, 2, trainingCounts);
        const tAndQRow = getByTestId('training-and-qualifications-row');
        expect(within(tAndQRow).queryByTestId('orange-flag')).toBeFalsy();
        expect(within(tAndQRow).getByTestId('red-flag')).toBeTruthy();
        expect(within(tAndQRow).getByText('1 training record has expired')).toBeTruthy();
      });

      it('should not show when training is not expired', async () => {
        const trainingCounts = { totalExpiredTraining: 0 };
        const { getByTestId } = await setup(false, Establishment, 2, trainingCounts);
        const tAndQRow = getByTestId('training-and-qualifications-row');
        expect(within(tAndQRow).queryByTestId('orange-flag')).toBeFalsy();
        expect(within(tAndQRow).queryByTestId('red-flag')).toBeFalsy();
        expect(within(tAndQRow).queryByText('0 training record has expired')).toBeFalsy();
        expect(within(tAndQRow).queryByText('0 training records have expired')).toBeFalsy();
      });
    });

   describe('Training expires soon message', async () => {
      it('should show when training is expiring for multiple users', async () => {
        const trainingCounts = { totalExpiringTraining: 2 };
        const { getByTestId } = await setup(false, Establishment, 2, trainingCounts);
        const tAndQRow = getByTestId('training-and-qualifications-row');
        expect(within(tAndQRow).getByTestId('orange-flag')).toBeTruthy();
        expect(within(tAndQRow).queryByTestId('red-flag')).toBeFalsy();
        expect(within(tAndQRow).getByText('2 training records expire soon')).toBeTruthy();
      });

      it('should show when training is expiring for a single user', async () => {
        const trainingCounts = { totalExpiringTraining: 1 };
        const { getByTestId } = await setup(false, Establishment, 2, trainingCounts);
        const tAndQRow = getByTestId('training-and-qualifications-row');
        expect(within(tAndQRow).getByTestId('orange-flag')).toBeTruthy();
        expect(within(tAndQRow).queryByTestId('red-flag')).toBeFalsy();
        expect(within(tAndQRow).getByText('1 training record expires soon')).toBeTruthy();
      });

      it('should not show when training is not expiring', async () => {
        const trainingCounts = { totalExpiringTraining: 0 };
        const { getByTestId } = await setup(false, Establishment, 2, trainingCounts);
        const tAndQRow = getByTestId('training-and-qualifications-row');
        expect(within(tAndQRow).queryByTestId('orange-flag')).toBeFalsy();
        expect(within(tAndQRow).queryByTestId('red-flag')).toBeFalsy();
        expect(within(tAndQRow).queryByText('0 training record expires soon')).toBeFalsy();
        expect(within(tAndQRow).queryByText('0 training records expire soon')).toBeFalsy();
      });
    });

   describe('Manage staff training message', async () => {
      it('should show when no records exist', async () => {
        const trainingCounts = { totalRecords: 0, totalTraining: 0 };
        const { getByTestId } = await setup(false, Establishment, 2, trainingCounts);
        const tAndQRow = getByTestId('training-and-qualifications-row');
        expect(within(tAndQRow).getByTestId('orange-flag')).toBeTruthy();
        expect(within(tAndQRow).queryByTestId('red-flag')).toBeFalsy();
        expect(within(tAndQRow).getByText('Manage your staff training and qualifications')).toBeTruthy();
      });

      it('should not show when records exist', async () => {
        const trainingCounts = { totalRecords: 1, totalTraining: 0 };
        const { getByTestId } = await setup(false, Establishment, 2, trainingCounts);
        const tAndQRow = getByTestId('training-and-qualifications-row');
        expect(within(tAndQRow).queryByTestId('orange-flag')).toBeFalsy();
        expect(within(tAndQRow).queryByTestId('red-flag')).toBeFalsy();
        expect(within(tAndQRow).queryByText('Manage your staff training and qualifications')).toBeFalsy();
      });
    });
  });
});
