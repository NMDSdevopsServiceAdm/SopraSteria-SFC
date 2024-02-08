import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from './breadcrumb.service';

describe('BreadcrumbService', () => {
  let service: BreadcrumbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [BreadcrumbService],
    });
    service = TestBed.inject(BreadcrumbService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });
});
