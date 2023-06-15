import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Tile } from '@core/model/benchmarks.model';
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
        data: {
          groupRankings: {
            maxRank: 14,
            currentRank: 7,
            hasValue: true,
            allValues: [],
          },
          goodCqcRankings: {
            hasValue: false,
            stateMessage: 'no-comparison-data',
          },
        } as Tile,
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
