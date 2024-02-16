import { TestBed } from '@angular/core/testing';

import { ParentSubsidiaryViewService } from './parent-subsidiary-view.service';

describe('ParentSubsidiaryViewService', () => {
  let service: ParentSubsidiaryViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParentSubsidiaryViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
