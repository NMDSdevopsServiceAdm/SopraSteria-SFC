import { TestBed, async, inject } from '@angular/core/testing';

import { EditUserPermissionsGuard } from './edit-user-permissions.guard';

describe('EditUserPermissionsGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EditUserPermissionsGuard]
    });
  });

  it('should ...', inject([EditUserPermissionsGuard], (guard: EditUserPermissionsGuard) => {
    expect(guard).toBeTruthy();
  }));
});
