import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, RouterModule } from '@angular/router';
import { BenchmarksV2Service } from '@core/services/benchmarks-v2.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';

import { BenchmarksResolver } from './benchmarks.resolver';
import { provideHttpClient } from '@angular/common/http';

describe('BenchmarksResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [RouterModule],
      providers: [
        BenchmarksResolver,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },

        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    const resolver = TestBed.inject(BenchmarksResolver);
    const route = TestBed.inject(ActivatedRoute);

    const benchmarksService = TestBed.inject(BenchmarksV2Service);
    const benchmarksSpy = spyOn(benchmarksService, 'getTileData').and.callThrough();

    return {
      resolver,
      route,
      benchmarksSpy,
    };
  }

  it('should create', () => {
    const { resolver } = setup();
    expect(resolver).toBeTruthy();
  });

  it('should call the getTileData function with the workplace uid and params', async () => {
    const { resolver, route, benchmarksSpy } = await setup();

    resolver.resolve(route.snapshot);

    const establishmentId = MockEstablishmentService.prototype.establishmentId;
    expect(benchmarksSpy).toHaveBeenCalledWith(establishmentId, ['sickness', 'turnover', 'pay', 'qualifications']);
  });
});
