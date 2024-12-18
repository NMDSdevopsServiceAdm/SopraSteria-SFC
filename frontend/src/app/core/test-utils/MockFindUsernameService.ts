import { Injectable } from '@angular/core';
import { FindAccountRequest, FindUsernameRequest, FindUsernameService } from '@core/services/find-username.service';
import { Observable, of } from 'rxjs';

export const mockTestUser = {
  accountUid: 'mock-user-uid',
  securityQuestion: 'What is your favourite colour?',
  securityQuestionAnswer: 'Blue',
  username: 'mock-test-user',
};

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

  findUsername(params: FindUsernameRequest): ReturnType<FindUsernameService['findUsername']> {
    if (params.securityQuestionAnswer === mockTestUser.securityQuestionAnswer) {
      return of({
        answerCorrect: true,
        username: mockTestUser.username,
      });
    }

    return of({
      answerCorrect: false,
      remainingAttempts: 4,
    });
  }
}
