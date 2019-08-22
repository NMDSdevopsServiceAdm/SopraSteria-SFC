import { TestBed, async, inject } from '@angular/core/testing';

import { CheckPermissionsGuard } from './check-permissions.guard';

describe('CheckPermissionsGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CheckPermissionsGuard],
    });
  });

  it('should ...', inject([CheckPermissionsGuard], (guard: CheckPermissionsGuard) => {
    expect(guard).toBeTruthy();
  }));
});
