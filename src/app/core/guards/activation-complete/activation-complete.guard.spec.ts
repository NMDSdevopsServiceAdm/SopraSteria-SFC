import { TestBed, inject } from '@angular/core/testing';

import { ActivationCompleteGuard } from './activation-complete.guard';

describe('ActivationCompleteGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActivationCompleteGuard],
    });
  });

  it('should ...', inject([ActivationCompleteGuard], (guard: ActivationCompleteGuard) => {
    expect(guard).toBeTruthy();
  }));
});
