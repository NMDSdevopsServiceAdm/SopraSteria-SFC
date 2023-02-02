import { Injectable } from '@angular/core';
import { LoginCredentials } from '@core/model/login-credentials.model';
import { SecurityDetails } from '@core/model/security-details.model';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { BehaviorSubject } from 'rxjs';

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
}

@Injectable()
export class MockRegistrationServiceWithMainService extends MockCreateAccountService {
  public loginCredentials$: BehaviorSubject<LoginCredentials> = new BehaviorSubject({
    username: 'testUser',
    password: 'Passw0rd',
  });
}
