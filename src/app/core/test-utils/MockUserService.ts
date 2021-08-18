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
  },
});

const readUser = EditUser();
readUser.role = Roles.Read;

const editUser = EditUser();

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
      name: 'Subsid Workplace',
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
    },
  });

const subsid2 = subsid2Builder();

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

  private;

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
      email: '',
      fullname: '',
      jobTitle: '',
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
        establishments: [subsid1, subsid2],
      },
    } as GetWorkplacesResponse);
  }
  public getAllUsersForEstablishment(workplaceUid: string): Observable<Array<UserDetails>> {
    if (workplaceUid === 'overLimit') {
      return of([readUser, readUser, readUser, editUser, editUser, editUser] as UserDetails[]);
    }

    return of([editUser] as UserDetails[]);
  }

  public updateState(userDetails: UserDetails) {
    return userDetails;
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
