import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Worker } from '@core/model/worker.model';
import { workerBuilder } from '@core/test-utils/MockWorkerService';

import { InternationalRecruitmentService } from './international-recruitment.service';
import { provideHttpClient } from '@angular/common/http';

describe('InternationalRecruitmentService', () => {
  let service: InternationalRecruitmentService;
  let worker: Worker;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [InternationalRecruitmentService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InternationalRecruitmentService);
    worker = workerBuilder() as Worker;
  });

  it('should create the service', async () => {
    expect(service).toBeTruthy();
  });

  describe('employed from outside or inside UK values for staff record', () => {
    it('should map the yes value', () => {
      const employedFromOutsideUk = 'Yes';
      expect(service.getEmployedFromOutsideUkStaffRecordValue(employedFromOutsideUk)).toBe('From outside the UK');
    });

    it('should map the no value', () => {
      const employedFromOutsideUk = 'No';
      expect(service.getEmployedFromOutsideUkStaffRecordValue(employedFromOutsideUk)).toBe('From inside the UK');
    });

    it("should map the don't know value", () => {
      const employedFromOutsideUk = "Don't know";
      expect(service.getEmployedFromOutsideUkStaffRecordValue(employedFromOutsideUk)).toBe('Not known');
    });

    it('should map the null value', () => {
      const employedFromOutsideUk = null;
      expect(service.getEmployedFromOutsideUkStaffRecordValue(employedFromOutsideUk)).toBe(null);
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

  describe('international recruitment worker answers', () => {
    const data = {
      workplaceUid: 'workplaceUid',
      healthAndCareVisaWorkerAnswers: [
        {
          healthAndCareVisa: 'Yes',
          name: 'Worker 1',
          uid: 'c1166',
        },
        {
          healthAndCareVisa: 'No',
          name: 'Worker 2',
          uid: 'c1h84',
        },
      ],
    };

    it('should set the international recruitment worker answers', () => {
      service.setInternationalRecruitmentWorkerAnswers(data);

      expect(service.getInternationalRecruitmentWorkerAnswers()).toBe(data);
    });
  });
});
