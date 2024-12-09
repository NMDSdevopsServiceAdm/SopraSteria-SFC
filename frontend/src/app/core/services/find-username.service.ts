import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface FindAccountRequest {
  name: string;
  workplaceIdOrPostcode: string;
  email: string;
}

interface AccountFound {
  accountFound: true;
  accountUid: string;
}
interface AccountNotFound {
  accountFound: false;
  remainingAttempts: number;
}

export type FindAccountResponse = AccountFound | AccountNotFound;

@Injectable({
  providedIn: 'root',
})
export class FindUsernameService {
  private _accountUid$: BehaviorSubject<string> = new BehaviorSubject(null);
  public findAccountRemainingAttempts: number = null;
  public findUsernameRemainingAttempts: number = null;

  constructor(private http: HttpClient) {}

  postFindUserAccount(params: FindAccountRequest): Observable<FindAccountResponse> {
    return this.http.post(
      `${environment.appRunnerEndpoint}/api/registration/findUserAccount`,
      params,
    ) as Observable<FindAccountResponse>;
  }

  findUserAccount(params: FindAccountRequest): void {
    this.postFindUserAccount(params).subscribe((res) => {
      if (res.accountFound === true) {
        this._accountUid$.next(res.accountUid);
      } else {
        this.findAccountRemainingAttempts = res.remainingAttempts;
      }
    });
  }

  public get accountUid$() {
    return this._accountUid$.asObservable();
  }

  public get accountUid() {
    return this._accountUid$.value;
  }
}
