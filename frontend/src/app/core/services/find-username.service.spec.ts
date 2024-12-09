import { TestBed } from '@angular/core/testing';

import { FindUsernameService } from './find-username.service';

describe('FindUsernameService', () => {
  let service: FindUsernameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FindUsernameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
