import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { EstablishmentService } from './establishment.service';
import { UserAccount } from '@core/model/userAccount.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _userDetails$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public userDetails$: Observable<string> = this._userDetails$.asObservable();

  constructor(private http: HttpClient, private establishmentService: EstablishmentService) {}

  /*
   * GET /api/user/establishment/:establishmentId
   */
  getUsernameFromEstbId() {
    return this.http.get<any>(`/api/user/establishment/${this.establishmentService.establishmentId}`);
  }

  /*
   * GET /api/user/establishment/:establishmentId/:username
   */
  getUserDetails(username): Observable<UserAccount> {
    return this.http.get<any>(`/api/user/establishment/${this.establishmentService.establishmentId}/${username}`);
  }

  /*
   * PUT /api/user/establishment/:establishmentId/:username
   */
  updateUserDetails(username, data) {
    return this.http.put<any>(`/api/user/establishment/${this.establishmentService.establishmentId}/${username}`, data);
  }

  updateState(data) {
    this._userDetails$.next(data);
  }
}
