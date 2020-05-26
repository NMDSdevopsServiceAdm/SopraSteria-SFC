import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ParentRequestsService } from '@core/services/parent-requests.service';
import { ParentRequest } from '@core/model/parent-request.model';

export class MockParentRequestsService extends ParentRequestsService {
  private approved = false;

  public static factory(approved = false) {
    return (httpClient: HttpClient) => {
      const service = new MockParentRequestsService(httpClient);
      service.approved = approved;
      return service;
    };
  }

  public getParentRequest(uuid = ''): Observable<ParentRequest> {
    return of({
      status: this.approved ? 'Approved' : 'Rejected'
    } as ParentRequest);
  }
}
