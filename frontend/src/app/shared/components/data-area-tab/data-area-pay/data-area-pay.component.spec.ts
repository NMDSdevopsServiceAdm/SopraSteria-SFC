import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FormatUtil } from '@core/utils/format-util';
import { BenchmarksSelectViewPanelComponent } from '@shared/components/benchmarks-select-view-panel/benchmarks-select-view-panel.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, getByTestId, render } from '@testing-library/angular';
import { allRankingsData, benchmarksData } from '@core/test-utils/MockBenchmarkService';

import { DataAreaPayComponent } from './data-area-pay.component';

describe('DataAreaPayComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getByTestId, queryByTestId } = await render(DataAreaPayComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, ReactiveFormsModule],
      providers: [provideHttpClient(), provideHttpClientTesting(),],
      declarations: [BenchmarksSelectViewPanelComponent],
      schemas: [NO_ERRORS_SCHEMA],
      componentProperties: {
        rankingsData: allRankingsData,
        data: benchmarksData,
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

  it('should show the rankings area when viewBenchmarksPosition is false', async () => {
    const { component, fixture, getByTestId, queryByTestId } = await setup();

    component.viewBenchmarksPosition = false;
    fixture.detectChanges();

    expect(getByTestId('rankings')).toBeTruthy();
    expect(queryByTestId('barcharts')).toBeFalsy();
  });

  it('should show the barcharts area when viewBenchmarksPosition is true', async () => {
    const { component, fixture, getByTestId, queryByTestId } = await setup();

    component.viewBenchmarksPosition = true;
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

  it('should show registered nurse salary in comparison group table', async () => {
    const { component, fixture, getByTestId } = await setup();

    component.showRegisteredNurseSalary = true;
    fixture.detectChanges();

    expect(getByTestId('register-nurse-comparison')).toBeTruthy();
  });

  it('should not show registered nurse salary in comparison group table', async () => {
    const { component, fixture, queryByTestId } = await setup();

    component.showRegisteredNurseSalary = false;
    fixture.detectChanges();

    expect(queryByTestId('register-nurse-comparison')).toBeFalsy();
  });

  describe('pay data', async () => {
    it('should set all pay data when there is workplace pay data', async () => {
      const { component, fixture, queryByTestId } = await setup();

      const payDataForWorkplace = {
        meta: {
          workplaces: 0,
          staff: 0,
          localAuthority: 'Oxfordshire',
        },
        careWorkerPay: {
          workplaceValue: {
            value: 889,
            hasValue: true,
          },
          comparisonGroup: {
            value: 900,
            hasValue: true,
          },
          goodCqc: {
            value: 1000,
            hasValue: true,
          },
        },
        seniorCareWorkerPay: {
          workplaceValue: {
            value: 979,
            hasValue: true,
          },
          comparisonGroup: {
            value: 780,
            hasValue: true,
          },
          goodCqc: {
            value: 800,
            hasValue: true,
          },
        },
        registeredNursePay: {
          workplaceValue: {
            value: 26000,
            hasValue: true,
          },
          comparisonGroup: {
            value: 27500,
            hasValue: true,
          },
          goodCqc: {
            value: 30000,
            hasValue: true,
          },
        },
        registeredManagerPay: {
          workplaceValue: {
            value: 30000,
            hasValue: true,
          },
          comparisonGroup: {
            value: 29000,
            hasValue: true,
          },
          goodCqc: {
            value: 30000,
            hasValue: true,
          },
        },
      };

      component.data = payDataForWorkplace;
      component.ngOnChanges();

      expect(component.careWorkerPay).toEqual(
        FormatUtil.formatMoney(payDataForWorkplace.careWorkerPay.workplaceValue.value) + ' (hourly)',
      );
      expect(component.seniorCareWorkerPay).toEqual(
        FormatUtil.formatMoney(payDataForWorkplace.seniorCareWorkerPay.workplaceValue.value) + ' (hourly)',
      );
      expect(component.registeredNurseSalary).toEqual(
        FormatUtil.formatSalary(payDataForWorkplace.registeredNursePay.workplaceValue.value) + ' (annually)',
      );
      expect(component.registeredManagerSalary).toEqual(
        FormatUtil.formatSalary(payDataForWorkplace.registeredManagerPay.workplaceValue.value) + ' (annually)',
      );
    });

    it('should set "no data added" when there is no workplace pay data', async () => {
      const { component, fixture, queryByTestId } = await setup();

      const payDataWithoutWorkplaceData = {
        meta: {
          workplaces: 0,
          staff: 0,
          localAuthority: 'Oxfordshire',
        },
        careWorkerPay: {
          workplaceValue: {
            value: 0,
            hasValue: false,
          },
          comparisonGroup: {
            value: 900,
            hasValue: true,
          },
          goodCqc: {
            value: 1000,
            hasValue: true,
          },
        },
        seniorCareWorkerPay: {
          workplaceValue: {
            value: 0,
            hasValue: false,
          },
          comparisonGroup: {
            value: 780,
            hasValue: true,
          },
          goodCqc: {
            value: 800,
            hasValue: true,
          },
        },
        registeredNursePay: {
          workplaceValue: {
            value: 0,
            hasValue: false,
          },
          comparisonGroup: {
            value: 27500,
            hasValue: true,
          },
          goodCqc: {
            value: 30000,
            hasValue: true,
          },
        },
        registeredManagerPay: {
          workplaceValue: {
            value: 0,
            hasValue: false,
          },
          comparisonGroup: {
            value: 29000,
            hasValue: true,
          },
          goodCqc: {
            value: 30000,
            hasValue: true,
          },
        },
      };

      component.data = payDataWithoutWorkplaceData;
      component.ngOnChanges();

      expect(component.careWorkerPay).toEqual('No data added');
      expect(component.seniorCareWorkerPay).toEqual('No data added');
      expect(component.registeredNurseSalary).toEqual('No data added');
      expect(component.registeredManagerSalary).toEqual('No data added');
    });

    it('should set the rankings data when all rankings data is provided', async () => {
      const { component } = await setup();

      component.showRegisteredNurseSalary = true;
      component.viewBenchmarksComparisonGroups = false;
      component.ngOnChanges();

      expect(component.rankings.careWorkerPay).toEqual({
        title: 'Care worker pay',
        workplacesRankNumber: allRankingsData.pay.careWorkerPay.groupRankings.currentRank,
        totalWorkplaces: allRankingsData.pay.careWorkerPay.groupRankings.maxRank,
        noWorkplaceData: false,
      });
      expect(component.rankings.seniorCareWorkerPay).toEqual({
        title: 'Senior care worker pay',
        workplacesRankNumber: allRankingsData.pay.seniorCareWorkerPay.groupRankings.currentRank,
        totalWorkplaces: allRankingsData.pay.seniorCareWorkerPay.groupRankings.maxRank,
        noWorkplaceData: false,
      });
      expect(component.rankings.registeredNursePay).toEqual({
        title: 'Registered nurse salary',
        workplacesRankNumber: allRankingsData.pay.registeredNursePay.groupRankings.currentRank,
        totalWorkplaces: allRankingsData.pay.registeredNursePay.groupRankings.maxRank,
        noWorkplaceData: false,
      });
      expect(component.rankings.registeredManagerPay).toEqual({
        title: 'Registered manager salary',
        workplacesRankNumber: allRankingsData.pay.registeredManagerPay.groupRankings.currentRank,
        totalWorkplaces: allRankingsData.pay.registeredManagerPay.groupRankings.maxRank,
        noWorkplaceData: false,
      });

      component.viewBenchmarksComparisonGroups = true;
      component.ngOnChanges();

      expect(component.rankings.careWorkerPay).toEqual({
        title: 'Care worker pay',
        workplacesRankNumber: allRankingsData.pay.careWorkerPay.goodCqcRankings.currentRank,
        totalWorkplaces: allRankingsData.pay.careWorkerPay.goodCqcRankings.maxRank,
        noWorkplaceData: false,
      });
      expect(component.rankings.seniorCareWorkerPay).toEqual({
        title: 'Senior care worker pay',
        workplacesRankNumber: allRankingsData.pay.seniorCareWorkerPay.goodCqcRankings.currentRank,
        totalWorkplaces: allRankingsData.pay.seniorCareWorkerPay.goodCqcRankings.maxRank,
        noWorkplaceData: false,
      });
      expect(component.rankings.registeredNursePay).toEqual({
        title: 'Registered nurse salary',
        workplacesRankNumber: allRankingsData.pay.registeredNursePay.goodCqcRankings.currentRank,
        totalWorkplaces: allRankingsData.pay.registeredNursePay.goodCqcRankings.maxRank,
        noWorkplaceData: false,
      });
      expect(component.rankings.registeredManagerPay).toEqual({
        title: 'Registered manager salary',
        workplacesRankNumber: allRankingsData.pay.registeredManagerPay.goodCqcRankings.currentRank,
        totalWorkplaces: allRankingsData.pay.registeredManagerPay.goodCqcRankings.maxRank,
        noWorkplaceData: false,
      });
    });

    it('should set rank number on rankings object to undefined if no data provided', async () => {
      const { component } = await setup();

      const rankings = {
        pay: {
          careWorkerPay: {
            groupRankings: {
              maxRank: 3,
              hasValue: false,
              stateMessage: 'no-pay-data',
            },
            goodCqcRankings: {
              hasValue: false,
              stateMessage: 'no-comparison-data',
            },
          },
          seniorCareWorkerPay: {
            groupRankings: {
              maxRank: 3,
              hasValue: false,
              stateMessage: 'no-pay-data',
            },
            goodCqcRankings: {
              hasValue: false,
              stateMessage: 'no-comparison-data',
            },
          },
          registeredNursePay: {
            groupRankings: {
              maxRank: 9,
              hasValue: false,
              stateMessage: 'no-pay-data',
            },
            goodCqcRankings: {
              maxRank: 3,
              hasValue: false,
              stateMessage: 'no-pay-data',
            },
          },
          registeredManagerPay: {
            groupRankings: {
              hasValue: false,
              stateMessage: 'no-comparison-data',
            },
            goodCqcRankings: {
              hasValue: false,
              stateMessage: 'no-comparison-data',
            },
          },
        },
        turnover: {
          groupRankings: {
            maxRank: 54,
            currentRank: 32,
            hasValue: true,
            allValues: [],
          },
          goodCqcRankings: {
            maxRank: 3,
            currentRank: 2,
            hasValue: true,
            allValues: [
              {
                value: -1,
                currentEst: false,
              },
              {
                value: 0.3333333333333333,
                currentEst: true,
              },
              {
                value: 5,
                currentEst: false,
              },
            ],
          },
        },
        turnoverRate: {
          groupRankings: {
            maxRank: 54,
            currentRank: 32,
            hasValue: true,
            allValues: [],
          },
          goodCqcRankings: {
            maxRank: 3,
            currentRank: 2,
            hasValue: true,
            allValues: [
              {
                value: -1,
                currentEst: false,
              },
              {
                value: 0.3333333333333333,
                currentEst: true,
              },
              {
                value: 5,
                currentEst: false,
              },
            ],
          },
        },
        sickness: {
          groupRankings: {
            maxRank: 42,
            currentRank: 11,
            hasValue: true,
            allValues: [],
          },
          goodCqcRankings: {
            maxRank: 3,
            currentRank: 3,
            hasValue: true,
            allValues: [],
          },
        },
        qualifications: {
          groupRankings: {
            maxRank: 41,
            currentRank: 1,
            hasValue: true,
            allValues: [],
          },
          goodCqcRankings: {
            hasValue: false,
            stateMessage: 'no-comparison-data',
          },
        },
        vacancy: {
          groupRankings: {
            maxRank: 88,
            currentRank: 21,
            hasValue: true,
            allValues: [],
          },
          goodCqcRankings: {
            maxRank: 3,
            currentRank: 1,
            hasValue: true,
            allValues: [],
          },
        },
        timeInRole: {
          groupRankings: {
            maxRank: 47,
            currentRank: 1,
            hasValue: true,
            allValues: [],
          },
          goodCqcRankings: {
            maxRank: 3,
            currentRank: 1,
            hasValue: true,
            allValues: [],
          },
        },
      };
      component.showRegisteredNurseSalary = true;
      component.rankingsData = rankings;
      component.ngOnChanges();

      expect(component.rankings.careWorkerPay.workplacesRankNumber).toBeUndefined();
      expect(component.rankings.seniorCareWorkerPay.workplacesRankNumber).toBeUndefined();
      expect(component.rankings.registeredNursePay.workplacesRankNumber).toBeUndefined();
      expect(component.rankings.registeredManagerPay.workplacesRankNumber).toBeUndefined();
    });

    describe('comparison group data', async () => {
      it('should be set when there is group data and the group select toggle is not set', async () => {
        const { component, fixture, queryByTestId } = await setup();
        const payDataForWorkplaceWithComparisonGroups = {
          meta: {
            workplaces: 0,
            staff: 0,
            localAuthority: 'Oxfordshire',
          },
          careWorkerPay: {
            workplaceValue: {
              value: 0,
              hasValue: false,
            },
            comparisonGroup: {
              value: 900,
              hasValue: true,
            },
            goodCqc: {
              value: 1000,
              hasValue: true,
            },
          },
          seniorCareWorkerPay: {
            workplaceValue: {
              value: 0,
              hasValue: false,
            },
            comparisonGroup: {
              value: 780,
              hasValue: true,
            },
            goodCqc: {
              value: 800,
              hasValue: true,
            },
          },
          registeredNursePay: {
            workplaceValue: {
              value: 0,
              hasValue: false,
            },
            comparisonGroup: {
              value: 27500,
              hasValue: true,
            },
            goodCqc: {
              value: 30000,
              hasValue: true,
            },
          },
          registeredManagerPay: {
            workplaceValue: {
              value: 0,
              hasValue: false,
            },
            comparisonGroup: {
              value: 29000,
              hasValue: true,
            },
            goodCqc: {
              value: 30000,
              hasValue: true,
            },
          },
        };
        component.viewBenchmarksComparisonGroups = false;
        component.data = payDataForWorkplaceWithComparisonGroups;
        component.ngOnChanges();

        expect(component.comparisonGroupCareWorkerPay).toEqual(
          FormatUtil.formatMoney(payDataForWorkplaceWithComparisonGroups.careWorkerPay.comparisonGroup.value) +
            ' (hourly)',
        );
        expect(component.comparisonGroupSeniorCareWorkerPay).toEqual(
          FormatUtil.formatMoney(payDataForWorkplaceWithComparisonGroups.seniorCareWorkerPay.comparisonGroup.value) +
            ' (hourly)',
        );
        expect(component.comparisonGroupRegisteredNurseSalary).toEqual(
          FormatUtil.formatSalary(payDataForWorkplaceWithComparisonGroups.registeredNursePay.comparisonGroup.value) +
            ' (annually)',
        );
        expect(component.comparisonGroupRegisteredManagerSalary).toEqual(
          FormatUtil.formatSalary(payDataForWorkplaceWithComparisonGroups.registeredManagerPay.comparisonGroup.value) +
            ' (annually)',
        );
      });

      it('should be set with good and outstanding when there is group data and the group select toggle is set', async () => {
        const { component, fixture, queryByTestId } = await setup();
        const payDataForWorkplaceWithComparisonGroups = {
          meta: {
            workplaces: 0,
            staff: 0,
            localAuthority: 'Oxfordshire',
          },
          careWorkerPay: {
            workplaceValue: {
              value: 0,
              hasValue: false,
            },
            comparisonGroup: {
              value: 900,
              hasValue: true,
            },
            goodCqc: {
              value: 1000,
              hasValue: true,
            },
          },
          seniorCareWorkerPay: {
            workplaceValue: {
              value: 0,
              hasValue: false,
            },
            comparisonGroup: {
              value: 780,
              hasValue: true,
            },
            goodCqc: {
              value: 800,
              hasValue: true,
            },
          },
          registeredNursePay: {
            workplaceValue: {
              value: 0,
              hasValue: false,
            },
            comparisonGroup: {
              value: 27500,
              hasValue: true,
            },
            goodCqc: {
              value: 30000,
              hasValue: true,
            },
          },
          registeredManagerPay: {
            workplaceValue: {
              value: 0,
              hasValue: false,
            },
            comparisonGroup: {
              value: 29000,
              hasValue: true,
            },
            goodCqc: {
              value: 30000,
              hasValue: true,
            },
          },
        };
        component.viewBenchmarksComparisonGroups = true;
        component.data = payDataForWorkplaceWithComparisonGroups;
        component.ngOnChanges();

        expect(component.comparisonGroupCareWorkerPay).toEqual(
          FormatUtil.formatMoney(payDataForWorkplaceWithComparisonGroups.careWorkerPay.goodCqc.value) + ' (hourly)',
        );
        expect(component.comparisonGroupSeniorCareWorkerPay).toEqual(
          FormatUtil.formatMoney(payDataForWorkplaceWithComparisonGroups.seniorCareWorkerPay.goodCqc.value) +
            ' (hourly)',
        );
        expect(component.comparisonGroupRegisteredNurseSalary).toEqual(
          FormatUtil.formatSalary(payDataForWorkplaceWithComparisonGroups.registeredNursePay.goodCqc.value) +
            ' (annually)',
        );
        expect(component.comparisonGroupRegisteredManagerSalary).toEqual(
          FormatUtil.formatSalary(payDataForWorkplaceWithComparisonGroups.registeredManagerPay.goodCqc.value) +
            ' (annually)',
        );
      });

      it('should be set to "Not enough data" when comparison group data is not available', async () => {
        const { component, fixture, queryByTestId } = await setup();
        const payDataWithoutComparisonData = {
          meta: {
            workplaces: 0,
            staff: 0,
            localAuthority: 'Oxfordshire',
          },
          careWorkerPay: {
            workplaceValue: {
              value: 0,
              hasValue: false,
            },
            comparisonGroup: {
              value: 0,
              hasValue: false,
              stateMessage: 'no-data',
            },
            goodCqc: {
              value: 0,
              hasValue: false,
              stateMessage: 'no-data',
            },
          },
          seniorCareWorkerPay: {
            workplaceValue: {
              value: 0,
              hasValue: false,
            },
            comparisonGroup: {
              value: 0,
              hasValue: false,
              stateMessage: 'no-data',
            },
            goodCqc: {
              value: 0,
              hasValue: false,
              stateMessage: 'no-data',
            },
          },
          registeredNursePay: {
            workplaceValue: {
              value: 0,
              hasValue: false,
              stateMessage: 'no-pay-data',
            },
            comparisonGroup: {
              value: 0,
              hasValue: false,
              stateMessage: 'no-data',
            },
            goodCqc: {
              value: 0,
              hasValue: false,
              stateMessage: 'no-data',
            },
          },
          registeredManagerPay: {
            workplaceValue: {
              value: 0,
              hasValue: false,
            },
            comparisonGroup: {
              value: 0,
              hasValue: false,
              stateMessage: 'no-data',
            },
            goodCqc: {
              value: 0,
              hasValue: false,
              stateMessage: 'no-data',
            },
          },
        };
        component.viewBenchmarksComparisonGroups = true;
        component.data = payDataWithoutComparisonData;
        component.ngOnChanges();

        expect(component.comparisonGroupCareWorkerPay).toEqual('Not enough data');
        expect(component.comparisonGroupSeniorCareWorkerPay).toEqual('Not enough data');
        expect(component.comparisonGroupRegisteredNurseSalary).toEqual('Not enough data');
        expect(component.comparisonGroupRegisteredManagerSalary).toEqual('Not enough data');

        component.viewBenchmarksComparisonGroups = false;
        component.ngOnChanges();
        expect(component.comparisonGroupCareWorkerPay).toEqual('Not enough data');
        expect(component.comparisonGroupSeniorCareWorkerPay).toEqual('Not enough data');
        expect(component.comparisonGroupRegisteredNurseSalary).toEqual('Not enough data');
        expect(component.comparisonGroupRegisteredManagerSalary).toEqual('Not enough data');
      });
    });
  });
});