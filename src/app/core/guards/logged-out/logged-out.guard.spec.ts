import { TestBed, async, inject } from '@angular/core/testing';

import { LoggedOutGuard } from './logged-out.guard';

describe('LoggedOutGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoggedOutGuard]
    });
  });

  it('should ...', inject([LoggedOutGuard], (guard: LoggedOutGuard) => {
    expect(guard).toBeTruthy();
  }));
});
