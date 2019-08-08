import { TestBed } from '@angular/core/testing';

import { WorkplaceService } from './workplace.service';

describe('WorkplaceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WorkplaceService = TestBed.get(WorkplaceService);
    expect(service).toBeTruthy();
  });
});
