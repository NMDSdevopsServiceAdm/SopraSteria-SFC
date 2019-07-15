import { TestBed } from '@angular/core/testing';

import { CreateAccountService } from './create-account.service';

describe('CreateAccountService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CreateAccountService = TestBed.get(CreateAccountService);
    expect(service).toBeTruthy();
  });
});
