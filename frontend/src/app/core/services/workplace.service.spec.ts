import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { WorkplaceService } from './workplace.service';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

describe('WorkplaceService', () => {
  let service: WorkplaceService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [WorkplaceService, provideHttpClient(), provideHttpClientTesting()],
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
});
