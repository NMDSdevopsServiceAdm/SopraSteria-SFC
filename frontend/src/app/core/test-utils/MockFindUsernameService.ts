import { Injectable } from '@angular/core';
import { FindAccountRequest, FindUsernameService } from '@core/services/find-username.service';
import { of } from 'rxjs';

@Injectable()
export class MockFindUsernameService extends FindUsernameService {
  findUserAccount(params: FindAccountRequest): ReturnType<FindUsernameService['findUserAccount']> {
    if (params.name === 'non-exist user') {
      return of({
        accountFound: false,
        remainingAttempts: 4,
      });
    }

    return of({
      accountFound: true,
      accountUid: 'mock-user-uid',
      securityQuestion: 'What is your favourite colour?',
    });
  }
}
