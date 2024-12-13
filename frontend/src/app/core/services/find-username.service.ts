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

export interface FindUsernameRequest {
  uid: string;
  securityQuestionAnswer: string;
}

interface AnswerCorrect {
  username: string;
}
interface AnswerIncorrect {
  remainingAttempts: number;
}

export type FindUsernameResponse = AnswerCorrect | AnswerIncorrect;

@Injectable({
  providedIn: 'root',
})
export class FindUsernameService {
  public usernameFound: string = null;

  constructor(private http: HttpClient) {}

  findUserAccount(params: FindAccountRequest): Observable<FindUserAccountResponse> {
    return this.http.post<FindUserAccountResponse>(
      `${environment.appRunnerEndpoint}/api/registration/findUserAccount`,
      params,
    );
  }

  findUsername(params: FindUsernameRequest): Observable<FindUsernameResponse> {
    return this.http.post<FindUsernameResponse>(
      `${environment.appRunnerEndpoint}/api/registration/findUsername`,
      params,
    );
  }
}
