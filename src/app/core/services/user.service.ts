import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetWorkplacesResponse } from '@core/model/my-workplaces.model';
import { URLStructure } from '@core/model/url.model';
import { UserDetails } from '@core/model/userDetails.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

interface GetAllUsersResponse {
  users: Array<UserDetails>;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _userDetails$: BehaviorSubject<UserDetails> = new BehaviorSubject<UserDetails>(null);
  private _returnUrl$: BehaviorSubject<URLStructure> = new BehaviorSubject<URLStructure>(null);
  private _loggedInUser$: BehaviorSubject<UserDetails> = new BehaviorSubject<UserDetails>(null);
  public userDetails$: Observable<UserDetails> = this._userDetails$.asObservable();
  public returnUrl$: Observable<URLStructure> = this._returnUrl$.asObservable();

  constructor(private http: HttpClient) {}

  public get loggedInUser$(): Observable<UserDetails> {
    return this._loggedInUser$.asObservable();
  }

  public get loggedInUser(): UserDetails {
    return this._loggedInUser$.value;
  }

  public set loggedInUser(user: UserDetails) {
    this._loggedInUser$.next(user);
  }

  public updateState(userDetails: UserDetails) {
    this._userDetails$.next(userDetails);
  }

  public updateReturnUrl(returnUrl: URLStructure) {
    this._returnUrl$.next(returnUrl);
  }

  public getLoggedInUser(): Observable<UserDetails> {
    return this.http.get<UserDetails>(`/api/user/me`).pipe(tap(user => (this.loggedInUser = user)));
  }

  /*
   * GET /api/user/establishment/:establishmentUID
   */
  public getUsernameFromEstbId(workplaceUid: string) {
    return this.http.get<any>(`/api/user/establishment/${workplaceUid}`);
  }

  /*
   * GET /api/user/establishment/:establishmentUID/:userUID
   */
  public getUserDetails(workplaceUid: string, userUid: string): Observable<UserDetails> {
    return this.http.get<any>(`/api/user/establishment/${workplaceUid}/${userUid}`);
  }

  /*
   * GET /api/user/establishment/:establishmentUID/:userUID
   */
  public getMyDetails(workplaceUid: string, userUid: string): Observable<UserDetails> {
    return this.http.get<any>(`/api/user/establishment/${workplaceUid}/${userUid}`);
  }

  /*
   * PUT /api/user/establishment/:establishmentUID/:userUID
   */
  public updateUserDetails(workplaceUid: string, userUid: string, userDetails: UserDetails): Observable<UserDetails> {
    return this.http.put<UserDetails>(`/api/user/establishment/${workplaceUid}/${userUid}`, userDetails);
  }

  /*
   * DELETE /api/user/establishment/:establishmentUID/:userUID
   */
  public deleteUser(workplaceUid: string, userUid: string) {
    return this.http.delete(`/api/user/establishment/${workplaceUid}/${userUid}`);
  }

  /*
   * POST /api/user/:userUID/resend-activation
   */
  public resendActivationLink(useruid: string) {
    return this.http.post(`/api/user/${useruid}/resend-activation`, null, {
      responseType: 'text' as 'json',
    });
  }

  /*
   * GET /api/user/my/establishments
   */
  public getEstablishments(): Observable<GetWorkplacesResponse> {
    return this.http.get<GetWorkplacesResponse>(`/api/user/my/establishments`);
  }

  /*
   * GET /api/user/establishment/:establishmentUID
   */
  public getAllUsersForEstablishment(workplaceUid: string): Observable<Array<UserDetails>> {
    return this.http
      .get<GetAllUsersResponse>(`/api/user/establishment/${workplaceUid}`)
      .pipe(map(response => response.users));
  }
}
