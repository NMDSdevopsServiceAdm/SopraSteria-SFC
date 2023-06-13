import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
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
              value: 889,
              hasValue: true,
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
              value: 979,
              hasValue: true,
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
              value: 30000,
              hasValue: true,
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
});
