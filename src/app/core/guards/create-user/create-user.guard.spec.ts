import { TestBed, inject } from '@angular/core/testing';

import { CreateUserGuard } from './create-user.guard';

describe('CreateUserGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CreateUserGuard],
    });
  });

  it('should ...', inject([CreateUserGuard], (guard: CreateUserGuard) => {
    expect(guard).toBeTruthy();
  }));
});
