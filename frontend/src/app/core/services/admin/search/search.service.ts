import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  GroupSearchRequest,
  UserSearchItem,
  UserSearchRequest,
  WorkplaceSearchItem,
  WorkplaceSearchRequest,
} from '@core/model/admin/search.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  constructor(private http: HttpClient) {}

  public searchWorkplaces(data: WorkplaceSearchRequest): Observable<WorkplaceSearchItem[]> {
    return this.http
      .post<WorkplaceSearchItem[]>(`${environment.appRunnerEndpoint}/api/admin/search/establishments`, data, { observe: 'response' })
      .pipe(map((response) => response.body));
  }

  public searchUsers(data: UserSearchRequest): Observable<UserSearchItem[]> {
    return this.http
      .post<UserSearchItem[]>(`${environment.appRunnerEndpoint}/api/admin/search/users`, data, { observe: 'response' })
      .pipe(map((response) => response.body));
  }

  public searchGroups(data: GroupSearchRequest): Observable<Array<WorkplaceSearchItem>> {
    return this.http
      .post<WorkplaceSearchItem[]>(`${environment.appRunnerEndpoint}/api/admin/search/groups`, data, { observe: 'response' })
      .pipe(map((response) => response.body));
  }
}
