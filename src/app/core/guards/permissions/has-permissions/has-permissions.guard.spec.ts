import { TestBed, async, inject } from '@angular/core/testing';

import { HasPermissionsGuard } from './has-permissions.guard';

describe('HasPermissionsGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HasPermissionsGuard],
    });
  });

  it('should ...', inject([HasPermissionsGuard], (guard: HasPermissionsGuard) => {
    expect(guard).toBeTruthy();
  }));
});
