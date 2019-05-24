import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { EstablishmentService } from './establishment.service';
import { UserDetails } from '@core/model/userDetails.model';
import { MyWorkplacesResponse } from '@core/model/my-workplaces.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _userDetails$: BehaviorSubject<UserDetails> = new BehaviorSubject<UserDetails>(null);
  public userDetails$: Observable<UserDetails> = this._userDetails$.asObservable();

  constructor(private http: HttpClient, private establishmentService: EstablishmentService) {}

  /*
   * GET /api/user/establishment/:establishmentId
   */
  public getUsernameFromEstbId() {
    return this.http.get<any>(`/api/user/establishment/${this.establishmentService.establishmentId}`);
  }

  /*
   * GET /api/user/establishment/:establishmentId/:username
   */
  public getUserDetails(username): Observable<UserDetails> {
    return this.http.get<any>(`/api/user/establishment/${this.establishmentService.establishmentId}/${username}`);
  }

  /*
   * PUT /api/user/establishment/:establishmentId/:username
   */
  public updateUserDetails(userDetails: UserDetails): Observable<UserDetails> {
    return this.http.put<UserDetails>(
      `/api/user/establishment/${this.establishmentService.establishmentId}/${userDetails.username}`,
      userDetails
    );
  }

  public updateState(userDetails: UserDetails) {
    this._userDetails$.next(userDetails);
  }

  public getMyEstablishments(): Observable<MyWorkplacesResponse> {
    return this.http.get<MyWorkplacesResponse>(`/api/user/my/establishments`);
  }
}
