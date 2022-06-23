import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminUsersService } from '@core/services/admin/admin-users/admin-users.service';
import { AdminModule } from '@features/admin/admin.module';

import { GetAdminUsersResolver } from './get-admin-users.resolver';

fdescribe('GetAdminUsersResolver', () => {
  let resolver: GetAdminUsersResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminModule, HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [GetAdminUsersResolver],
    });
    resolver = TestBed.inject(GetAdminUsersResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should call getAdmiunUsers', () => {
    const adminUsersService = TestBed.inject(AdminUsersService);
    spyOn(adminUsersService, 'getAdminUsers').and.callThrough();

    resolver.resolve();
    expect(adminUsersService.getAdminUsers).toHaveBeenCalled();
  });
});
