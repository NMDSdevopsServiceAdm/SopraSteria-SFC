import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetWorkplacesResponse } from '@core/model/my-workplaces.model';
import { Roles } from '@core/model/roles.enum';
import { UserDetails } from '@core/model/userDetails.model';
import { UserService } from '@core/services/user.service';
import { bool, build, fake, oneOf, sequence } from '@jackfranklin/test-data-bot/build';
import { Observable, of } from 'rxjs';

export const EditUser = build('EditUser', {
  fields: {
    contract: oneOf('Permanent', 'Temporary', 'Pool or Bank', 'Agency', 'Other'),
    email: '',
    fullname: fake((f) => f.name.findName()),
    jobTitle: fake((f) => f.lorem.sentence()),
    phone: '01222222222',
    role: Roles.Edit,
    status: 'Active',
    isPrimary: null,
    uid: fake((f) => f.name.firstName()),
  },
});

export const ReadUser = () => {
  return EditUser({
    overrides: {
      role: Roles.Read,
    },
  });
};

const readUser = ReadUser();
readUser.isPrimary = false;

const primaryEditUser = EditUser();
primaryEditUser.isPrimary = true;

const nonPrimaryEditUser = EditUser();
nonPrimaryEditUser.isPrimary = false;

export { primaryEditUser, nonPrimaryEditUser, readUser };

const workplaceBuilder = build('Workplace', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.random.uuid()),
    name: fake((f) => f.lorem.sentence()),
    dataOwner: 'Workplace',
    dataPermissions: '',
    dataOwnerPermissions: '',
    isParent: bool(),
    postCode: 'xxxxx',
    ustatus: null,
    wdf: { overall: false },
  },
});

const primaryWorkplaceBuilder = () =>
  workplaceBuilder({
    overrides: {
      uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
      isParent: 'true',
      name: 'Primary Workplace',
      postcode: 'WA1 2LQ',
      id: 1,
      parentUid: null,
    },
  });

const primary = primaryWorkplaceBuilder();

const subsid1Builder = () =>
  workplaceBuilder({
    overrides: {
      dataOwner: 'Parent',
      dataPermissions: 'Workplace',
      parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
      name: 'First Subsid Workplace',
      postCode: 'WA1 1BQ',
    },
  });

const subsid1 = subsid1Builder();

const subsid2Builder = () =>
  workplaceBuilder({
    overrides: {
      dataOwner: 'Parent',
      dataPermissions: 'Workplace',
      parentUid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd',
      name: 'Another Subsid Workplace',
      postCode: 'WA8 9LW',
      ustatus: 'PENDING',
    },
  });

const subsid2 = subsid2Builder();

const subsid3 = Object.assign({}, subsid2);
subsid3.ustatus = 'IN PROGRESS';
subsid3.name = 'Third Subsid';

@Injectable()
export class MockUserService extends UserService {
  private subsidiaries = 2;
  private isAdmin = false;
  public userDetails$ = of({
    uid: 'mocked-uid',
    email: 'john@test.com',
    fullname: 'John Doe',
    jobTitle: 'Software Engineer',
    phone: '01234 345634',
  });

  public static factory(subsidiaries = 0, isAdmin = false) {
    return (httpClient: HttpClient) => {
      const service = new MockUserService(httpClient);
      service.subsidiaries = subsidiaries;
      service.isAdmin = isAdmin;
      return service;
    };
  }

  public get loggedInUser(): UserDetails {
    return {
      uid: 'mocked-uid',
      email: 'test@developer.com',
      fullname: 'John Smith',
      jobTitle: 'Developer',
      phone: '',
      role: this.isAdmin ? ('Admin' as Roles) : undefined,
    };
  }

  public get loggedInUser$(): Observable<UserDetails> {
    return of(this.loggedInUser);
  }

  public getEstablishments(wdf: boolean = false): Observable<GetWorkplacesResponse> {
    return of({
      primary: primary,
      subsidaries: {
        count: this.subsidiaries,
        establishments: [subsid1, subsid2, subsid3],
      },
    } as GetWorkplacesResponse);
  }
  public getAllUsersForEstablishment(workplaceUid: string): Observable<Array<UserDetails>> {
    if (workplaceUid === 'overLimit') {
      return of([ReadUser(), ReadUser(), ReadUser(), EditUser(), EditUser(), EditUser()] as UserDetails[]);
    }
    if (workplaceUid === 'activeEditUsers') {
      return of([EditUser(), EditUser()] as UserDetails[]);
    }
    if (workplaceUid === 'twoEditTwoReadOnlyUsers') {
      return of([EditUser(), EditUser(), ReadUser(), ReadUser()] as UserDetails[]);
    }

    return of([EditUser()] as UserDetails[]);
  }

  public updateState(userDetails: UserDetails) {
    return userDetails;
  }

  public updateUserDetails(): Observable<any> {
    return of({});
  }
}

export class MockUserServiceWithNoUserDetails extends MockUserService {
  public userDetails$ = of({
    uid: '',
    email: '',
    fullname: '',
    jobTitle: '',
    phone: '',
  });
}
