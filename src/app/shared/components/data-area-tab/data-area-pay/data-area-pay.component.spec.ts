import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FormatUtil } from '@core/utils/format-util';
import { BenchmarksSelectViewPanelComponent } from '@shared/components/benchmarks-select-view-panel/benchmarks-select-view-panel.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { DataAreaPayComponent } from './data-area-pay.component';

describe('DataAreaPayComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getByTestId, queryByTestId } = await render(DataAreaPayComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [],
      declarations: [BenchmarksSelectViewPanelComponent],
      schemas: [NO_ERRORS_SCHEMA],
      componentProperties: {
        data: {
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
        },
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

  it('should show registered nurse salary in comparision group table', async () => {
    const { component, fixture, getByTestId } = await setup();

    component.showRegisteredNurseSalary = true;
    fixture.detectChanges();

    expect(getByTestId('register-nurse-comparision')).toBeTruthy();
  });

  it('should not show registered nurse salary in comparision group table', async () => {
    const { component, fixture, queryByTestId } = await setup();

    component.showRegisteredNurseSalary = false;
    fixture.detectChanges();

    expect(queryByTestId('register-nurse-comparision')).toBeFalsy();
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

      expect(component.comparisionGroupCareWorkerPay).toEqual(
        FormatUtil.formatMoney(payDataForWorkplaceWithComparisonGroups.careWorkerPay.comparisonGroup.value) +
          ' (hourly)',
      );
      expect(component.comparisionGroupSeniorCareWorkerPay).toEqual(
        FormatUtil.formatMoney(payDataForWorkplaceWithComparisonGroups.seniorCareWorkerPay.comparisonGroup.value) +
          ' (hourly)',
      );
      expect(component.comparisionGroupRegisteredNurseSalary).toEqual(
        FormatUtil.formatSalary(payDataForWorkplaceWithComparisonGroups.registeredNursePay.comparisonGroup.value) +
          ' (annually)',
      );
      expect(component.comparisionGroupRegisteredManagerSalary).toEqual(
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

      expect(component.comparisionGroupCareWorkerPay).toEqual(
        FormatUtil.formatMoney(payDataForWorkplaceWithComparisonGroups.careWorkerPay.goodCqc.value) + ' (hourly)',
      );
      expect(component.comparisionGroupSeniorCareWorkerPay).toEqual(
        FormatUtil.formatMoney(payDataForWorkplaceWithComparisonGroups.seniorCareWorkerPay.goodCqc.value) + ' (hourly)',
      );
      expect(component.comparisionGroupRegisteredNurseSalary).toEqual(
        FormatUtil.formatSalary(payDataForWorkplaceWithComparisonGroups.registeredNursePay.goodCqc.value) +
          ' (annually)',
      );
      expect(component.comparisionGroupRegisteredManagerSalary).toEqual(
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

      expect(component.comparisionGroupCareWorkerPay).toEqual('Not enough data');
      expect(component.comparisionGroupSeniorCareWorkerPay).toEqual('Not enough data');
      expect(component.comparisionGroupRegisteredNurseSalary).toEqual('Not enough data');
      expect(component.comparisionGroupRegisteredManagerSalary).toEqual('Not enough data');

      component.viewBenchmarksComparisonGroups = false;
      component.ngOnChanges();
      expect(component.comparisionGroupCareWorkerPay).toEqual('Not enough data');
      expect(component.comparisionGroupSeniorCareWorkerPay).toEqual('Not enough data');
      expect(component.comparisionGroupRegisteredNurseSalary).toEqual('Not enough data');
      expect(component.comparisionGroupRegisteredManagerSalary).toEqual('Not enough data');
    });
  });
});
