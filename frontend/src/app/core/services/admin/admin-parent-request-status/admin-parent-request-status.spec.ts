import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ParentRequestsStateService } from './admin-parent-request-status.service';
import { provideHttpClient } from '@angular/common/http';
describe('ParentRequestsStateService', () => {
  let service: ParentRequestsStateService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [ParentRequestsStateService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ParentRequestsStateService);
    http = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  describe('ParentRequestsState', () => {
    const mockData = [
      { id: 1, status: 'Pending' },
      { id: 2, status: 'InProgress' },
    ];

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should load data from localStorage on init', () => {
      localStorage.setItem('parentRequests', JSON.stringify(mockData));

      const service = new ParentRequestsStateService();

      service.get$().subscribe((data) => {
        expect(data).toEqual(mockData);
      });
    });

    it('should save data to localStorage and emit it when set() is called', () => {
      service.set(mockData);

      const stored = JSON.parse(localStorage.getItem('parentRequests')!);
      expect(stored).toEqual(mockData);

      service.get$().subscribe((data) => {
        expect(data).toEqual(mockData);
      });
    });

    it('should emit new values to subscribers when set() is called', () => {
      const spy = jasmine.createSpy('subscriber');

      service.get$().subscribe(spy);

      service.set(mockData);

      expect(spy).toHaveBeenCalledWith(mockData);
    });

    it('should clear localStorage and emit null when clear() is called', () => {
      service.set(mockData);

      service.clear();

      expect(localStorage.getItem('parentRequests')).toBeNull();

      service.get$().subscribe((data) => {
        expect(data).toBeNull();
      });
    });
  });
});
