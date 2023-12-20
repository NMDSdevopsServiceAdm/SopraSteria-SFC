import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LocalAuthoritiesReturnService } from '@core/services/admin/local-authorities-return/local-authorities-return.service';
import { AdminModule } from '@features/admin/admin.module';

import { GetLaResolver } from './get-la.resolver';

describe('GetLaResolver', () => {
  let resolver: GetLaResolver;
  let route: ActivatedRoute;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminModule, HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ uid: 'someuid' }) } },
        },
        GetLaResolver,
      ],
    });
    resolver = TestBed.inject(GetLaResolver);
    route = TestBed.inject(ActivatedRoute);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should resolve', () => {
    const localAuthoritiesReturnService = TestBed.inject(LocalAuthoritiesReturnService);
    spyOn(localAuthoritiesReturnService, 'getLA').and.callThrough();

    resolver.resolve(route.snapshot);

    expect(localAuthoritiesReturnService.getLA).toHaveBeenCalled();
  });
});
