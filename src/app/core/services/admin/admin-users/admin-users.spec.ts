import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AdminUsersService } from './admin-users.service';

describe('AdminUsersService', () => {
  let service: AdminUsersService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminUsersService],
    });
    service = TestBed.inject(AdminUsersService);

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('getAdminUsers', () => {
    it('should call the endpoint for getting admin uses', () => {
      service.getAdminUsers().subscribe();

      const req = http.expectOne('/api/admin/admin-users');
      expect(req.request.method).toBe('GET');
    });
  });

  describe('createAdminUsers', () => {
    it('should call the endpoint for creating admin users with the correct data', () => {
      const newAdminUser = {
        fullname: 'admin user',
        jobTitle: 'administrator',
        email: 'admin@email.com',
        phone: '01234567890',
        permissionsType: 'Admin',
      };
      service.createAdminUser(newAdminUser).subscribe();

      const req = http.expectOne('/api/admin/admin-users/create-admin-user');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.adminUser).toEqual(newAdminUser);
    });
  });
});
