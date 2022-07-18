import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Roles } from '@core/model/roles.enum';

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

      const req = http.expectOne('/api/user/admin');
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
        role: Roles.Admin,
      };
      service.createAdminUser(newAdminUser).subscribe();

      const req = http.expectOne('/api/user/add/admin');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newAdminUser);
    });
  });

  describe('getAdminUser', () => {
    it('should call the endpoint for retrieving a single admin user', () => {
      service.getAdminUser('mock-useruid').subscribe();

      const req = http.expectOne('/api/user/admin/mock-useruid');
      expect(req.request.method).toBe('GET');
    });
  });

  describe('updateAdminUser', () => {
    it('should call the update admin user endpoint with user id and user details', () => {
      const updatedAdminUser = {
        fullname: 'updated admin user',
        jobTitle: 'administrator',
        email: 'admin@email.com',
        phone: '01234567890',
        role: Roles.AdminManager,
      };
      const userId = 'mock-userId';
      service.updateAdminUserDetails(userId, updatedAdminUser).subscribe();

      const req = http.expectOne(`/api/user/admin/${userId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedAdminUser);
    });
  });

  describe('deleteAdminUserDetails', () => {
    it('should call the delete admin user details endpoint', () => {
      service.deleteAdminUserDetails('mock-userId').subscribe();

      const req = http.expectOne('/api/user/admin/mock-userId');
      expect(req.request.method).toBe('DELETE');
    });
  });
});
