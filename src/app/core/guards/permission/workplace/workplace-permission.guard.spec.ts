import { TestBed, async, inject } from '@angular/core/testing';

import { WorkplacePermissionGuard } from './workplace-permission.guard';

describe('WorkplacePermissionGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WorkplacePermissionGuard],
    });
  });

  it('should ...', inject([WorkplacePermissionGuard], (guard: WorkplacePermissionGuard) => {
    expect(guard).toBeTruthy();
  }));
});
