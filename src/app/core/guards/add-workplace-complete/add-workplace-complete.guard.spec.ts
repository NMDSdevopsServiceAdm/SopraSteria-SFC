import { TestBed, inject } from '@angular/core/testing';
import { AddWorkplaceCompleteGuard } from './add-workplace-complete.guard';

describe('AddWorkplaceCompleteGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AddWorkplaceCompleteGuard],
    });
  });

  it('should ...', inject([AddWorkplaceCompleteGuard], (guard: AddWorkplaceCompleteGuard) => {
    expect(guard).toBeTruthy();
  }));
});
