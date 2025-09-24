import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminUsersService } from '@core/services/admin/admin-users/admin-users.service';
import { AdminModule } from '@features/admin/admin.module';

import { GetAdminUserResolver } from './get-admin-user.resolver';
import { provideHttpClient } from '@angular/common/http';

describe('GetAdminUserResolver', () => {
  let resolver: GetAdminUserResolver;
  let route: ActivatedRoute;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminModule, RouterTestingModule.withRoutes([])],
      providers: [
        GetAdminUserResolver,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ useruid: 'mock-useruid' }) } },
        },

        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    resolver = TestBed.inject(GetAdminUserResolver);
    route = TestBed.inject(ActivatedRoute);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should call getAdminUser', () => {
    const adminUsersService = TestBed.inject(AdminUsersService);
    spyOn(adminUsersService, 'getAdminUser').and.callThrough();

    resolver.resolve(route.snapshot);

    expect(adminUsersService.getAdminUser).toHaveBeenCalledWith('mock-useruid');
  });
});
