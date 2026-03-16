import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PayAndPensionService } from './pay-and-pension.service';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { ReplaySubject } from 'rxjs';

describe('PayAndPensionService', () => {
  let service: PayAndPensionService;
  let http: HttpTestingController;

  let router: Router;

  const eventSubject = new ReplaySubject<RouterEvent>(1);

  const routerMock = {
    events: eventSubject.asObservable(),
    url: '/workplace-data/workplace-summary/pensions',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        PayAndPensionService,
        {
          provide: Router,
          useValue: routerMock,
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(PayAndPensionService);

    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('inPayAndPensionsMiniFlow', () => {
    it('should set inPayAndPensionsMiniFlow', () => {
      service.setInPayAndPensionsMiniFlow(true);
      const expected = service.getInPayAndPensionsMiniFlow();

      expect(expected).toEqual(true);
    });

    it('should clear inPayAndPensionsMiniFlow', () => {
      service.setInPayAndPensionsMiniFlow(true);
      service.clearInPayAndPensionsMiniFlow();
      const expected = service.getInPayAndPensionsMiniFlow();

      expect(expected).toEqual(null);
    });
  });

  describe('showSleepInsQuestions', () => {
    [1, 2].forEach((payAndPensionsGroup) => {
      it(`should return workplace-offer-sleep-ins when payAndPensionsGroup is ${payAndPensionsGroup}`, () => {
        const expected = true;
        const actual = service.showSleepInsQuestions(payAndPensionsGroup);

        expect(actual).toEqual(expected);
      });
    });

    it('should return null when payAndPensionsGroup is not an allowed group number', () => {
      const expected = false;
      const actual = service.showSleepInsQuestions(3);

      expect(actual).toEqual(expected);
    });
  });

  describe('show showTravelTimePayQuestion', () => {
    it('should return true when payAndPensionsGroup is 1', () => {
      const expected = true;
      const actual = service.showTravelTimePayQuestion(1);

      expect(actual).toEqual(expected);
    });

    [2, 3, null, undefined].forEach((payAndPensionsGroup) => {
      it(`should return false when payAndPensionsGroup is ${payAndPensionsGroup}`, () => {
        const expected = false;
        const actual = service.showTravelTimePayQuestion(payAndPensionsGroup);

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('clearInPayAndPensionsMiniFlowWhenClickedAway', () => {
    const inPayAndPensionsMiniFlowValueSet = true;
    it('should call setInPayAndPensionsMiniFlow and set to null', () => {
      service.setInPayAndPensionsMiniFlow(inPayAndPensionsMiniFlowValueSet);

      const url = 'staff-records';
      eventSubject.next(new NavigationEnd(0, url, url));

      service.clearInPayAndPensionsMiniFlowWhenClickedAway();

      expect(service.getInPayAndPensionsMiniFlow()).toEqual(null);
    });

    it('should not call setInPayAndPensionsMiniFlow and should have the same value', () => {
      service.setInPayAndPensionsMiniFlow(inPayAndPensionsMiniFlowValueSet);

      const url = '/workplace-data/workplace-summary/pensions';
      eventSubject.next(new NavigationEnd(0, url, url));

      service.clearInPayAndPensionsMiniFlowWhenClickedAway();

      expect(service.getInPayAndPensionsMiniFlow()).toEqual(inPayAndPensionsMiniFlowValueSet);
    });
  });
});
