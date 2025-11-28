import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LocalAuthoritiesReturnService } from '@core/services/admin/local-authorities-return/local-authorities-return.service';
import { AdminModule } from '@features/admin/admin.module';

import { GetLasResolver } from './get-las.resolver';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, RouterModule } from '@angular/router';

describe('GetLasResolver', () => {
  let resolver: GetLasResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminModule, RouterModule],
      providers: [GetLasResolver, provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
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
