import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SubsidiaryRouterService } from './subsidiary-router-service';

describe('ParentSubsidiaryViewService', () => {
  let service: SubsidiaryRouterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SubsidiaryRouterService],
    });
    service = TestBed.inject(SubsidiaryRouterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
