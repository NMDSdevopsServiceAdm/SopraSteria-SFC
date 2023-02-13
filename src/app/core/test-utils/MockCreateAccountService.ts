import { Injectable } from '@angular/core';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { SecurityDetails } from '@core/model/security-details.model';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { UserDetails } from '@core/model/userDetails.model';

@Injectable()
export class MockCreateAccountService extends CreateAccountService {
  public loginCredentials$: BehaviorSubject<LoginCredentials> = new BehaviorSubject({
    username: 'Test',
    password: '',
  });

  public securityDetails$: BehaviorSubject<SecurityDetails> = new BehaviorSubject({
    securityQuestion: 'What is your favourite colour?',
    securityQuestionAnswer: 'Blue',
  });

  public userDetails$ = of({
    uid: 'mocked-uid',
    email: 'john@test.com',
    fullname: 'John Doe',
    jobTitle: 'Software Engineer',
    phone: '01234 345634',
  });

  public get loggedInUser(): UserDetails {
    return {
      uid: 'mocked-uid',
      email: 'test@developer.com',
      fullname: 'John Smith',
      jobTitle: 'Developer',
      phone: '01234567890',
      securityQuestion: 'Not relevant',
      securityQuestionAnswer: 'Not relevant',
    };
  }
}
