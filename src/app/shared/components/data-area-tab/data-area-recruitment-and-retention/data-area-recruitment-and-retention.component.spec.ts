import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { benchmarksData } from '@core/test-utils/MockBenchmarkService';
import {
  BenchmarksSelectViewPanelComponent,
} from '@shared/components/benchmarks-select-view-panel/benchmarks-select-view-panel.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { DataAreaRecruitmentAndRetentionComponent } from './data-area-recruiment-and-retention.component';

describe('DataAreaRecruitmentAndRetentionComponent', () => {
  const setup = async (viewBenchmarksComparisonGroups = false) => {
    const { fixture, getByText, getByTestId, queryByTestId } = await render(DataAreaRecruitmentAndRetentionComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [],
      declarations: [BenchmarksSelectViewPanelComponent],
      schemas: [NO_ERRORS_SCHEMA],
      componentProperties: {
        data: benchmarksData,
        viewBenchmarksComparisonGroups,
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

  it('should render values for the workplace and comparison data', async () => {
    const { component, getByTestId } = await setup();

    console.log(component.data.turnoverRate);
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
    const { component, getByTestId } = await setup(true);

    console.log(component.data.turnoverRate);
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
