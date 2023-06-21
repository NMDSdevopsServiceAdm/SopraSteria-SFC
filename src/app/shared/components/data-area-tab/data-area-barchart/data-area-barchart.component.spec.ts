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
});
