import { HttpClient } from '@angular/common/http';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
import { BenchmarksV2Service } from '@core/services/benchmarks-v2.service';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

export function BenchmarksServiceFactory(
  featureFlagService: FeatureFlagsService,
  httpClient: HttpClient,
): BenchmarksServiceBase {
  console.log('*********************');
  if (featureFlagService.newBenchmarksDataArea) {
    console.log('V2');
    return new BenchmarksV2Service(httpClient);
  } else {
    console.log('V1');
    return new BenchmarksService(httpClient);
  }
}
