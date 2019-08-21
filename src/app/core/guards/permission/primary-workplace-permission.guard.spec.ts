import { TestBed, async, inject } from '@angular/core/testing';

import { PrimaryWorkplacePermissionGuard } from './primary-workplace-permission.guard';

describe('PrimaryWorkplacePermissionGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PrimaryWorkplacePermissionGuard],
    });
  });

  it('should ...', inject([PrimaryWorkplacePermissionGuard], (guard: PrimaryWorkplacePermissionGuard) => {
    expect(guard).toBeTruthy();
  }));
});
