import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BenchmarksV2Service } from '@core/services/benchmarks-v2.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';

import { RankingsResolver } from './rankings.resolver';
import { provideHttpClient } from '@angular/common/http';

describe('RankingsResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        RankingsResolver,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },

        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const resolver = TestBed.inject(RankingsResolver);
    const route = TestBed.inject(ActivatedRoute);

    const benchmarksService = TestBed.inject(BenchmarksV2Service);
    const benchmarksSpy = spyOn(benchmarksService, 'getAllRankingData').and.callThrough();

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

  it('should call the getAllRankingData function with the workplace uid', async () => {
    const { resolver, route, benchmarksSpy } = await setup();

    resolver.resolve(route.snapshot);

    const establishmentId = MockEstablishmentService.prototype.establishmentId;
    expect(benchmarksSpy).toHaveBeenCalledWith(establishmentId);
  });
});
