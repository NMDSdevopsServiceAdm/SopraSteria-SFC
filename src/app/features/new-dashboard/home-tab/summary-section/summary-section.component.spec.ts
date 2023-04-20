import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { TabsService } from '@core/services/tabs.service';
import { MockEstablishmentServiceCheckCQCDetails } from '@core/test-utils/MockEstablishmentService';
import { MockTabsService } from '@core/test-utils/MockTabsService';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { Establishment } from '../../../../../mockdata/establishment';
import { SummarySectionComponent } from './summary-section.component';
import dayjs from 'dayjs';

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
      },
    });

      const component = fixture.componentInstance;

    return {
      component,
      getByText,
      queryByText,
      getByTestId,
      queryByTestId,,
      };
    };

    it('should create', async () => {
      const { component } = await setup();
      expect(component).toBeTruthy();
    });

    it('should show the staff total does not match staff records warning when they do not match and it is after eight weeks since first login', async () => {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      const establishment = { ...Establishment, eightWeeksFromFirstLogin: date };
      const { getByText, getByTestId } = await setup(false, establishment, 102);

      expect(getByText('Staff total does not match staff records added')).toBeTruthy();
      expect(getByTestId('orange-flag')).toBeTruthy();
    });

    it('should not show the staff total does not match staff records warning when they do not match if is less than eight weeks since first login', async () => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      const establishment = { ...Establishment, eightWeeksFromFirstLogin: date };
      const { queryByText, queryByTestId } = await setup(false, establishment, 102);

      expect(queryByText('Staff total does not match staff records added')).toBeFalsy();
      expect(queryByTestId('orange-flag')).toBeFalsy();
    });
  });

  describe('staff record summary section', () => {
    it('should show staff record link', async () => {
      const { getByText } = await setup();

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
        const { getByText, getByTestId } = await setup(true, establishment);

        expect(getByText('You need to check your CQC details')).toBeTruthy();
        expect(getByTestId('orange-flag')).toBeTruthy();
      });
    
      it('should show the check cqc details message if checkCQCDetails banner is true and the showAddWorkplaceDetailsBanner is false', async () => {
        const { getByText, getByTestId } = await setup(true);

        expect(getByText('You need to check your CQC details')).toBeTruthy();
        expect(getByTestId('orange-flag')).toBeTruthy();
      });

      it('should show the total staff error if it is not available', async () => {
        const establishment = { ...Establishment, numberOfStaff: undefined };
        const { getByText, getByTestId } = await setup(false, establishment);

        expect(getByText(`You've not added your total number of staff`)).toBeTruthy();
        expect(getByTestId('red-flag')).toBeTruthy();
      });
    });

    describe('staff record summary section', () => {
      it('should show staff record link', async () => {
        const { getByText } = await setup();

        expect(getByText('Staff records')).toBeTruthy();
      });

      it('should show default summary message when no data needs to be adding or updating', async () => {
        const { getByTestId } = await setup(Establishment, [1]);

        const staffRecordsRow = getByTestId('staff-records-row');
        expect(within(staffRecordsRow).getByText('Remember to check and update this data often')).toBeTruthy();
      });

      it('should show start to add your staff message when there is no staff records', async () => {
        const { getByTestId } = await setup();

        const staffRecordsRow = getByTestId('staff-records-row');
        expect(within(staffRecordsRow).getByText('You can start to add your staff records now')).toBeTruthy();
        expect(getByTestId('orange-flag-1')).toBeTruthy();
      });

      it('should show staff record does not match  message when the number of staff is more than the staff record', async () => {
        const establishment = {
          ...Establishment,
          eightWeeksFromFirstLogin: dayjs(new Date()).subtract(1, 'day').toString(),
          numberOfStaff: 10,
        };
        const { fixture, component, getByTestId } = await setup(establishment, [15]);

        fixture.detectChanges();
        const staffRecordsRow = getByTestId('staff-records-row');
        expect(within(staffRecordsRow).getByText('Staff records added does not match staff total')).toBeTruthy();
        expect(getByTestId('orange-flag-1')).toBeTruthy();
      });

      it('should not show staff record does not match  message when the number of staff is equal to the staff record', async () => {
        const establishment = {
          ...Establishment,
          eightWeeksFromFirstLogin: new Date('1970-01-01').toString(),
          numberOfStaff: 10,
        };
        const { fixture, getByTestId } = await setup(establishment, [10]);
        fixture.detectChanges();
        const staffRecordsRow = getByTestId('staff-records-row');
        expect(within(staffRecordsRow).getByText('Staff records added does not match staff total')).toBeFalsy();
      });

      it('should not show staff record does not match  message when there is no staff record', async () => {
        const establishment = {
          ...Establishment,
          eightWeeksFromFirstLogin: new Date('1970-01-01').toString(),
          numberOfStaff: 10,
        };
        const { fixture, getByTestId } = await setup(establishment);
        fixture.detectChanges();
        const staffRecordsRow = getByTestId('staff-records-row');
        expect(within(staffRecordsRow).getByText('Staff records added does not match staff total')).toBeFalsy();
      });

      it('should not show staff record does not match  message when the eight week date is in the future ', async () => {
        const establishment = {
          ...Establishment,
          eightWeeksFromFirstLogin: new Date('2999-01-01').toString(),
          numberOfStaff: 10,
        };
        const { fixture, getByTestId } = await setup(establishment);
        fixture.detectChanges();
        const staffRecordsRow = getByTestId('staff-records-row');
        expect(within(staffRecordsRow).getByText('Staff records added does not match staff total')).toBeFalsy();
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
  };
});
