import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Roles } from '@core/model/roles.enum';

import { AdminUsersService, ParentRequestsStateService } from './admin-users.service';
import { environment } from 'src/environments/environment';
import { provideHttpClient } from '@angular/common/http';
describe('AdminUsersService', () => {
  let service: AdminUsersService;
  let parentRequestService: ParentRequestsStateService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [AdminUsersService, ParentRequestsStateService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminUsersService);
    parentRequestService = TestBed.inject(ParentRequestsStateService);
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

      const req = http.expectOne(`${environment.appRunnerEndpoint}/api/user/admin`);
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

      const req = http.expectOne(`${environment.appRunnerEndpoint}/api/user/add/admin`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newAdminUser);
    });
  });

  describe('getAdminUser', () => {
    it('should call the endpoint for retrieving a single admin user', () => {
      service.getAdminUser('mock-useruid').subscribe();

      const req = http.expectOne(`${environment.appRunnerEndpoint}/api/user/admin/mock-useruid`);
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

      const req = http.expectOne(`${environment.appRunnerEndpoint}/api/user/admin/${userId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedAdminUser);
    });
  });

  describe('deleteAdminUserDetails', () => {
    it('should call the delete admin user details endpoint', () => {
      service.deleteAdminUserDetails('mock-userId').subscribe();

      const req = http.expectOne(`${environment.appRunnerEndpoint}/api/user/admin/mock-userId`);
      expect(req.request.method).toBe('DELETE');
    });
  });

  describe('ParentRequestsStateService', () => {
    const mockData = [
      { id: 1, status: 'Pending' },
      { id: 2, status: 'InProgress' },
    ];

    beforeEach(() => {
      localStorage.clear();
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should load data from localStorage on init', () => {
      localStorage.setItem('parentRequests', JSON.stringify(mockData));

      const service = new ParentRequestsStateService();

      service.get$().subscribe((data) => {
        expect(data).toEqual(mockData);
      });
    });

    it('should save data to localStorage and emit it when set() is called', () => {
      parentRequestService.set(mockData);

      const stored = JSON.parse(localStorage.getItem('parentRequests')!);
      expect(stored).toEqual(mockData);

      parentRequestService.get$().subscribe((data) => {
        expect(data).toEqual(mockData);
      });
    });

    it('should emit new values to subscribers when set() is called', () => {
      const spy = jasmine.createSpy('subscriber');

      parentRequestService.get$().subscribe(spy);

      parentRequestService.set(mockData);

      expect(spy).toHaveBeenCalledWith(mockData);
    });

    it('should clear localStorage and emit null when clear() is called', () => {
      parentRequestService.set(mockData);

      parentRequestService.clear();

      expect(localStorage.getItem('parentRequests')).toBeNull();

      parentRequestService.get$().subscribe((data) => {
        expect(data).toBeNull();
      });
    });
  });
});
