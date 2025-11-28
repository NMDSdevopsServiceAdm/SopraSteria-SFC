import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LocalAuthoritiesReturnService } from '@core/services/admin/local-authorities-return/local-authorities-return.service';
import { AdminModule } from '@features/admin/admin.module';

import { GetDatesResolver } from './get-dates.resolver';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, RouterModule } from '@angular/router';

describe('GetDatesResolver', () => {
  let resolver: GetDatesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminModule, RouterModule],
      providers: [GetDatesResolver, provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    resolver = TestBed.inject(GetDatesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should resolve', () => {
    const localAuthoritiesReturnService = TestBed.inject(LocalAuthoritiesReturnService);
    spyOn(localAuthoritiesReturnService, 'getDates').and.callThrough();

    resolver.resolve();

    expect(localAuthoritiesReturnService.getDates).toHaveBeenCalled();
  });
});
