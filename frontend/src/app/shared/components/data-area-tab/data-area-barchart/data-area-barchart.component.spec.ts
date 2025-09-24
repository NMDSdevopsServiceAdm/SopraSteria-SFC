import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter, RouterModule } from '@angular/router';
import { BenchmarksV2Service } from '@core/services/benchmarks-v2.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { DataAreaBarchartComponent } from './data-area-barchart.component';

describe('DataAreaBarchartComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getByTestId, queryByTestId, queryByText } = await render(DataAreaBarchartComponent, {
      imports: [SharedModule, RouterModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: BenchmarksV2Service,
          useClass: MockBenchmarksService,
        },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
      componentProperties: {
        isPay: false,
        type: '',
        section: '',
        rankingsData: {
          maxRank: 14,
          currentRank: 7,
          hasValue: true,
          stateMessage: null,
          allValues: [],
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
      queryByText,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('The default message when all data is provided', () => {
    it('should show pay message if isPay is true', async () => {
      const { component, queryByTestId } = await setup();

      component.isPay = true;

      expect(queryByTestId('all-pay-data')).toBeTruthy();
      expect(queryByTestId('all-recruitment-data')).toBeFalsy();
    });

    it('should show retention message if isPay is false', async () => {
      const { component, queryByTestId, fixture } = await setup();

      component.isPay = false;
      fixture.detectChanges();

      expect(queryByTestId('all-recruitment-data')).toBeTruthy();
      expect(queryByTestId('all-pay-data')).toBeFalsy();
    });
  });

  it('should show the no comparison group message when no comparsion group data is provided', async () => {
    const { component, queryByTestId, fixture } = await setup();
    component.rankingsData = {
      stateMessage: 'no-comparison-data',
      hasValue: false,
      allValues: [{ value: 1, currentEst: true }],
    };

    component.ngOnChanges();
    expect(queryByTestId('no-comparison-data')).toBeTruthy();
  });

  describe('no workplace data message', () => {
    it('should show when no pay workplace data is provided', async () => {
      const { component, queryByTestId, fixture } = await setup();
      component.rankingsData = {
        stateMessage: 'no-pay-data',
        hasValue: false,
        allValues: [{ value: 34, currentEst: false }],
      };
      component.isPay = true;

      fixture.detectChanges();
      expect(queryByTestId('no-workplace-pay-data')).toBeTruthy();
    });

    it('should show when no vacancy workplace data is provided', async () => {
      const { component, queryByTestId, fixture } = await setup();
      component.rankingsData = {
        stateMessage: 'no-vacancies',
        hasValue: false,
        allValues: [{ value: 34, currentEst: false }],
      };
      component.isPay = false;
      component.type = 'vacancy';

      fixture.detectChanges();
      expect(queryByTestId('no-workplace-vacancy-data')).toBeTruthy();
    });

    it('should show when no turnover workplace data is provided', async () => {
      const { component, queryByTestId, fixture } = await setup();
      component.rankingsData = {
        stateMessage: 'no-leavers',
        hasValue: false,
        allValues: [{ value: 34, currentEst: false }],
      };
      component.isPay = false;
      component.type = 'turnover';

      fixture.detectChanges();
      expect(queryByTestId('no-workplace-turnover-or-percent-data')).toBeTruthy();
    });

    it('should show the when no time in role workplace data is provided', async () => {
      const { component, queryByTestId, fixture } = await setup();
      component.rankingsData = {
        stateMessage: 'not-enough-data',
        hasValue: false,
        allValues: [{ value: 34, currentEst: false }],
      };
      component.isPay = false;
      component.type = 'timeInRole';

      fixture.detectChanges();

      expect(queryByTestId('no-workplace-turnover-or-percent-data')).toBeTruthy();
    });
  });

  it('should show the correct summary for time in role', async () => {
    const { component } = await setup();

    component.isPay = false;
    component.type = 'timeInRole';
    component.section = 'percentage of staff still in their main job role after 12 months';

    component.ngOnChanges();

    expect(component.sectionInSummary).toEqual('percentage still in their main job role');
  });

  it('should show the correct summary for vacancy', async () => {
    const { component } = await setup();

    component.isPay = false;
    component.type = 'vacancy';
    component.section = 'vacancy rate';

    component.ngOnChanges();

    expect(component.sectionInSummary).toEqual('vacancy rate');
  });

  it('should show the no comparison and workplace data message when no comparison or workplace data is provided', async () => {
    const { component, queryByTestId, fixture } = await setup();
    component.rankingsData = {
      stateMessage: 'no-comparison-data',
      maxRank: undefined,
      hasValue: false,
      allValues: [],
    };
    component.noWorkplaceData = true;

    fixture.detectChanges();
    component.ngOnChanges();

    expect(queryByTestId('no-workplace-or-comparison-data')).toBeTruthy();
  });
});
