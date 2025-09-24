import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LocalAuthoritiesReturnService } from '@core/services/admin/local-authorities-return/local-authorities-return.service';
import { AdminModule } from '@features/admin/admin.module';

import { GetDatesResolver } from './get-dates.resolver';
import { provideHttpClient } from '@angular/common/http';

describe('GetDatesResolver', () => {
  let resolver: GetDatesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminModule, RouterTestingModule.withRoutes([])],
      providers: [GetDatesResolver, provideHttpClient(), provideHttpClientTesting()],
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
