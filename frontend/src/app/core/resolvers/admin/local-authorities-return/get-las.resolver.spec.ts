import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LocalAuthoritiesReturnService } from '@core/services/admin/local-authorities-return/local-authorities-return.service';
import { AdminModule } from '@features/admin/admin.module';

import { GetLasResolver } from './get-las.resolver';
import { provideHttpClient } from '@angular/common/http';

describe('GetLasResolver', () => {
  let resolver: GetLasResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminModule, RouterTestingModule.withRoutes([])],
      providers: [GetLasResolver, provideHttpClient(), provideHttpClientTesting()],
    });
    resolver = TestBed.inject(GetLasResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should resolve', () => {
    const localAuthoritiesReturnService = TestBed.inject(LocalAuthoritiesReturnService);
    spyOn(localAuthoritiesReturnService, 'getLAs').and.callThrough();

    resolver.resolve();

    expect(localAuthoritiesReturnService.getLAs).toHaveBeenCalled();
  });
});
