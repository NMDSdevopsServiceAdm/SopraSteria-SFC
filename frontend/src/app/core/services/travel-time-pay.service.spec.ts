import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TravelTimePayService } from './travel-time-pay.service';
import { environment } from 'src/environments/environment';
import { TravelTimePayResponse } from '@core/model/travel-time-pay.model';

describe('TravelTimePayService', () => {
  let service: TravelTimePayService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TravelTimePayService],
    });

    service = TestBed.inject(TravelTimePayService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch travel time pay options', () => {
    const mockResponse: TravelTimePayResponse = {
      travelTimePayOptions: [
        {
          id: 1,
          includeRate: false,
          label: 'Minimum wage',
        },
        {
          id: 3,
          includeRate: true,
          label: 'A different travel time rate',
        },
      ],
    };

    service.getAllTravelTimePayOptions().subscribe((options) => {
      expect(options.length).toBe(2);
      expect(options).toEqual(mockResponse.travelTimePayOptions);
    });

    const req = httpMock.expectOne(`${environment.appRunnerEndpoint}/api/travelTimePayOptions`);

    expect(req.request.method).toBe('GET');
  });
});
