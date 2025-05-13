import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { TabsService } from '@core/services/tabs.service';
import { MockEstablishmentServiceCheckCQCDetails } from '@core/test-utils/MockEstablishmentService';
import { MockTabsService } from '@core/test-utils/MockTabsService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';
import dayjs from 'dayjs';

import { Establishment } from '../../../../mockdata/establishment';
import { SummarySectionComponent } from './summary-section.component';

describe('Summary section', () => {
  const setup = async (
    checkCqcDetails = false,
    workplace = Establishment,
    workerCount = Establishment.numberOfStaff,
    trainingCounts = {} as TrainingCounts,
    workerCreatedDate = [dayjs()],
    workersNotCompleted = [workerBuilder()] as Worker[],
    canViewListOfWorkers = true,
    canViewEstablishment = true,
    isParentSubsidiaryView = false,
    noOfWorkersWhoRequireInternationalRecruitment = 0,
  ) => {
    const { fixture, getByText, queryByText, getByTestId, queryByTestId } = await render(SummarySectionComponent, {
      imports: [SharedModule, HttpClientTestingModule, RouterModule, RouterTestingModule],
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
        navigateToTab: (event, _selectedTab) => {
          event.preventDefault();
        },
        workerCount,
        workersCreatedDate: workerCreatedDate,
        workersNotCompleted: workersNotCompleted as Worker[],
        isParent: false,
        canViewListOfWorkers: canViewListOfWorkers,
        canViewEstablishment: canViewEstablishment,
        showMissingCqcMessage: false,
        workplacesCount: 0,
        isParentSubsidiaryView,
        noOfWorkersWhoRequireInternationalRecruitment,
      },
    });

    const component = fixture.componentInstance;
    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      getByText,
      queryByText,
      getByTestId,
      queryByTestId,
      routerSpy,
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

    it('should not show clickable workplace link if no access to data', async () => {
      const establishment = {
        ...Establishment,
        created: dayjs().subtract(1, 'year'),
        numberOfStaff: 12,
      };

      const date = [dayjs().subtract(1, 'year')];

      const { fixture, getByText } = await setup(false, establishment, 0, {}, date, [], false, false);

      fixture.detectChanges();

      const workplaceText = getByText('Workplace');

      expect(workplaceText.getAttribute('href')).toBeFalsy();
    });

    it('should show clickable workplace link if access to workplace', async () => {
      const establishment = {
        ...Establishment,
        created: dayjs().subtract(1, 'year'),
        numberOfStaff: 12,
      };

      const date = [dayjs().subtract(1, 'year')];

      const { component, fixture, getByText } = await setup(false, establishment, 0, {}, date, [], false, true);
      component.ngOnInit();
      fixture.detectChanges();
      const workplaceText = getByText('Workplace');

      expect(workplaceText.getAttribute('href')).toBeTruthy();
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

    it('should navigate to sub workplace page when clicking the add workplace details message in sub view', async () => {
      const establishment = { ...Establishment, showAddWorkplaceDetailsBanner: true };
      const { getByText, routerSpy } = await setup(true, establishment, 0, {}, [], [], true, true, true);

      const workplaceDetailsMessage = getByText('Add more details to your workplace');
      fireEvent.click(workplaceDetailsMessage);

      expect(routerSpy).toHaveBeenCalledWith(['subsidiary', Establishment.uid, 'workplace']);
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

    it('should not show the total staff error if numberOfStaff is 0', async () => {
      const establishment = { ...Establishment, numberOfStaff: 0 };
      const { getByTestId } = await setup(false, establishment);

      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).queryByText(`You've not added your total number of staff`)).toBeFalsy();
      expect(within(workplaceRow).queryByTestId('red-flag')).toBeFalsy();
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

    it('should not show clickable staff records link if no access to data', async () => {
      const establishment = {
        ...Establishment,
        created: dayjs().subtract(1, 'year'),
        numberOfStaff: 12,
      };

      const date = [dayjs().subtract(1, 'year')];

      const { fixture, getByText } = await setup(false, establishment, 0, {}, date, [], false, true);

      fixture.detectChanges();

      const staffRecordsLinkText = getByText('Staff records');

      expect(staffRecordsLinkText.getAttribute('href')).toBeFalsy();
    });

    it('should show clickable staff records link if access to workplace', async () => {
      const { component, fixture, getByText } = await setup();
      component.canViewListOfWorkers = true;

      fixture.detectChanges();

      const staffRecordsLinkText = getByText('Staff records');

      expect(staffRecordsLinkText.getAttribute('href')).toBeTruthy();
    });

    it('should show default summary message when no data needs to be adding or updating', async () => {
      const { getByTestId } = await setup();

      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).getByText('Remember to check and update this data often')).toBeTruthy();
    });

    it('should show start to add your staff message when there is no staff records', async () => {
      const { getByTestId } = await setup(false, Establishment, 0);

      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).getByText('You can start to add your staff records now')).toBeTruthy();
      expect(getByTestId('orange-flag')).toBeTruthy();
    });

    it('should navigate to sub staff records page when clicking on start to add your staff message in sub view', async () => {
      const { getByText, routerSpy } = await setup(false, Establishment, 0, {}, [], [], true, true, true);

      const staffRecordMessage = getByText('You can start to add your staff records now');
      fireEvent.click(staffRecordMessage);

      expect(routerSpy).toHaveBeenCalledWith(['subsidiary', Establishment.uid, 'staff-records']);
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

    it('should not show the Staff records added does not match staff total warning when after eight weeks since first login is null', async () => {
      const establishment = { ...Establishment, eightWeeksFromFirstLogin: null };
      const { getByTestId } = await setup(false, establishment, 102);

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
        created: dayjs().subtract(1, 'year'),
        numberOfStaff: 12,
      };

      const date = [dayjs().subtract(1, 'year')];

      const { fixture, getByTestId } = await setup(false, establishment, 12, {}, date);

      fixture.detectChanges();
      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).queryByText('No staff records added in the last 12 months')).toBeTruthy();
    });

    it('should not  show "No staff records added in the last 12 months" message when stablishment has less thsn 10 staff and workplace created date and last worker added date is less than 12 months', async () => {
      const establishment = {
        ...Establishment,
        created: dayjs().subtract(11, 'month'),
      };

      const { fixture, getByTestId } = await setup(false, establishment, 9);

      fixture.detectChanges();
      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).queryByText('No staff records added in the last 12 months')).toBeFalsy();
    });

    [
      { noOfWorkers: 1, message: 'Is this worker on a Health and Care Worker visa?' },
      { noOfWorkers: 2, message: 'Are these workers on Health and Care Worker visas?' },
    ].forEach((scenario) => {
      it(`should show "${scenario.message}" message when noOfWorkersWhoRequireInternationalRecruitment is ${scenario.noOfWorkers}`, async () => {
        const { getByTestId } = await setup(
          false,
          Establishment,
          Establishment.numberOfStaff,
          {},
          [dayjs()],
          [workerBuilder()] as Worker[],
          true,
          true,
          false,
          scenario.noOfWorkers,
        );

        const staffRecordsRow = getByTestId('staff-records-row');
        expect(within(staffRecordsRow).queryByText(scenario.message)).toBeTruthy();
      });

      it(`should navigate to health and care visa page when "${scenario.message}" link clicked`, async () => {
        const { getByText, routerSpy } = await setup(
          false,
          Establishment,
          Establishment.numberOfStaff,
          {},
          [dayjs()],
          [workerBuilder()] as Worker[],
          true,
          true,
          false,
          scenario.noOfWorkers,
        );

        const healthAndCareVisaPageLink = getByText(scenario.message);
        fireEvent.click(healthAndCareVisaPageLink);

        expect(routerSpy).toHaveBeenCalledWith([
          '/workplace',
          Establishment.uid,
          'health-and-care-visa-existing-workers',
        ]);
      });
    });

    it('should not show "No staff records added in the last 12 months" message when stablishment has more than 10 staff  and and workplace created date is less than 12 month ', async () => {
      const establishment = {
        ...Establishment,
        created: dayjs().subtract(11, 'month'),
      };

      const date = [dayjs().subtract(11, 'month')];
      const { fixture, getByTestId } = await setup(false, establishment, 12, {}, date);

      fixture.detectChanges();
      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).queryByText('No staff records added in the last 12 months')).toBeFalsy();
    });

    it('should not show "No staff records added in the last 12 months" message when stablishment has more than 10 staff  and last worker added date is less than 12 month ', async () => {
      const establishment = {
        ...Establishment,
        created: dayjs().subtract(11, 'month'),
      };

      const { fixture, getByTestId } = await setup(false, establishment, 12, {});

      fixture.detectChanges();
      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).queryByText('No staff records added in the last 12 months')).toBeFalsy();
    });

    describe('"Some records only have mandatory data added" link', () => {
      const workerCreatedDate = (timeframe) => {
        return [
          {
            ...workerBuilder(),
            completed: false,
            created: dayjs().subtract(2, timeframe).toISOString(),
          },
        ] as Worker[];
      };

      it('should show "Some records only have mandatory data added" message when staff records are not completed and worker added date is more than 1 month ago', async () => {
        const { getByTestId } = await setup(false, Establishment, 12, {}, [dayjs()], workerCreatedDate('month'));

        const staffRecordsRow = getByTestId('staff-records-row');
        expect(within(staffRecordsRow).queryByText('Some records only have mandatory data added')).toBeTruthy();
      });

      it('should navigate to basic-staff-records when "Some records only have mandatory data added" clicked', async () => {
        const { getByText, routerSpy } = await setup(
          false,
          Establishment,
          12,
          {},
          [dayjs()],
          workerCreatedDate('month'),
        );

        const basicStaffRecordsLink = getByText('Some records only have mandatory data added');
        fireEvent.click(basicStaffRecordsLink);
        expect(routerSpy).toHaveBeenCalledWith(['/staff-basic-records']);
      });

      it('should navigate to basic-staff-records with uid when "Some records only have mandatory data added" clicked in sub view', async () => {
        const { getByText, routerSpy } = await setup(
          false,
          Establishment,
          12,
          {},
          [dayjs()],
          workerCreatedDate('month'),
          true,
          true,
          true,
        );

        const basicStaffRecordsLink = getByText('Some records only have mandatory data added');
        fireEvent.click(basicStaffRecordsLink);
        expect(routerSpy).toHaveBeenCalledWith(['/staff-basic-records', Establishment.uid]);
      });

      it('should not show "Some records only have mandatory data added" message when staff records are not completed and worker added date is less than 1 month ago', async () => {
        const { getByTestId } = await setup(false, Establishment, 12, {}, [dayjs()], workerCreatedDate('week'));

        const staffRecordsRow = getByTestId('staff-records-row');
        expect(within(staffRecordsRow).queryByText('Some records only have mandatory data added')).toBeFalsy();
      });

      it('should not show "Some records only have mandatory data added" message when staff records are completed and worker added date is less than 1 month ago', async () => {
        const { getByTestId } = await setup(false, Establishment, 12, {}, [dayjs()], workerCreatedDate('week'));

        const staffRecordsRow = getByTestId('staff-records-row');
        expect(within(staffRecordsRow).queryByText('Some records only have mandatory data added')).toBeFalsy();
      });
    });
  });

  describe('Training and Qualifications summary section', () => {
    it('should show training and qualifications link', async () => {
      const { getByText } = await setup();

      expect(getByText('Training and qualifications')).toBeTruthy();
    });

    it('should not show clickable training and qualifications link if no access to data', async () => {
      const establishment = {
        ...Establishment,
        created: dayjs().subtract(1, 'year'),
        numberOfStaff: 12,
      };

      const date = [dayjs().subtract(1, 'year')];

      const { fixture, getByText } = await setup(false, establishment, 0, {}, date, [], false, true);

      fixture.detectChanges();

      const trainingAndQualificationsLinkText = getByText('Training and qualifications');

      expect(trainingAndQualificationsLinkText.getAttribute('href')).toBeFalsy();
    });

    it('should show clickable training and qualifications link if access to workplace', async () => {
      const { component, fixture, getByText } = await setup();
      component.canViewListOfWorkers = true;

      fixture.detectChanges();

      const trainingAndQualificationsLinkText = getByText('Training and qualifications');

      expect(trainingAndQualificationsLinkText.getAttribute('href')).toBeTruthy();
    });

    it('should show default summary message when no data needs to be adding or updating', async () => {
      const { getByTestId } = await setup();
      const tAndQRow = getByTestId('training-and-qualifications-row');
      expect(within(tAndQRow).getByText('Remember to check and update this data often')).toBeTruthy();
    });

    describe('Missing mandatory training message', () => {
      it('should show when mandatory training is missing for multiple users', async () => {
        const trainingCounts = { staffMissingMandatoryTraining: 2 };
        const { getByTestId } = await setup(false, Establishment, 2, trainingCounts);
        const tAndQRow = getByTestId('training-and-qualifications-row');
        expect(within(tAndQRow).queryByTestId('orange-flag')).toBeFalsy();
        expect(within(tAndQRow).getByTestId('red-flag')).toBeTruthy();
        expect(within(tAndQRow).getByText('2 staff are missing mandatory training')).toBeTruthy();
      });

      it('should show when mandatory training is missing for a single user', async () => {
        const trainingCounts = { staffMissingMandatoryTraining: 1 };
        const { getByTestId } = await setup(false, Establishment, 2, trainingCounts);
        const tAndQRow = getByTestId('training-and-qualifications-row');
        expect(within(tAndQRow).queryByTestId('orange-flag')).toBeFalsy();
        expect(within(tAndQRow).getByTestId('red-flag')).toBeTruthy();
        expect(within(tAndQRow).getByText('1 staff is missing mandatory training')).toBeTruthy();
      });

      it('should not show when mandatory training is not missing', async () => {
        const trainingCounts = { staffMissingMandatoryTraining: 0 };
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

  describe('your other workplaces summary section', () => {
    it('should show the row', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.isParent = true;
      fixture.detectChanges();

      const workplacesRow = getByTestId('workplaces-row');
      expect(workplacesRow).toBeTruthy();
    });

    it('should show you other workplaces link', async () => {
      const { component, getByText } = await setup();

      component.isParent = true;
      const yourOtherWorkplacesText = getByText('Your other workplaces');

      expect(yourOtherWorkplacesText).toBeTruthy();
      expect(yourOtherWorkplacesText.getAttribute('href')).toBeTruthy();
    });

    it('should show message if there are no workplaces added', async () => {
      const { component, getByText, queryByTestId } = await setup();

      component.isParent = true;

      const yourOtherWorkplacesSummaryText = getByText("You've not added any other workplaces yet");

      expect(yourOtherWorkplacesSummaryText).toBeTruthy();
      expect(yourOtherWorkplacesSummaryText.getAttribute('href')).toBeFalsy();
      expect(queryByTestId('workplaces-orange-flag')).toBeFalsy();
    });

    it('should show message if showMissingCqcMessage is true and there are workplaces', async () => {
      const { component, fixture, getByText, getByTestId } = await setup();

      component.workplacesCount = 1;
      component.showMissingCqcMessage = true;
      component.otherWorkplacesSection.orangeFlag = true;

      component.ngOnInit();
      fixture.detectChanges();

      component.isParent = true;

      const yourOtherWorkplacesSummaryText = getByText('Have you added all of your workplaces?');

      expect(yourOtherWorkplacesSummaryText).toBeTruthy();
      expect(yourOtherWorkplacesSummaryText.getAttribute('href')).toBe('/workplace/view-all-workplaces');
      expect(getByTestId('workplaces-orange-flag')).toBeTruthy();
    });

    it('should show the no workplace message when showMissingCqcMessage is false and there are workplaces', async () => {
      const { component, getByText, fixture, queryByTestId } = await setup();

      component.workplacesCount = 1;

      component.ngOnInit();
      fixture.detectChanges();

      component.isParent = true;

      const yourOtherWorkplacesSummaryText = getByText('Check and update your other workplaces often');

      expect(yourOtherWorkplacesSummaryText).toBeTruthy();
      expect(yourOtherWorkplacesSummaryText.getAttribute('href')).toBeFalsy();
      expect(queryByTestId('workplaces-orange-flag')).toBeFalsy();
    });
  });
});
