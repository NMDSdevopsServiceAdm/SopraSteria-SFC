import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { InternationalRecruitmentService } from './international-recruitment.service';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { Worker } from '@core/model/worker.model';

describe('InternationalRecruitmentService', () => {
  let service: InternationalRecruitmentService;
  let worker = workerBuilder() as Worker;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [InternationalRecruitmentService],
    });
    service = TestBed.inject(InternationalRecruitmentService);
  });

  it('should create the service', async () => {
    expect(service).toBeTruthy();
  });

  describe('employed from outside or inside UK values', () => {
    it('should convert the yes value', () => {
      worker.employedFromOutsideUk = 'Yes';
      expect(service.convertEmployedFromOutsideUkValue(worker)).toBe('Outside the UK');
    });

    it('should convert the no value', () => {
      worker.employedFromOutsideUk = 'No';
      expect(service.convertEmployedFromOutsideUkValue(worker)).toBe('Inside the UK');
    });

    it("should convert the don't know value", () => {
      worker.employedFromOutsideUk = "Don't know";
      expect(service.convertEmployedFromOutsideUkValue(worker)).toBe('Not known');
    });

    it('should convert the null value', () => {
      worker.employedFromOutsideUk = null;
      expect(service.convertEmployedFromOutsideUkValue(worker)).toBe(null);
    });
  });

  describe('show international recruitment questions', () => {
    describe('nationality is other', () => {
      it('should return true if British citizenship is no', () => {
        worker.nationality.value = 'Other';
        worker.britishCitizenship = 'No';

        expect(service.shouldSeeInternationalRecruitmentQuestions(worker)).toBe(true);
      });

      it("should return true if British citizenship is Don't know", () => {
        worker.nationality.value = 'Other';
        worker.britishCitizenship = "Don't know";

        expect(service.shouldSeeInternationalRecruitmentQuestions(worker)).toBe(true);
      });

      it('should return true if British citizenship is null', () => {
        worker.nationality.value = 'Other';
        worker.britishCitizenship = null;

        expect(service.shouldSeeInternationalRecruitmentQuestions(worker)).toBe(true);
      });
    });

    describe("nationality is Don't know", () => {
      it('should return true if British citizenship is no', () => {
        worker.nationality.value = "Don't know";
        worker.britishCitizenship = 'No';

        expect(service.shouldSeeInternationalRecruitmentQuestions(worker)).toBe(true);
      });

      it('should return false if British citizenship is not known', () => {
        worker.nationality.value = "Don't know";
        worker.britishCitizenship = "Don't know";

        expect(service.shouldSeeInternationalRecruitmentQuestions(worker)).toBe(false);
      });

      it('should return false if British citizenship is null', () => {
        worker.nationality.value = "Don't know";
        worker.britishCitizenship = null;

        expect(service.shouldSeeInternationalRecruitmentQuestions(worker)).toBe(false);
      });

      it('should return false if British citizenship is yes', () => {
        worker.nationality.value = "Don't know";
        worker.britishCitizenship = 'Yes';

        expect(service.shouldSeeInternationalRecruitmentQuestions(worker)).toBe(false);
      });
    });

    it('should return false if nationality is British', () => {
      worker.nationality.value = 'British';
      worker.britishCitizenship = null;

      expect(service.shouldSeeInternationalRecruitmentQuestions(worker)).toBe(false);
    });

    it('should return false if nationality is null', () => {
      worker.nationality.value = null;
      worker.britishCitizenship = null;

      expect(service.shouldSeeInternationalRecruitmentQuestions(worker)).toBe(false);
    });
  });
});
