import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface FindAccountRequest {
  name: string;
  workplaceIdOrPostcode: string;
  email: string;
}

export interface AccountFound {
  accountFound: true;
  accountUid: string;
  securityQuestion: string;
}
interface AccountNotFound {
  accountFound: false;
  remainingAttempts: number;
}

export type FindUserAccountResponse = AccountFound | AccountNotFound;

@Injectable({
  providedIn: 'root',
})
export class FindUsernameService {
  public usernameFound: string = null;

  constructor(private http: HttpClient) {}

  findUserAccount(params: FindAccountRequest): Observable<FindUserAccountResponse> {
    return this.http.post(
      `${environment.appRunnerEndpoint}/api/registration/findUserAccount`,
      params,
    ) as Observable<FindUserAccountResponse>;
  }
}
