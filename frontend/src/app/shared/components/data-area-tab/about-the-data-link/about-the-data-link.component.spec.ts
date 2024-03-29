import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import { AboutTheDataLinkComponent } from './about-the-data-link.component';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';

describe('AboutTheDataLinkComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getByTestId, queryByTestId, queryByText } = await render(AboutTheDataLinkComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: BenchmarksServiceBase,
          useClass: MockBenchmarksService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
      schemas: [],
      componentProperties: {},
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

  it('should show about the data text', async () => {
    const { getByTestId } = await setup();

    const link = getByTestId('about-the-data-link');

    expect(link).toBeTruthy();
    expect(within(link).getByText('About the data')).toBeTruthy();
  });
});
