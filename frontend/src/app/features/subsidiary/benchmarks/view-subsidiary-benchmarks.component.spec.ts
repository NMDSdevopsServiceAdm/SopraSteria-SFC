import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ViewSubsidiaryBenchmarksComponent } from './view-subsidiary-benchmarks.component';

describe('ViewSubsidiaryBenchmarksComponent', () => {
  const setup = async (overrides: any = {}) => {
    const setupTools = await render(ViewSubsidiaryBenchmarksComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { establishment: { ...(establishmentBuilder() as Establishment), ...overrides.establishment } },
            },
          },
        },
      provideHttpClient(), provideHttpClientTesting(),],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Displaying correct version of tab', () => {
    [1, 2, 8].forEach((reportingID) => {
      it(`should render the new data area tab component when reporting ID is ${reportingID}`, async () => {
        const { queryByTestId } = await setup({
          establishment: { mainService: { id: 24, name: 'Care home services with nursing', reportingID } },
        });

        expect(queryByTestId('data-area-tab')).toBeTruthy();
      });
    });

    it('should render the old benchmarks tab when other reporting ID', async () => {
      const { queryByTestId } = await setup({
        establishment: { mainService: { id: 11, name: 'Domestic services and home help', reportingID: 10 } },
      });

      expect(queryByTestId('old-benchmarks-tab')).toBeTruthy();
    });
  });
});