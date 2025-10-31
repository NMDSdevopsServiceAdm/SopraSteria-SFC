import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { benchmarksData, allRankingsData } from '@core/test-utils/MockBenchmarkService';
import { BenchmarksSelectViewPanelComponent } from '@shared/components/benchmarks-select-view-panel/benchmarks-select-view-panel.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { DataAreaRecruitmentAndRetentionComponent } from './data-area-recruiment-and-retention.component';

describe('DataAreaRecruitmentAndRetentionComponent', () => {
  const setup = async (viewBenchmarksComparisonGroups = false) => {
    const { fixture, getByText, getByTestId, queryByTestId } = await render(DataAreaRecruitmentAndRetentionComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
      declarations: [BenchmarksSelectViewPanelComponent],
      schemas: [NO_ERRORS_SCHEMA],
      componentProperties: {
        data: benchmarksData,
        viewBenchmarksComparisonGroups,
        rankingsData: allRankingsData,
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryByTestId,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('comparision table', () => {
    it('should render values for the workplace and comparison data', async () => {
      const { getByTestId } = await setup();

      const vacancyRow = getByTestId('vacancyRow');
      const turnoverRow = getByTestId('turnoverRow');
      const timeInRoleRow = getByTestId('timeInRoleRow');

      expect(within(vacancyRow).getByText('7%')).toBeTruthy();
      expect(within(vacancyRow).getByText('6%')).toBeTruthy();
      expect(within(turnoverRow).getByText('28%')).toBeTruthy();
      expect(within(turnoverRow).getByText('27%')).toBeTruthy();
      expect(within(timeInRoleRow).getByText('88%')).toBeTruthy();
      expect(within(timeInRoleRow).getByText('89%')).toBeTruthy();
    });

    it('should render the values for the workplace and goodCqc comparison data', async () => {
      const { getByTestId } = await setup(true);

      const vacancyRow = getByTestId('vacancyRow');
      const turnoverRow = getByTestId('turnoverRow');
      const timeInRoleRow = getByTestId('timeInRoleRow');

      expect(within(vacancyRow).getByText('7%')).toBeTruthy();
      expect(within(vacancyRow).getByText('5%')).toBeTruthy();
      expect(within(turnoverRow).getByText('28%')).toBeTruthy();
      expect(within(turnoverRow).getByText('29%')).toBeTruthy();
      expect(within(timeInRoleRow).getByText('88%')).toBeTruthy();
      expect(within(timeInRoleRow).getByText('90%')).toBeTruthy();
    });

    describe('no workplace or comparision data', () => {
      it('shows "no data added" when the amount of vacancies is not known', async () => {
        const { component, getByTestId, fixture } = await setup(true);

        component.data = {
          sickness: {
            workplaceValue: { value: 11, hasValue: true },
            comparisonGroup: { value: 12, hasValue: true },
            goodCqc: { value: 15, hasValue: true },
          },
          qualifications: {
            workplaceValue: { value: 0.521, hasValue: true },
            comparisonGroup: { value: 0.533, hasValue: true },
            goodCqc: { value: 0.545, hasValue: true },
          },
          turnoverRate: {
            workplaceValue: { value: 0.281, hasValue: true },
            comparisonGroup: { value: 0.273, hasValue: true },
            goodCqc: { value: 0.2851, hasValue: true },
          },
          vacancyRate: {
            workplaceValue: { value: 0, hasValue: false, stateMessage: 'no-vacancies' },
            comparisonGroup: { value: 0.063, hasValue: true },
            goodCqc: { value: 0.051, hasValue: true },
          },
          careWorkerPay: {
            workplaceValue: { value: 1015, hasValue: true },
            comparisonGroup: { value: 1013, hasValue: true },
            goodCqc: { value: 1026, hasValue: true },
          },
          seniorCareWorkerPay: {
            workplaceValue: { value: 1091, hasValue: true },
            comparisonGroup: { value: 1091, hasValue: true },
            goodCqc: { value: 1093, hasValue: true },
          },
          registeredNursePay: {
            workplaceValue: { value: 37250, hasValue: true },
            comparisonGroup: { value: 37200, hasValue: true },
            goodCqc: { value: 37350, hasValue: true },
          },
          registeredManagerPay: {
            workplaceValue: { value: 36075, hasValue: true },
            comparisonGroup: { value: 36110, hasValue: true },
            goodCqc: { value: 36200, hasValue: true },
          },
          timeInRole: {
            workplaceValue: { value: 0.883, hasValue: true },
            comparisonGroup: { value: 0.887, hasValue: true },
            goodCqc: { value: 0.895, hasValue: true },
          },
          meta: {
            workplaces: 35,
            staff: 460,
            workplacesGoodCqc: 22,
            staffGoodCqc: 315,
            localAuthority: 'LA1',
            lastUpdated: new Date(),
          },
        };
        component.ngOnChanges();
        fixture.detectChanges();

        const vacancyRow = getByTestId('vacancyRow');
        const turnoverRow = getByTestId('turnoverRow');
        const timeInRoleRow = getByTestId('timeInRoleRow');

        expect(within(vacancyRow).getByText('No data added')).toBeTruthy();
        expect(within(vacancyRow).getByText('5%')).toBeTruthy();
        expect(within(turnoverRow).getByText('28%')).toBeTruthy();
        expect(within(turnoverRow).getByText('29%')).toBeTruthy();
        expect(within(timeInRoleRow).getByText('88%')).toBeTruthy();
        expect(within(timeInRoleRow).getByText('90%')).toBeTruthy();
      });

      it('shows "no data added" when there is a mis-match in staff and staff records', async () => {
        const { component, getByTestId, fixture } = await setup(true);

        component.data = {
          sickness: {
            workplaceValue: { value: 11, hasValue: true },
            comparisonGroup: { value: 12, hasValue: true },
            goodCqc: { value: 15, hasValue: true },
          },
          qualifications: {
            workplaceValue: { value: 0.521, hasValue: true },
            comparisonGroup: { value: 0.533, hasValue: true },
            goodCqc: { value: 0.545, hasValue: true },
          },
          turnoverRate: {
            workplaceValue: { value: 0, hasValue: false, stateMessage: 'mismatch-workers' },
            comparisonGroup: { value: 0.273, hasValue: true },
            goodCqc: { value: 0.2851, hasValue: true },
          },
          vacancyRate: {
            workplaceValue: { value: 0, hasValue: false, stateMessage: 'mismatch-workers' },
            comparisonGroup: { value: 0.063, hasValue: true },
            goodCqc: { value: 0.051, hasValue: true },
          },
          careWorkerPay: {
            workplaceValue: { value: 1015, hasValue: true },
            comparisonGroup: { value: 1013, hasValue: true },
            goodCqc: { value: 1026, hasValue: true },
          },
          seniorCareWorkerPay: {
            workplaceValue: { value: 1091, hasValue: true },
            comparisonGroup: { value: 1091, hasValue: true },
            goodCqc: { value: 1093, hasValue: true },
          },
          registeredNursePay: {
            workplaceValue: { value: 37250, hasValue: true },
            comparisonGroup: { value: 37200, hasValue: true },
            goodCqc: { value: 37350, hasValue: true },
          },
          registeredManagerPay: {
            workplaceValue: { value: 36075, hasValue: true },
            comparisonGroup: { value: 36110, hasValue: true },
            goodCqc: { value: 36200, hasValue: true },
          },
          timeInRole: {
            workplaceValue: { value: 0.883, hasValue: true },
            comparisonGroup: { value: 0.887, hasValue: true },
            goodCqc: { value: 0.895, hasValue: true },
          },
          meta: {
            workplaces: 35,
            staff: 460,
            workplacesGoodCqc: 22,
            staffGoodCqc: 315,
            localAuthority: 'LA1',
            lastUpdated: new Date(),
          },
        };

        component.ngOnChanges();
        fixture.detectChanges();

        const vacancyRow = getByTestId('vacancyRow');
        const turnoverRow = getByTestId('turnoverRow');
        const timeInRoleRow = getByTestId('timeInRoleRow');

        expect(within(vacancyRow).getByText('No data added')).toBeTruthy();
        expect(within(vacancyRow).getByText('5%')).toBeTruthy();
        expect(within(turnoverRow).getByText('No data added')).toBeTruthy();
        expect(within(turnoverRow).getByText('29%')).toBeTruthy();
        expect(within(timeInRoleRow).getByText('88%')).toBeTruthy();
        expect(within(timeInRoleRow).getByText('90%')).toBeTruthy();
      });

      it('shows "no data added" when the amount of leavers is not known', async () => {
        const { component, getByTestId, fixture } = await setup(true);

        component.data = component.data = {
          sickness: {
            workplaceValue: { value: 11, hasValue: true },
            comparisonGroup: { value: 12, hasValue: true },
            goodCqc: { value: 15, hasValue: true },
          },
          qualifications: {
            workplaceValue: { value: 0.521, hasValue: true },
            comparisonGroup: { value: 0.533, hasValue: true },
            goodCqc: { value: 0.545, hasValue: true },
          },
          turnoverRate: {
            workplaceValue: { value: 0, hasValue: false, stateMessage: 'no-leavers' },
            comparisonGroup: { value: 0.273, hasValue: true },
            goodCqc: { value: 0.2851, hasValue: true },
          },
          vacancyRate: {
            workplaceValue: { value: 0.068, hasValue: true },
            comparisonGroup: { value: 0.063, hasValue: true },
            goodCqc: { value: 0.051, hasValue: true },
          },
          careWorkerPay: {
            workplaceValue: { value: 1015, hasValue: true },
            comparisonGroup: { value: 1013, hasValue: true },
            goodCqc: { value: 1026, hasValue: true },
          },
          seniorCareWorkerPay: {
            workplaceValue: { value: 1091, hasValue: true },
            comparisonGroup: { value: 1091, hasValue: true },
            goodCqc: { value: 1093, hasValue: true },
          },
          registeredNursePay: {
            workplaceValue: { value: 37250, hasValue: true },
            comparisonGroup: { value: 37200, hasValue: true },
            goodCqc: { value: 37350, hasValue: true },
          },
          registeredManagerPay: {
            workplaceValue: { value: 36075, hasValue: true },
            comparisonGroup: { value: 36110, hasValue: true },
            goodCqc: { value: 36200, hasValue: true },
          },
          timeInRole: {
            workplaceValue: { value: 0.883, hasValue: true },
            comparisonGroup: { value: 0.887, hasValue: true },
            goodCqc: { value: 0.895, hasValue: true },
          },
          meta: {
            workplaces: 35,
            staff: 460,
            workplacesGoodCqc: 22,
            staffGoodCqc: 315,
            localAuthority: 'LA1',
            lastUpdated: new Date(),
          },
        };

        component.ngOnChanges();
        fixture.detectChanges();

        const vacancyRow = getByTestId('vacancyRow');
        const turnoverRow = getByTestId('turnoverRow');
        const timeInRoleRow = getByTestId('timeInRoleRow');

        expect(within(vacancyRow).getByText('7%')).toBeTruthy();
        expect(within(vacancyRow).getByText('5%')).toBeTruthy();
        expect(within(turnoverRow).getByText('No data added')).toBeTruthy();
        expect(within(turnoverRow).getByText('29%')).toBeTruthy();
        expect(within(timeInRoleRow).getByText('88%')).toBeTruthy();
        expect(within(timeInRoleRow).getByText('90%')).toBeTruthy();
      });

      it('shows "not enough data" message for no comparision group data', async () => {
        const { component, getByTestId, fixture } = await setup();

        component.data = {
          sickness: {
            workplaceValue: { value: 11, hasValue: true },
            comparisonGroup: { value: 12, hasValue: true },
            goodCqc: { value: 15, hasValue: true },
          },
          qualifications: {
            workplaceValue: { value: 0.521, hasValue: true },
            comparisonGroup: { value: 0.533, hasValue: true },
            goodCqc: { value: 0.545, hasValue: true },
          },
          turnoverRate: {
            workplaceValue: { value: 0.281, hasValue: true },
            comparisonGroup: { value: 0, hasValue: false, stateMessage: 'no-data' },
            goodCqc: { value: 0, hasValue: false, stateMessage: 'no-data' },
          },
          vacancyRate: {
            workplaceValue: { value: 0.068, hasValue: true },
            comparisonGroup: { value: 0, hasValue: false, stateMessage: 'no-data' },
            goodCqc: { value: 0, hasValue: false, stateMessage: 'no-data' },
          },
          careWorkerPay: {
            workplaceValue: { value: 1015, hasValue: true },
            comparisonGroup: { value: 1013, hasValue: true },
            goodCqc: { value: 1026, hasValue: true },
          },
          seniorCareWorkerPay: {
            workplaceValue: { value: 1091, hasValue: true },
            comparisonGroup: { value: 1091, hasValue: true },
            goodCqc: { value: 1093, hasValue: true },
          },
          registeredNursePay: {
            workplaceValue: { value: 37250, hasValue: true },
            comparisonGroup: { value: 37200, hasValue: true },
            goodCqc: { value: 37350, hasValue: true },
          },
          registeredManagerPay: {
            workplaceValue: { value: 36075, hasValue: true },
            comparisonGroup: { value: 36110, hasValue: true },
            goodCqc: { value: 36200, hasValue: true },
          },
          timeInRole: {
            workplaceValue: { value: 0.883, hasValue: true },
            comparisonGroup: { value: 0, hasValue: false, stateMessage: 'no-data' },
            goodCqc: { value: 0, hasValue: false, stateMessage: 'no-data' },
          },
          meta: {
            workplaces: 35,
            staff: 460,
            workplacesGoodCqc: 22,
            staffGoodCqc: 315,
            localAuthority: 'LA1',
            lastUpdated: new Date(),
          },
        };

        component.ngOnChanges();
        fixture.detectChanges();

        const vacancyRow = getByTestId('vacancyRow');
        const turnoverRow = getByTestId('turnoverRow');
        const timeInRoleRow = getByTestId('timeInRoleRow');

        expect(within(vacancyRow).getByText('7%')).toBeTruthy();
        expect(within(vacancyRow).getByText('Not enough data')).toBeTruthy();
        expect(within(turnoverRow).getByText('28%')).toBeTruthy();
        expect(within(turnoverRow).getByText('Not enough data')).toBeTruthy();
        expect(within(timeInRoleRow).getByText('88%')).toBeTruthy();
        expect(within(timeInRoleRow).getByText('Not enough data')).toBeTruthy();
      });
    });

    describe('rankings area', async () => {
      it('should show when viewBenchmarksPosition is false', async () => {
        const { component, fixture, getByTestId, queryByTestId } = await setup();

        component.viewBenchmarksPosition = false;
        fixture.detectChanges();

        expect(getByTestId('rankings')).toBeTruthy();
        expect(queryByTestId('barcharts')).toBeFalsy();
      });

      describe('comparison group rankings', async () => {
        it('should set group rankings when there is group data and group toggle is false', async () => {
          const { component, fixture } = await setup();

          component.viewBenchmarksPosition = false;
          component.viewBenchmarksComparisonGroups = false;

          component.ngOnChanges();
          fixture.detectChanges();

          expect(component.vacancyMaxRank).toEqual(component.rankingsData.vacancy.groupRankings.maxRank);
          expect(component.turnoverMaxRank).toEqual(component.rankingsData.turnover.groupRankings.maxRank);
          expect(component.timeInRoleMaxRank).toEqual(component.rankingsData.timeInRole.groupRankings.maxRank);

          expect(component.vacancyCurrentRank).toEqual(component.rankingsData.vacancy.groupRankings.currentRank);
          expect(component.turnoverCurrentRank).toEqual(component.rankingsData.turnover.groupRankings.currentRank);
          expect(component.timeInRoleCurrentRank).toEqual(component.rankingsData.timeInRole.groupRankings.currentRank);
        });

        it('should set good cqc rankings when there is group data and group toggle is true', async () => {
          const { component, fixture } = await setup();

          component.viewBenchmarksPosition = false;
          component.viewBenchmarksComparisonGroups = true;
          component.ngOnChanges();
          fixture.detectChanges();

          expect(component.vacancyMaxRank).toEqual(component.rankingsData.vacancy.goodCqcRankings.maxRank);
          expect(component.turnoverMaxRank).toEqual(component.rankingsData.turnover.goodCqcRankings.maxRank);
          expect(component.timeInRoleMaxRank).toEqual(component.rankingsData.timeInRole.goodCqcRankings.maxRank);

          expect(component.vacancyCurrentRank).toEqual(component.rankingsData.vacancy.goodCqcRankings.currentRank);
          expect(component.turnoverCurrentRank).toEqual(component.rankingsData.turnover.goodCqcRankings.currentRank);
          expect(component.timeInRoleCurrentRank).toEqual(
            component.rankingsData.timeInRole.goodCqcRankings.currentRank,
          );
        });
      });
    });

    it('should show the barcharts area when viewBenchmarksPosition is true', async () => {
      const { component, fixture, getByTestId, queryByTestId } = await setup();

      component.viewBenchmarksPosition = true;
      component.ngOnChanges();
      fixture.detectChanges();

      expect(getByTestId('barcharts')).toBeTruthy();
      expect(queryByTestId('rankings')).toBeFalsy();
    });

    it('should toggle between rankings and benchmarks when the rank and positioned links are clicked', async () => {
      const { component, fixture, getByText, getByTestId } = await setup();

      component.viewBenchmarksPosition = true;
      fixture.detectChanges();

      fireEvent.click(getByText('Where you rank'));
      fixture.detectChanges();

      expect(component.viewBenchmarksPosition).toEqual(false);
      expect(getByTestId('rankings')).toBeTruthy();

      fireEvent.click(getByText(`Where you're positioned`));
      fixture.detectChanges();

      expect(component.viewBenchmarksPosition).toEqual(true);
      expect(getByTestId('barcharts')).toBeTruthy();
    });
  });
});
