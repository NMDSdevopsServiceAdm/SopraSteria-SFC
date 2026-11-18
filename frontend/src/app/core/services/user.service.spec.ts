import { environment } from 'src/environments/environment';

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserDetails } from '@core/model/userDetails.model';
import { EditUser, ReadUser } from '@core/test-utils/MockUserService';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [UserService, provideHttpClient(), provideHttpClientTesting()],
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

      const req = http.expectOne(`${environment.appRunnerEndpoint}/api/user/admin/me/${userId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedAdminUser);
    });
  });

  describe('updateTrainingCoursesMessageViewedQuantity', () => {
    it('should call the endpoint to update trainingCoursesMessageViewedQuantity', () => {
      const userUid = 'mock-userId';

      service.updateTrainingCoursesMessageViewedQuantity(userUid).subscribe();

      const req = http.expectOne(
        `${environment.appRunnerEndpoint}/api/user/update-training-courses-message-viewed-quantity/${userUid}`,
      );
      expect(req.request.method).toBe('POST');
    });
  });

  describe('updateUserFlags', () => {
    it('should call the endpoint to update flags for user', () => {
      const userUid = 'mock-userId';

      service.updateUserFlags(userUid, { registrationSurveyCompleted: true }).subscribe();

      const req = http.expectOne(`${environment.appRunnerEndpoint}/api/user/flag/${userUid}`);
      expect(req.request.body).toEqual({ registrationSurveyCompleted: true });
      expect(req.request.method).toBe('PUT');
    });
  });

  describe('filterActiveNonPrimaryEditUsers', async () => {
    const currentUserUid = 'mock-current-user-uid';

    it('should not return read only users', async () => {
      const editUser = EditUser();
      const editUserName = editUser.fullname as string;
      const users = [ReadUser(), editUser, ReadUser()] as UserDetails[];

      const filteredUsers = service.filterActiveNonPrimaryEditUsers(users, currentUserUid);

      expect(filteredUsers.length).toBe(1);
      expect(filteredUsers[0].fullname).toBe(editUserName);
    });

    it('should not return pending users', async () => {
      const pendingEditUser = EditUser();
      pendingEditUser.status = 'Pending';
      const pendingEditUserName = pendingEditUser.fullname as string;
      const users = [EditUser(), EditUser(), pendingEditUser] as UserDetails[];

      const filteredUsers = service.filterActiveNonPrimaryEditUsers(users, currentUserUid);

      const pendingEditUsernameNotInUsersReturned = !filteredUsers.some(
        (user) => user.fullname === pendingEditUserName,
      );

      expect(filteredUsers.length).toBe(2);
      expect(pendingEditUsernameNotInUsersReturned).toBeTruthy();
    });

    it('should not return user with same uid as currentUserUid', async () => {
      const currentUser = EditUser();
      const currentUserUid = currentUser.uid as string;
      const currentUserName = currentUser.fullname as string;

      const users = [EditUser(), currentUser] as UserDetails[];

      const filteredUsers = service.filterActiveNonPrimaryEditUsers(users, currentUserUid);

      const currentUsernameNotInUsersReturned = !filteredUsers.some((user) => user.fullname === currentUserName);

      expect(filteredUsers.length).toBe(1);
      expect(currentUsernameNotInUsersReturned).toBeTruthy();
    });
  });
});
