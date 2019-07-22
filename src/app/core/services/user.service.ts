import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetWorkplacesResponse } from '@core/model/my-workplaces.model';
import { URLStructure } from '@core/model/url.model';
import { UserDetails } from '@core/model/userDetails.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EstablishmentService } from './establishment.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _userDetails$: BehaviorSubject<UserDetails> = new BehaviorSubject<UserDetails>(null);
  public userDetails$: Observable<UserDetails> = this._userDetails$.asObservable();

  private _returnUrl$: BehaviorSubject<URLStructure> = new BehaviorSubject<URLStructure>(null);
  public returnUrl$: Observable<URLStructure> = this._returnUrl$.asObservable();

  private _loggedInUser$: BehaviorSubject<UserDetails> = new BehaviorSubject<UserDetails>(null);
  public loggedInUser$: Observable<UserDetails> = this._loggedInUser$.asObservable();

  constructor(private http: HttpClient, private establishmentService: EstablishmentService) {}

  public get loggedInUser(): UserDetails {
    return this._loggedInUser$.value;
  }

  public set loggedInUser(user: UserDetails) {
    this._loggedInUser$.next(user);
  }

  public getLoggedInUser(): Observable<UserDetails> {
    return this.http.get<UserDetails>(`/api/user/me`);
  }

  /*
   * GET /api/user/establishment/:establishmentId
   */
  public getUsernameFromEstbId() {
    return this.http.get<any>(`/api/user/establishment/${this.establishmentService.establishmentId}`);
  }

  /*
   * GET /api/user/establishment/:establishmentId/:username|userUid
   */
  public getUserDetails(establishmentUid: string, userUid: string): Observable<UserDetails> {
    return this.http.get<any>(`/api/user/establishment/${establishmentUid}/${userUid}`);
  }

  public getMyDetails(username: string): Observable<UserDetails> {
    return this.http.get<any>(`/api/user/establishment/${this.establishmentService.establishmentId}/${username}`);
  }

  /*
   * PUT /api/user/establishment/:establishmentId/:username
   */
  public updateUserDetails(username: string, userDetails: UserDetails): Observable<UserDetails> {
    return this.http.put<UserDetails>(
      `/api/user/establishment/${this.establishmentService.establishmentId}/${username}`,
      userDetails
    );
  }

  public deleteUser(useruid: string) {
    return this.http.delete(`/api/user/${useruid}`);
  }

  public resendActivationLink(useruid: string) {
    return this.http.post(`/api/user/${useruid}/resend-activation`, null, {
      responseType: 'text' as 'json',
    });
  }

  public updateState(userDetails: UserDetails) {
    this._userDetails$.next(userDetails);
  }

  public updateReturnUrl(returnUrl: URLStructure) {
    this._returnUrl$.next(returnUrl);
  }

  public getEstablishments(): Observable<GetWorkplacesResponse> {
    return this.http.get<GetWorkplacesResponse>(`/api/user/my/establishments`);
  }

  public getAllUsersForEstablishment(establishmentUid: string): Observable<Array<UserDetails>> {
    return this.http
      .get<{
        users: Array<UserDetails>;
      }>(`/api/user/establishment/${establishmentUid}`)
      .pipe(map(response => response.users));
  }
}
