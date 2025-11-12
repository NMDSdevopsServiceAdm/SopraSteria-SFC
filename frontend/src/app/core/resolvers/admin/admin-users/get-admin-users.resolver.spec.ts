import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AdminUsersService } from '@core/services/admin/admin-users/admin-users.service';
import { AdminModule } from '@features/admin/admin.module';

import { GetAdminUsersResolver } from './get-admin-users.resolver';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, RouterModule } from '@angular/router';

describe('GetAdminUsersResolver', () => {
  let resolver: GetAdminUsersResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminModule, RouterModule],
      providers: [GetAdminUsersResolver, provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    resolver = TestBed.inject(GetAdminUsersResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should call getAdminUsers', () => {
    const adminUsersService = TestBed.inject(AdminUsersService);
    spyOn(adminUsersService, 'getAdminUsers').and.callThrough();

    resolver.resolve();
    expect(adminUsersService.getAdminUsers).toHaveBeenCalled();
  });
});
