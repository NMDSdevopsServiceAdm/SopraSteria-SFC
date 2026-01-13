import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { CqcStatusChangeStateService } from './admin-cqc-main-service-status.service';
describe('CqcStatusChangeStateService', () => {
  let service: CqcStatusChangeStateService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [CqcStatusChangeStateService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CqcStatusChangeStateService);
    http = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  describe('cqcStatusChanges', () => {
    const mockData = [
      { id: 1, status: 'Pending' },
      { id: 2, status: 'InProgress' },
    ];

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should load data from localStorage on init', () => {
      localStorage.setItem('cqcStatusChanges', JSON.stringify(mockData));

      const service = new CqcStatusChangeStateService();

      service.get$().subscribe((data) => {
        expect(data).toEqual(mockData);
      });
    });

    it('should save data to localStorage and emit it when set() is called', () => {
      service.set(mockData);

      const stored = JSON.parse(localStorage.getItem('cqcStatusChanges')!);
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

      expect(localStorage.getItem('cqcStatusChanges')).toBeNull();

      service.get$().subscribe((data) => {
        expect(data).toBeNull();
      });
    });
  });
});
