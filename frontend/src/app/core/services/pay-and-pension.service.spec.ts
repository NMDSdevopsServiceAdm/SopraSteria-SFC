import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PayAndPensionService } from './pay-and-pension.service'

describe("PayAndPensionService", () => {
   let service: PayAndPensionService
   let http: HttpTestingController;

   beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [PayAndPensionService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PayAndPensionService);

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe("inPayAndPensionsMiniFlow", () => {
    it('should set inPayAndPensionsMiniFlow', () => {
      service.setInPayAndPensionsMiniFlow(true)
      const expected = service.getInPayAndPensionsMiniFlow()

      expect(expected).toEqual(true)
    })

    it('should clear inPayAndPensionsMiniFlow', () => {
      service.setInPayAndPensionsMiniFlow(true)
      service.clearInPayAndPensionsMiniFlow()
      const expected = service.getInPayAndPensionsMiniFlow()

      expect(expected).toEqual(null)
    })
  })

  describe('showSleepInsQuestions', () => {
    [1, 2].forEach((payAndPensionsGroup) => {
      it(`should return workplace-offer-sleep-ins when payAndPensionsGroup is ${payAndPensionsGroup}`, () => {
        const expected = 'workplace-offer-sleep-ins';
        const actual = service.showSleepInsQuestions(payAndPensionsGroup);

        expect(actual).toEqual(expected);
      });
    });

    it('should return null when payAndPensionsGroup is not an allowed group number', () => {
      const expected = null;
      const actual = service.showSleepInsQuestions(3);

      expect(actual).toEqual(expected);
    });
  });
})
