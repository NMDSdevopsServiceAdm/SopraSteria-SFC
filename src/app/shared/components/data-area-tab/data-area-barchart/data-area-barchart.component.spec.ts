import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RankingsResponse } from '@core/model/benchmarks.model';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { DataAreaBarchartComponent } from './data-area-barchart.component';

describe('DataAreaBarchartComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getByTestId, queryByTestId } = await render(DataAreaBarchartComponent, {
      imports: [SharedModule],
      providers: [],
      schemas: [NO_ERRORS_SCHEMA],
      componentProperties: {
        rankingsData: {
          maxRank: 14,
          currentRank: 7,
          hasValue: true,
          allValues: [],
        } as RankingsResponse,
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

  it('should show the default message when all data is provided', async () => {
    const { component, queryByTestId } = await setup();

    expect(queryByTestId('all-data')).toBeTruthy();
  });

  it('should show the no comparison group message when no comparsion group data is provided', async () => {
    const { component, queryByTestId } = await setup();
    (component.rankingsData = {
      stateMessage: 'no-comparison-data',
      hasValue: false,
      allValues: [],
    } as RankingsResponse),
      expect(queryByTestId('no-comparison-data')).toBeTruthy();
  });

  it('should show the no workplace data message when no workplace data is provided', async () => {
    const { component, queryByTestId } = await setup();
    (component.rankingsData = {
      stateMessage: 'no-pay-data',
      hasValue: false,
      allValues: [],
    } as RankingsResponse),
      expect(queryByTestId('no-workplace-data')).toBeTruthy();
  });

  it('should show the no comparison data message when no comparison data is provided', async () => {
    const { component, queryByTestId } = await setup();
    (component.rankingsData = {
      stateMessage: 'no-comparison-data',
      maxRank: undefined,
      hasValue: false,
      allValues: [],
    } as RankingsResponse),
      expect(queryByTestId('no-comparison-data')).toBeTruthy();
  });
});
