import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { JobService } from '@core/services/job.service';

import { JobsResolver } from './jobs.resolver';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, RouterModule } from '@angular/router';

describe('JobsResolver', () => {
  let resolver: JobsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule],
      providers: [JobsResolver, provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    resolver = TestBed.inject(JobsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should resolve', () => {
    const jobService = TestBed.inject(JobService);
    spyOn(jobService, 'getJobs').and.callThrough();

    resolver.resolve();

    expect(jobService.getJobs).toHaveBeenCalled();
  });
});
