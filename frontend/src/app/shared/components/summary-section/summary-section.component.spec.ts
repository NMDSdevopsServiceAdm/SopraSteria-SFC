import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterModule } from '@angular/router';
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
import { of } from 'rxjs';

import { Establishment } from '../../../../mockdata/establishment';
import { SummarySectionComponent } from './summary-section.component';

describe('Summary section', () => {
  const setup = async (overrides: any = {}) => {
    const setupTools = await render(SummarySectionComponent, {
      imports: [SharedModule, HttpClientTestingModule, RouterModule],
      providers: [
        {
          provide: TabsService,
          useClass: MockTabsService,
        },
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceCheckCQCDetails.factory(overrides.checkCqcDetails ?? false),
          deps: [HttpClient],
        },
        provideRouter([]),
      ],
      componentProperties: {
        workplace: overrides.establishment ?? Establishment,
        trainingCounts: (overrides.trainingCounts as TrainingCounts) ?? ({} as TrainingCounts),
        navigateToTab: (event) => {
          event.preventDefault();
        },
        workerCount: overrides?.workerCount ?? Establishment.numberOfStaff,
        workersCreatedDate: overrides.workerCreatedDate ?? [dayjs()],
        workersNotCompleted: (overrides.workersNotCompleted as Worker[]) ?? ([workerBuilder()] as Worker[]),
        isParent: overrides.isParent ?? false,
        canViewListOfWorkers: overrides.canViewListOfWorkers ?? true,
        canEditWorker: overrides.canEditWorker ?? true,
        canEditEstablishment: overrides.canEditEstablishment ?? true,
        canViewEstablishment: overrides.canViewEstablishment ?? true,
        showMissingCqcMessage: overrides.showMissingCqcMessage ?? false,
        workplacesCount: overrides.workplacesCount ?? 0,
        isParentSubsidiaryView: overrides.isParentSubsidiaryView ?? false,
        noOfWorkersWhoRequireInternationalRecruitment: overrides.noOfWorkersWhoRequireInternationalRecruitment ?? 0,
        noOfWorkersWithCareWorkforcePathwayCategoryRoleUnanswered:
          overrides.noOfWorkersWithCareWorkforcePathwayCategoryRoleUnanswered ?? 0,
        cwpQuestionsFlag: overrides.cwpQuestionsFlag ?? false,
      },
    });

    const component = setupTools.fixture.componentInstance;
    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const tabsService = injector.inject(TabsService) as TabsService;

    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const updateSingleFieldSpy = spyOn(establishmentService, 'updateSingleEstablishmentField').and.returnValue(
      of(null),
    );
    const setReturnToSpy = spyOn(establishmentService, 'setReturnTo');

    return {
      ...setupTools,
      component,
      routerSpy,
      tabsService,
      updateSingleFieldSpy,
      setReturnToSpy,
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

      const overrides = {
        checkCqcDetails: false,
        establishment,
        workerCount: 0,
        workerCreatedDate: date,
        canViewListOfWorkers: false,
        canViewEstablishment: false,
      };

      const { fixture, getByText } = await setup(overrides);

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

      const overrides = {
        checkCqcDetails: false,
        establishment,
        workerCount: 0,
        workerCreatedDate: date,
        canViewListOfWorkers: false,
        canViewEstablishment: true,
      };

      const { component, fixture, getByText } = await setup(overrides);
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

      const overrides = {
        checkCqcDetails: false,
        establishment,
      };

      const { getByTestId } = await setup(overrides);

      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).getByText('Add more details to your workplace')).toBeTruthy();
      expect(within(workplaceRow).getByTestId('orange-flag')).toBeTruthy();
    });

    describe('CWP awareness question', () => {
      const establishmentWhichShouldSeeMessage = () => {
        return {
          ...Establishment,
          showAddWorkplaceDetailsBanner: false,
          CWPAwarenessQuestionViewed: null,
          careWorkforcePathwayWorkplaceAwareness: null,
        };
      };

      it('should show the CWP awareness message if workplace details added, CWPAwarenessQuestionViewed null and awareness question not answered', async () => {
        const { getByTestId } = await setup({ establishment: establishmentWhichShouldSeeMessage() });

        const workplaceRow = getByTestId('workplace-row');
        expect(within(workplaceRow).getByText('How aware of the CWP is your workplace?')).toBeTruthy();
        expect(within(workplaceRow).getByTestId('orange-flag')).toBeTruthy();
      });

      it('should navigate to care-workforce-pathway-awareness when question link clicked', async () => {
        const { getByTestId, routerSpy } = await setup({ establishment: establishmentWhichShouldSeeMessage() });

        const workplaceRow = getByTestId('workplace-row');
        const link = within(workplaceRow).getByText('How aware of the CWP is your workplace?');

        fireEvent.click(link);
        expect(routerSpy).toHaveBeenCalledWith(['/workplace', Establishment.uid, 'care-workforce-pathway-awareness']);
      });

      it("should update CWPAwarenessQuestionViewed when question link clicked so user doesn't see question again", async () => {
        const { getByTestId, updateSingleFieldSpy } = await setup({
          establishment: establishmentWhichShouldSeeMessage(),
        });

        const workplaceRow = getByTestId('workplace-row');
        const link = within(workplaceRow).getByText('How aware of the CWP is your workplace?');

        fireEvent.click(link);
        expect(updateSingleFieldSpy).toHaveBeenCalledWith(Establishment.uid, {
          property: 'CWPAwarenessQuestionViewed',
          value: true,
        });
      });

      it('should set return in establishment service when question link clicked', async () => {
        const { getByTestId, setReturnToSpy } = await setup({ establishment: establishmentWhichShouldSeeMessage() });

        const workplaceRow = getByTestId('workplace-row');
        const link = within(workplaceRow).getByText('How aware of the CWP is your workplace?');

        fireEvent.click(link);
        expect(setReturnToSpy).toHaveBeenCalled();
      });

      it('should not update CWPAwarenessQuestionViewed when Workplace link clicked', async () => {
        const { getByTestId, updateSingleFieldSpy } = await setup({
          establishment: establishmentWhichShouldSeeMessage(),
        });

        const workplaceRow = getByTestId('workplace-row');
        const link = within(workplaceRow).getByText('Workplace');

        fireEvent.click(link);
        expect(updateSingleFieldSpy).not.toHaveBeenCalled();
      });

      it('should not show the CWP awareness message if workplace details added and CWPAwarenessQuestionViewed null, but awareness question answered', async () => {
        // user has answered question in workplace flow or from workplace tab so should not show
        const establishment = {
          ...Establishment,
          showAddWorkplaceDetailsBanner: false,
          CWPAwarenessQuestionViewed: null,
          careWorkforcePathwayWorkplaceAwareness: {
            id: 1,
            title: 'Aware of how the care workforce pathway works in practice',
          },
        };

        const { getByTestId } = await setup({ establishment });

        const workplaceRow = getByTestId('workplace-row');
        expect(within(workplaceRow).queryByText('How aware of the CWP is your workplace?')).toBeFalsy();
      });

      it('should not show the CWP awareness message if CWPAwarenessQuestionViewed true and awareness question not answered', async () => {
        // user has clicked link and still not answered, should no longer see it
        const establishment = {
          ...Establishment,
          showAddWorkplaceDetailsBanner: false,
          CWPAwarenessQuestionViewed: true,
          careWorkforcePathwayWorkplaceAwareness: null,
        };

        const { getByTestId } = await setup({ establishment });

        const workplaceRow = getByTestId('workplace-row');
        expect(within(workplaceRow).queryByText('How aware of the CWP is your workplace?')).toBeFalsy();
      });

      it('should not show the CWP awareness message if CWPAwarenessQuestionViewed true and awareness question answered', async () => {
        const establishment = {
          ...Establishment,
          showAddWorkplaceDetailsBanner: false,
          CWPAwarenessQuestionViewed: null,
          careWorkforcePathwayWorkplaceAwareness: {
            id: 1,
            title: 'Aware of how the care workforce pathway works in practice',
          },
        };

        const { getByTestId } = await setup({ establishment });

        const workplaceRow = getByTestId('workplace-row');
        expect(within(workplaceRow).queryByText('How aware of the CWP is your workplace?')).toBeFalsy();
      });

      it('should show with no link if there CWP awareness not viewed or answered but no edit permission for establishment', async () => {
        const { getByTestId, getByText } = await setup({
          canEditEstablishment: false,
          establishment: establishmentWhichShouldSeeMessage(),
        });

        const workplaceRow = getByTestId('workplace-row');
        const cwpMessage = within(workplaceRow).queryByText('How aware of the CWP is your workplace?');
        expect(cwpMessage.tagName).not.toBe('A');

        const workplaceLink = getByText('Workplace');
        expect(workplaceLink.tagName).toBe('A');
      });
    });

    it('should navigate to sub workplace page when clicking the add workplace details message in sub view', async () => {
      const establishment = { ...Establishment, showAddWorkplaceDetailsBanner: true };

      const overrides = {
        checkCqcDetails: true,
        establishment,
        workerCount: 0,
        canViewListOfWorkers: true,
        canViewEstablishment: true,
        isParentSubsidiaryView: true,
        noOfWorkersWhoRequireInternationalRecruitment: 0,
      };

      const { getByText, routerSpy } = await setup(overrides);

      const workplaceDetailsMessage = getByText('Add more details to your workplace');
      fireEvent.click(workplaceDetailsMessage);

      expect(routerSpy).toHaveBeenCalledWith(['subsidiary', Establishment.uid, 'workplace']);
    });

    it('should show the check cqc details message if checkCQCDetails banner is true and the showAddWorkplaceDetailsBanner is false', async () => {
      const overrides = {
        checkCqcDetails: true,
      };

      const { getByTestId } = await setup(overrides);

      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).getByText('You need to check your CQC details')).toBeTruthy();
      expect(within(workplaceRow).getByTestId('orange-flag')).toBeTruthy();
    });

    it('should show the total staff error if it is not available', async () => {
      const establishment = { ...Establishment, numberOfStaff: undefined };

      const overrides = {
        checkCqcDetails: false,
        establishment,
      };
      const { getByTestId } = await setup(overrides);

      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).getByText(`You've not added your total number of staff`)).toBeTruthy();
      expect(within(workplaceRow).getByTestId('red-flag')).toBeTruthy();
    });

    it('should not show the total staff error if numberOfStaff is 0', async () => {
      const establishment = { ...Establishment, numberOfStaff: 0 };
      const overrides = {
        checkCqcDetails: false,
        establishment,
        numberOfStaff: 0,
      };
      const { getByTestId } = await setup(overrides);

      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).queryByText(`You've not added your total number of staff`)).toBeFalsy();
      expect(within(workplaceRow).queryByTestId('red-flag')).toBeFalsy();
    });

    it('should show the staff total does not match staff records warning when they do not match and it is after eight weeks since first login', async () => {
      const establishment = {
        ...Establishment,
        eightWeeksFromFirstLogin: dayjs(new Date()).subtract(1, 'day').toString(),
      };

      const overrides = {
        checkCqcDetails: false,
        establishment,
        workerCount: 102,
      };

      const { getByTestId } = await setup(overrides);

      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).getByText('Staff total does not match staff records added')).toBeTruthy();
      expect(within(workplaceRow).getByTestId('orange-flag')).toBeTruthy();
    });

    it('should not show the staff total does not match staff records warning when after eight weeks since first login is null', async () => {
      const establishment = { ...Establishment, eightWeeksFromFirstLogin: null };

      const overrides = {
        checkCqcDetails: false,
        establishment,
        workerCount: 102,
      };

      const { getByTestId } = await setup(overrides);

      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).queryByText('Staff total does not match staff records added')).toBeFalsy();
      expect(within(workplaceRow).queryByTestId('orange-flag')).toBeFalsy();
    });

    it('should not show the staff total does not match staff records warning when they do not match if is less than eight weeks since first login', async () => {
      const establishment = { ...Establishment, eightWeeksFromFirstLogin: dayjs(new Date()).add(1, 'day').toString() };

      const overrides = {
        checkCqcDetails: false,
        establishment,
        workerCount: 102,
      };

      const { getByTestId } = await setup(overrides);

      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).queryByText('Staff total does not match staff records added')).toBeFalsy();
      expect(within(workplaceRow).queryByTestId('orange-flag')).toBeFalsy();
    });

    it('should show a warning saying that vacancy and turnover data has not been added if they have not been added', async () => {
      const establishment = { ...Establishment, leavers: null, vacancies: null, starters: null };

      const overrides = {
        checkCqcDetails: false,
        establishment,
      };

      const { getByTestId } = await setup(overrides);

      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).getByText(`You've not added any vacancy and turnover data`)).toBeTruthy();
      expect(within(workplaceRow).getByTestId('orange-flag')).toBeTruthy();
    });

    it('should show a warning saying that no vacancy data has been added if it has not been added, but starters data has been added', async () => {
      const establishment = { ...Establishment, leavers: null, vacancies: null, starters: 'None' };

      const overrides = {
        checkCqcDetails: false,
        establishment,
      };

      const { getByTestId } = await setup(overrides);

      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).getByText(`You've not added any staff vacancy data`)).toBeTruthy();
      expect(within(workplaceRow).getByTestId('orange-flag')).toBeTruthy();
    });

    it('should show a warning saying that no vacancy data has been added if it has not been added, but leavers data has been added', async () => {
      const establishment = { ...Establishment, leavers: 'None', vacancies: null, starters: null };

      const overrides = {
        checkCqcDetails: false,
        establishment,
      };

      const { getByTestId } = await setup(overrides);

      const workplaceRow = getByTestId('workplace-row');
      expect(within(workplaceRow).getByText(`You've not added any staff vacancy data`)).toBeTruthy();
      expect(within(workplaceRow).getByTestId('orange-flag')).toBeTruthy();
    });

    it('should show a warning saying that no vacancy data has been added if it has not been added, but both starters and leavers data has been added', async () => {
      const establishment = { ...Establishment, leavers: 'None', vacancies: null, starters: `Don't know` };

      const overrides = {
        checkCqcDetails: false,
        establishment,
      };

      const { getByTestId } = await setup(overrides);

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

    it('should not show clickable staff records link if no permissions to view staff records', async () => {
      const establishment = {
        ...Establishment,
        created: dayjs().subtract(1, 'year'),
        numberOfStaff: 12,
      };

      const date = [dayjs().subtract(1, 'year')];

      const overrides = {
        checkCqcDetails: false,
        establishment,
        workerCount: 0,
        workerCreatedDate: date,
        canViewListOfWorkers: false,
        canViewEstablishment: true,
      };

      const { fixture, getByText } = await setup(overrides);

      fixture.detectChanges();

      const staffRecordsLinkText = getByText('Staff records');

      expect(staffRecordsLinkText.getAttribute('href')).toBeFalsy();
    });

    it('should show default message if no permission to view staff records', async () => {
      const overrides = {
        checkCqcDetails: false,
        establishment: Establishment,
        workerCount: 0,
        canViewListOfWorkers: false,
      };

      const { fixture, getByTestId } = await setup(overrides);

      fixture.detectChanges();

      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).getByText('Remember to check and update this data often')).toBeTruthy();
    });

    it('should show clickable staff records link if access to workplace', async () => {
      const overrides = { canViewListOfWorkers: true };

      const { getByText } = await setup(overrides);

      const staffRecordsLinkText = getByText('Staff records');

      expect(staffRecordsLinkText.getAttribute('href')).toBeTruthy();
    });

    it('should show default summary message when no data needs to be adding or updating', async () => {
      const { getByTestId } = await setup();

      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).getByText('Remember to check and update this data often')).toBeTruthy();
    });

    it('should show start to add your staff message when there is no staff records', async () => {
      const overrides = {
        checkCqcDetails: false,
        establishment: Establishment,
        workerCount: 0,
      };

      const { getByTestId } = await setup(overrides);

      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).getByText('You can start to add your staff records now')).toBeTruthy();
      expect(getByTestId('orange-flag')).toBeTruthy();
    });

    it('should navigate to sub staff records page when clicking on start to add your staff message in sub view', async () => {
      const overrides = {
        checkCqcDetails: false,
        establishment: Establishment,
        workerCount: 0,
        canViewListOfWorkers: true,
        canViewEstablishment: true,
        isParentSubsidiaryView: true,
      };

      const { getByText, routerSpy } = await setup(overrides);

      const staffRecordMessage = getByText('You can start to add your staff records now');
      fireEvent.click(staffRecordMessage);

      expect(routerSpy).toHaveBeenCalledWith(['subsidiary', Establishment.uid, 'staff-records']);
    });

    describe('care workforce pathway link', () => {
      describe('with cwpQuestionsFlag true', () => {
        it('should not show if even there are staff without an answer', async () => {
          const overrides = {
            noOfWorkersWithCareWorkforcePathwayCategoryRoleUnanswered: 2,
            cwpQuestionsFlag: true,
          };
          const { queryByText } = await setup(overrides);

          const workersCareWorkforcePathwayLink = queryByText('Where are your staff on the care workforce pathway?');

          expect(workersCareWorkforcePathwayLink).toBeFalsy();
        });
      });

      describe('with cwpQuestionsFlag false', () => {
        it('should show if there are staff without an answer', async () => {
          const overrides = {
            noOfWorkersWithCareWorkforcePathwayCategoryRoleUnanswered: 2,
            cwpQuestionsFlag: false,
          };
          const { fixture, getByText, routerSpy, tabsService } = await setup(overrides);
          const selectedTabSpy = spyOnProperty(tabsService, 'selectedTab', 'set');

          const workersCareWorkforcePathwayLink = getByText('Where are your staff on the care workforce pathway?');
          fireEvent.click(workersCareWorkforcePathwayLink);
          await fixture.whenStable();

          expect(workersCareWorkforcePathwayLink).toBeTruthy();
          expect(routerSpy).toHaveBeenCalledOnceWith([
            '/workplace',
            Establishment.uid,
            'staff-record',
            'care-workforce-pathway-workers-summary',
          ]);
          expect(selectedTabSpy).not.toHaveBeenCalled();
        });

        it('should show with no link if there are staff without an answer but no edit permission for workers', async () => {
          const overrides = {
            noOfWorkersWithCareWorkforcePathwayCategoryRoleUnanswered: 2,
            cwpQuestionsFlag: false,
            canEditWorker: false,
          };
          const { getByText } = await setup(overrides);

          const workersCareWorkforcePathwayText = getByText('Where are your staff on the care workforce pathway?');
          expect(workersCareWorkforcePathwayText.tagName).not.toBe('A');

          const staffRecordsLink = getByText('Staff records');
          expect(staffRecordsLink.tagName).toBe('A');
        });

        it('should not show if there are no staff without an answer', async () => {
          const overrides = {
            noOfWorkersWithCareWorkforcePathwayCategoryRoleUnanswered: 0,
            cwpQuestionsFlag: false,
          };
          const { queryByText } = await setup(overrides);

          const workersCareWorkforcePathwayLink = queryByText('Where are your staff on the care workforce pathway?');

          expect(workersCareWorkforcePathwayLink).toBeFalsy();
        });
      });
    });

    it('should show staff record does not match message when the number of staff is more than the staff record', async () => {
      const establishment = {
        ...Establishment,
        eightWeeksFromFirstLogin: dayjs(new Date()).subtract(1, 'day').toString(),
      };

      const overrides = {
        checkCqcDetails: false,
        establishment: establishment,
        workerCount: 102,
      };

      const { getByTestId } = await setup(overrides);

      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).getByText('Staff records added does not match staff total')).toBeTruthy();
      expect(within(staffRecordsRow).getByTestId('orange-flag')).toBeTruthy();
    });

    it('should not show staff record does not match message when the number of staff is equal to the staff record', async () => {
      const establishment = {
        ...Establishment,
        eightWeeksFromFirstLogin: dayjs(new Date()).subtract(1, 'day').toString(),
      };

      const overrides = {
        checkCqcDetails: false,
        establishment,
      };

      const { getByTestId } = await setup(overrides);

      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).queryByText('Staff records added does not match staff total')).toBeFalsy();
    });

    it('should not show the Staff records added does not match staff total warning when after eight weeks since first login is null', async () => {
      const establishment = { ...Establishment, eightWeeksFromFirstLogin: null };

      const overrides = {
        checkCqcDetails: false,
        establishment,
        workerCount: 102,
      };

      const { getByTestId } = await setup(overrides);

      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).queryByText('Staff records added does not match staff total')).toBeFalsy();
    });

    it('should not show staff record does not match message when the eight week date is in the future ', async () => {
      const establishment = {
        ...Establishment,
        eightWeeksFromFirstLogin: dayjs(new Date()).add(1, 'day').toString(),
      };

      const overrides = {
        establishment,
      };

      const { fixture, getByTestId } = await setup(overrides);
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

      const overrides = {
        checkCqcDetails: false,
        establishment,
        workerCount: 12,
        workerCreatedDate: date,
      };

      const { fixture, getByTestId } = await setup(overrides);

      fixture.detectChanges();
      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).queryByText('No staff records added in the last 12 months')).toBeTruthy();
    });

    it('should not  show "No staff records added in the last 12 months" message when stablishment has less thsn 10 staff and workplace created date and last worker added date is less than 12 months', async () => {
      const establishment = {
        ...Establishment,
        created: dayjs().subtract(11, 'month'),
      };

      const overrides = {
        checkCqcDetails: false,
        establishment,
        workerCount: 9,
      };

      const { fixture, getByTestId } = await setup(overrides);

      fixture.detectChanges();
      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).queryByText('No staff records added in the last 12 months')).toBeFalsy();
    });

    [
      { noOfWorkers: 1, message: 'Is this worker on a Health and Care Worker visa?' },
      { noOfWorkers: 2, message: 'Are these workers on Health and Care Worker visas?' },
    ].forEach((scenario) => {
      it(`should show "${scenario.message}" message when noOfWorkersWhoRequireInternationalRecruitment is ${scenario.noOfWorkers}`, async () => {
        const overrides = {
          checkCqcDetails: false,
          establishment: Establishment,
          workerCount: Establishment.numberOfStaff,
          workerCreatedDate: [dayjs()],
          workersNotCompleted: [workerBuilder()] as Worker[],
          canViewListOfWorkers: true,
          canViewEstablishment: true,
          isParentSubsidiaryView: false,
          noOfWorkersWhoRequireInternationalRecruitment: scenario.noOfWorkers,
        };

        const { getByTestId } = await setup(overrides);

        const staffRecordsRow = getByTestId('staff-records-row');
        expect(within(staffRecordsRow).queryByText(scenario.message)).toBeTruthy();
      });

      it(`should navigate to health and care visa page when "${scenario.message}" link clicked`, async () => {
        const overrides = {
          checkCqcDetails: false,
          establishment: Establishment,
          workerCount: Establishment.numberOfStaff,
          workerCreatedDate: [dayjs()],
          workersNotCompleted: [workerBuilder()] as Worker[],
          canViewListOfWorkers: true,
          canViewEstablishment: true,
          isParentSubsidiaryView: false,
          noOfWorkersWhoRequireInternationalRecruitment: scenario.noOfWorkers,
        };

        const { getByText, routerSpy } = await setup(overrides);

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

      const overrides = {
        checkCqcDetails: false,
        establishment,
        workerCount: 12,
        workerCreatedDate: date,
      };
      const { fixture, getByTestId } = await setup(overrides);

      fixture.detectChanges();
      const staffRecordsRow = getByTestId('staff-records-row');
      expect(within(staffRecordsRow).queryByText('No staff records added in the last 12 months')).toBeFalsy();
    });

    it('should not show "No staff records added in the last 12 months" message when stablishment has more than 10 staff  and last worker added date is less than 12 month ', async () => {
      const establishment = {
        ...Establishment,
        created: dayjs().subtract(11, 'month'),
      };

      const overrides = {
        checkCqcDetails: false,
        establishment,
        workerCount: 12,
      };

      const { fixture, getByTestId } = await setup(overrides);

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
        const overrides = {
          checkCqcDetails: false,
          establishment: Establishment,
          workerCount: 12,
          workerCreatedDate: [dayjs()],
          workersNotCompleted: workerCreatedDate('month'),
        };

        const { getByTestId } = await setup(overrides);

        const staffRecordsRow = getByTestId('staff-records-row');
        expect(within(staffRecordsRow).queryByText('Some records only have mandatory data added')).toBeTruthy();
      });

      it('should navigate to basic-staff-records when "Some records only have mandatory data added" clicked', async () => {
        const overrides = {
          checkCqcDetails: false,
          establishment: Establishment,
          workerCount: 12,
          workerCreatedDate: [dayjs()],
          workersNotCompleted: workerCreatedDate('month'),
        };

        const { getByText, routerSpy } = await setup(overrides);

        const basicStaffRecordsLink = getByText('Some records only have mandatory data added');
        fireEvent.click(basicStaffRecordsLink);
        expect(routerSpy).toHaveBeenCalledWith(['/staff-basic-records']);
      });

      it('should navigate to basic-staff-records with uid when "Some records only have mandatory data added" clicked in sub view', async () => {
        const overrides = {
          checkCqcDetails: false,
          establishment: Establishment,
          workerCount: 12,
          workerCreatedDate: [dayjs()],
          workersNotCompleted: workerCreatedDate('month'),
          canViewListOfWorkers: true,
          canViewEstablishment: true,
          isParentSubsidiaryView: true,
        };

        const { getByText, routerSpy } = await setup(overrides);

        const basicStaffRecordsLink = getByText('Some records only have mandatory data added');
        fireEvent.click(basicStaffRecordsLink);
        expect(routerSpy).toHaveBeenCalledWith(['/staff-basic-records', Establishment.uid]);
      });

      it('should not show "Some records only have mandatory data added" message when staff records are not completed and worker added date is less than 1 month ago', async () => {
        const overrides = {
          checkCqcDetails: false,
          establishment: Establishment,
          workerCount: 12,
          workerCreatedDate: [dayjs()],
          workersNotCompleted: workerCreatedDate('week'),
        };

        const { getByTestId } = await setup(overrides);

        const staffRecordsRow = getByTestId('staff-records-row');
        expect(within(staffRecordsRow).queryByText('Some records only have mandatory data added')).toBeFalsy();
      });

      it('should not show "Some records only have mandatory data added" message when staff records are completed and worker added date is less than 1 month ago', async () => {
        const overrides = {
          checkCqcDetails: false,
          establishment: Establishment,
          workerCount: 12,
          workerCreatedDate: [dayjs()],
          workersNotCompleted: workerCreatedDate('week'),
        };

        const { getByTestId } = await setup(overrides);

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

      const overrides = {
        checkCqcDetails: false,
        establishment,
        workerCount: 0,
        workerCreatedDate: date,
        canViewListOfWorkers: false,
        canViewEstablishment: true,
      };

      const { fixture, getByText } = await setup(overrides);

      fixture.detectChanges();

      const trainingAndQualificationsLinkText = getByText('Training and qualifications');

      expect(trainingAndQualificationsLinkText.getAttribute('href')).toBeFalsy();
    });

    it('should show clickable training and qualifications link if access to workplace', async () => {
      const overrides = { canViewListOfWorkers: true };

      const { getByText } = await setup(overrides);

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
        const overrides = {
          checkCqcDetails: false,
          establishment: Establishment,
          workerCount: 2,
          trainingCounts,
        };
        const { getByTestId } = await setup(overrides);
        const tAndQRow = getByTestId('training-and-qualifications-row');
        expect(within(tAndQRow).queryByTestId('orange-flag')).toBeFalsy();
        expect(within(tAndQRow).getByTestId('red-flag')).toBeTruthy();
        expect(within(tAndQRow).getByText('2 staff are missing mandatory training')).toBeTruthy();
      });

      it('should show when mandatory training is missing for a single user', async () => {
        const trainingCounts = { staffMissingMandatoryTraining: 1 };
        const overrides = {
          checkCqcDetails: false,
          establishment: Establishment,
          workerCount: 2,
          trainingCounts,
        };
        const { getByTestId } = await setup(overrides);
        const tAndQRow = getByTestId('training-and-qualifications-row');
        expect(within(tAndQRow).queryByTestId('orange-flag')).toBeFalsy();
        expect(within(tAndQRow).getByTestId('red-flag')).toBeTruthy();
        expect(within(tAndQRow).getByText('1 staff is missing mandatory training')).toBeTruthy();
      });

      it('should not show when mandatory training is not missing', async () => {
        const trainingCounts = { staffMissingMandatoryTraining: 0 };
        const overrides = {
          checkCqcDetails: false,
          establishment: Establishment,
          workerCount: 2,
          trainingCounts,
        };
        const { getByTestId } = await setup(overrides);
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
        const overrides = {
          checkCqcDetails: false,
          establishment: Establishment,
          workerCount: 2,
          trainingCounts,
        };
        const { getByTestId } = await setup(overrides);
        const tAndQRow = getByTestId('training-and-qualifications-row');
        expect(within(tAndQRow).queryByTestId('orange-flag')).toBeFalsy();
        expect(within(tAndQRow).getByTestId('red-flag')).toBeTruthy();
        expect(within(tAndQRow).getByText('2 training records have expired')).toBeTruthy();
      });

      it('should show when training is expired for a single user', async () => {
        const trainingCounts = { totalExpiredTraining: 1 };
        const overrides = {
          checkCqcDetails: false,
          establishment: Establishment,
          workerCount: 2,
          trainingCounts,
        };
        const { getByTestId } = await setup(overrides);
        const tAndQRow = getByTestId('training-and-qualifications-row');
        expect(within(tAndQRow).queryByTestId('orange-flag')).toBeFalsy();
        expect(within(tAndQRow).getByTestId('red-flag')).toBeTruthy();
        expect(within(tAndQRow).getByText('1 training record has expired')).toBeTruthy();
      });

      it('should not show when training is not expired', async () => {
        const trainingCounts = { totalExpiredTraining: 0 };
        const overrides = {
          checkCqcDetails: false,
          establishment: Establishment,
          workerCount: 2,
          trainingCounts,
        };
        const { getByTestId } = await setup(overrides);
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
        const overrides = {
          checkCqcDetails: false,
          establishment: Establishment,
          workerCount: 2,
          trainingCounts,
        };
        const { getByTestId } = await setup(overrides);
        const tAndQRow = getByTestId('training-and-qualifications-row');
        expect(within(tAndQRow).getByTestId('orange-flag')).toBeTruthy();
        expect(within(tAndQRow).queryByTestId('red-flag')).toBeFalsy();
        expect(within(tAndQRow).getByText('2 training records expire soon')).toBeTruthy();
      });

      it('should show when training is expiring for a single user', async () => {
        const trainingCounts = { totalExpiringTraining: 1 };
        const overrides = {
          checkCqcDetails: false,
          establishment: Establishment,
          workerCount: 2,
          trainingCounts,
        };
        const { getByTestId } = await setup(overrides);
        const tAndQRow = getByTestId('training-and-qualifications-row');
        expect(within(tAndQRow).getByTestId('orange-flag')).toBeTruthy();
        expect(within(tAndQRow).queryByTestId('red-flag')).toBeFalsy();
        expect(within(tAndQRow).getByText('1 training record expires soon')).toBeTruthy();
      });

      it('should not show when training is not expiring', async () => {
        const trainingCounts = { totalExpiringTraining: 0 };
        const overrides = {
          checkCqcDetails: false,
          establishment: Establishment,
          workerCount: 2,
          trainingCounts,
        };
        const { getByTestId } = await setup(overrides);
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
        const overrides = {
          checkCqcDetails: false,
          establishment: Establishment,
          workerCount: 2,
          trainingCounts,
        };
        const { getByTestId } = await setup(overrides);
        const tAndQRow = getByTestId('training-and-qualifications-row');
        expect(within(tAndQRow).getByTestId('orange-flag')).toBeTruthy();
        expect(within(tAndQRow).queryByTestId('red-flag')).toBeFalsy();
        expect(within(tAndQRow).getByText('Manage your staff training and qualifications')).toBeTruthy();
      });

      it('should not show when records exist', async () => {
        const trainingCounts = { totalRecords: 1, totalTraining: 0 };
        const overrides = {
          checkCqcDetails: false,
          establishment: Establishment,
          workerCount: 2,
          trainingCounts,
        };
        const { getByTestId } = await setup(overrides);
        const tAndQRow = getByTestId('training-and-qualifications-row');
        expect(within(tAndQRow).queryByTestId('orange-flag')).toBeFalsy();
        expect(within(tAndQRow).queryByTestId('red-flag')).toBeFalsy();
        expect(within(tAndQRow).queryByText('Manage your staff training and qualifications')).toBeFalsy();
      });
    });
  });

  describe('your other workplaces summary section', () => {
    it('should show the row', async () => {
      const establishment = {
        ...Establishment,
        isParent: true,
      };
      const overrides = { establishment };
      const { getByTestId } = await setup(overrides);

      const workplacesRow = getByTestId('workplaces-row');
      expect(workplacesRow).toBeTruthy();
    });

    it('should show you other workplaces link', async () => {
      const establishment = {
        ...Establishment,
        isParent: true,
      };
      const overrides = { establishment };
      const { getByText } = await setup(overrides);

      const yourOtherWorkplacesText = getByText('Your other workplaces');

      expect(yourOtherWorkplacesText).toBeTruthy();
      expect(yourOtherWorkplacesText.getAttribute('href')).toBeTruthy();
    });

    it('should show message if there are no workplaces added', async () => {
      const establishment = {
        ...Establishment,
        isParent: true,
      };
      const overrides = { establishment };
      const { getByText, queryByTestId } = await setup(overrides);

      const yourOtherWorkplacesSummaryText = getByText("You've not added any other workplaces yet");

      expect(yourOtherWorkplacesSummaryText).toBeTruthy();
      expect(yourOtherWorkplacesSummaryText.getAttribute('href')).toBeFalsy();
      expect(queryByTestId('workplaces-orange-flag')).toBeFalsy();
    });

    it('should show message if showMissingCqcMessage is true and there are workplaces', async () => {
      const establishment = {
        ...Establishment,
        isParent: true,
      };

      const overrides = {
        establishment,
        workplacesCount: 1,
        showMissingCqcMessage: true,
        isParent: true,
      };
      const { component, fixture, getByText, getByTestId } = await setup(overrides);

      component.otherWorkplacesSection.orangeFlag = true;

      component.ngOnInit();
      fixture.detectChanges();

      const yourOtherWorkplacesSummaryText = getByText('Have you added all of your workplaces?');

      expect(yourOtherWorkplacesSummaryText).toBeTruthy();
      expect(yourOtherWorkplacesSummaryText.getAttribute('href')).toBe('/workplace/view-all-workplaces');
      expect(getByTestId('workplaces-orange-flag')).toBeTruthy();
    });

    it('should show the no workplace message when showMissingCqcMessage is false and there are workplaces', async () => {
      const establishment = {
        ...Establishment,
        isParent: true,
      };

      const overrides = {
        establishment,
        workplacesCount: 1,
        isParent: true,
        showMissingCqcMessage: false,
      };
      const { getByText, queryByTestId } = await setup(overrides);

      const yourOtherWorkplacesSummaryText = getByText('Check and update your other workplaces often');

      expect(yourOtherWorkplacesSummaryText).toBeTruthy();
      expect(yourOtherWorkplacesSummaryText.getAttribute('href')).toBeFalsy();
      expect(queryByTestId('workplaces-orange-flag')).toBeFalsy();
    });
  });
});
