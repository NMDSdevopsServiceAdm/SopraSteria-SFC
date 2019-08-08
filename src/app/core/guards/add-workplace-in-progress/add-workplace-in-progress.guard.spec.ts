import { TestBed, inject } from '@angular/core/testing';
import { AddWorkplaceInProgressGuard } from './add-workplace-in-progress.guard';

describe('AddWorkplaceInProgressGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AddWorkplaceInProgressGuard],
    });
  });

  it('should ...', inject([AddWorkplaceInProgressGuard], (guard: AddWorkplaceInProgressGuard) => {
    expect(guard).toBeTruthy();
  }));
});
