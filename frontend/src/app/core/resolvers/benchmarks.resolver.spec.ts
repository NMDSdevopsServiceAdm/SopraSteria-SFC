import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';

import { BenchmarksResolver } from './benchmarks.resolver';

xdescribe('BenchmarksResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        BenchmarksResolver,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
    });

    const resolver = TestBed.inject(BenchmarksResolver);
    const route = TestBed.inject(ActivatedRoute);

    const benchmarksService = TestBed.inject(BenchmarksService);
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
