import { UserService } from '@core/services/user.service';
import { UserDetails } from '@core/model/userDetails.model';
import { Observable, of } from 'rxjs';
import { GetWorkplacesResponse, Workplace } from '@core/model/my-workplaces.model';
import { Mock } from 'protractor/built/driverProviders';
import { HttpClient } from '@angular/common/http';

export class MockUserService extends UserService {
  private subsidiaries = 0;

  public static factory(subsidiaries = 0) {
    return (httpClient: HttpClient) => {
      const service = new MockUserService(httpClient);
      service.subsidiaries = subsidiaries;
      return service;
    }
  }

  public get loggedInUser(): UserDetails {
    return {
      email: '', fullname: '', jobTitle: '', phone: ''
    };
  }

  public getEstablishments(wdf: boolean = false): Observable<GetWorkplacesResponse> {
    return of({
      primary: {
      },
      subsidaries: {
        count: this.subsidiaries,
        establishments: []
      }
    } as GetWorkplacesResponse);
  }
}
