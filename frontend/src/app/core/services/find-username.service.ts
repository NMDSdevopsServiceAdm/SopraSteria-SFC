import { Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';

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
  answerCorrect: true;
  username: string;
}
interface AnswerIncorrect {
  answerCorrect: false;
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

  findUsername(params: FindUsernameRequest): Observable<any> {
    return this.http
      .post<FindUsernameResponse>(`${environment.appRunnerEndpoint}/api/registration/findUsername`, params)
      .pipe(catchError((res) => this.handleFindUsernameErrors(res)));
  }

  handleFindUsernameErrors(err: HttpErrorResponse): Observable<AnswerIncorrect> {
    if (err.status === 401) {
      const remainingAttempts = err.error?.remainingAttempts ?? 0;

      return of({
        answerCorrect: false,
        remainingAttempts,
      });
    }

    throwError(err);
  }
}
