import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('updateAdminUserDetails', () => {
    it('should call the endpoint for getting admin uses', () => {
      const updatedAdminUser = {
        fullname: 'updated admin user',
        jobTitle: 'administrator',
        email: 'admin@email.com',
        phone: '01234567890',
      };
      const userId = 'mock-userId';
      service.updateAdminUserDetails(userId, updatedAdminUser).subscribe();

      const req = http.expectOne(`/api/user/admin/me/${userId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedAdminUser);
    });
  });
});
