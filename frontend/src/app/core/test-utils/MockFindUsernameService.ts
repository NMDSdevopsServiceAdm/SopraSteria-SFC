import { Injectable } from '@angular/core';
import { FindAccountRequest, FindAccountResponse, FindUsernameService } from '@core/services/find-username.service';
import { of } from 'rxjs';

@Injectable()
export class MockFindUsernameService extends FindUsernameService {
  postFindUserAccount(params: FindAccountRequest): ReturnType<FindUsernameService['postFindUserAccount']> {
    if (params.name === 'non-exist-username') {
      return of({
        accountFound: false,
        remainingAttempts: 4,
      });
    }

    return of({
      accountFound: true,
      accountUid: 'mock-user-uid',
    });
  }
}
