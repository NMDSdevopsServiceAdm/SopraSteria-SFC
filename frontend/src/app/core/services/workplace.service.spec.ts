import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WorkplaceService } from './workplace.service';
import { TestBed } from '@angular/core/testing';

describe('WorkplaceService', () => {
  let service: WorkplaceService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WorkplaceService],
    });
    service = TestBed.inject(WorkplaceService);

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should set the international recruitment worker answers', () => {
    const allWorkplacesSortValue = 'workplaceToCheckAsc';

    service.setAllWorkplacesSortValue(allWorkplacesSortValue);

    expect(service.getAllWorkplacesSortValue()).toBe(allWorkplacesSortValue);
  });
});
