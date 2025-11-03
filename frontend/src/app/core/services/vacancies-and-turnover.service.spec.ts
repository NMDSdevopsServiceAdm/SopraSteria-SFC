import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  VacanciesAndTurnoverService,
  WorkplaceUpdateFlowType,
  WorkplaceUpdatePage,
} from './vacancies-and-turnover.service';
import { provideHttpClient } from '@angular/common/http';

describe('VacanciesAndTurnoverService', () => {
  let service: VacanciesAndTurnoverService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [VacanciesAndTurnoverService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(VacanciesAndTurnoverService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('allUpdatePagesVisited', () => {
    [
      [],
      [WorkplaceUpdatePage.TOTAL_STAFF],
      [WorkplaceUpdatePage.TOTAL_STAFF, WorkplaceUpdatePage.UPDATE_VACANCIES],
    ].forEach((visitedPages) => {
      it(`should return false when not all add pages in visitedPages when ADD passed in (${visitedPages})`, async () => {
        visitedPages.forEach((page) => {
          service.addToVisitedPages(page);
        });

        expect(service.allUpdatePagesVisited(WorkplaceUpdateFlowType.ADD)).toBeFalse();
      });

      it(`should return false when not all delete pages in visitedPage when DELETE passed in (${visitedPages})`, async () => {
        visitedPages.forEach((page) => {
          service.addToVisitedPages(page);
        });

        expect(service.allUpdatePagesVisited(WorkplaceUpdateFlowType.DELETE)).toBeFalse();
      });
    });

    it('should return true when all pages in visitedPages for add flow', async () => {
      [
        WorkplaceUpdatePage.TOTAL_STAFF,
        WorkplaceUpdatePage.UPDATE_VACANCIES,
        WorkplaceUpdatePage.UPDATE_STARTERS,
      ].forEach((page) => {
        service.addToVisitedPages(page);
      });

      expect(service.allUpdatePagesVisited(WorkplaceUpdateFlowType.ADD)).toBeTrue();
    });

    it('should return true when all pages in visitedPages for delete flow', async () => {
      [
        WorkplaceUpdatePage.TOTAL_STAFF,
        WorkplaceUpdatePage.UPDATE_VACANCIES,
        WorkplaceUpdatePage.UPDATE_LEAVERS,
      ].forEach((page) => {
        service.addToVisitedPages(page);
      });

      expect(service.allUpdatePagesVisited(WorkplaceUpdateFlowType.DELETE)).toBeTrue();
    });
  });

  describe('allUpdatePagesSubmitted', () => {
    [
      [],
      [WorkplaceUpdatePage.TOTAL_STAFF],
      [WorkplaceUpdatePage.TOTAL_STAFF, WorkplaceUpdatePage.UPDATE_VACANCIES],
    ].forEach((submittedPages) => {
      it(`should return false when not all add pages in submittedPages when ADD passed in (${submittedPages})`, async () => {
        submittedPages.forEach((page) => {
          service.addToSubmittedPages(page);
        });

        expect(service.allUpdatePagesSubmitted(WorkplaceUpdateFlowType.ADD)).toBeFalse();
      });

      it(`should return false when not all delete pages in submittedPages when DELETE passed in (${submittedPages})`, async () => {
        submittedPages.forEach((page) => {
          service.addToSubmittedPages(page);
        });

        expect(service.allUpdatePagesSubmitted(WorkplaceUpdateFlowType.DELETE)).toBeFalse();
      });
    });

    it('should return true when all pages in submittedPages for add flow', async () => {
      [
        WorkplaceUpdatePage.TOTAL_STAFF,
        WorkplaceUpdatePage.UPDATE_VACANCIES,
        WorkplaceUpdatePage.UPDATE_STARTERS,
      ].forEach((page) => {
        service.addToSubmittedPages(page);
      });

      expect(service.allUpdatePagesSubmitted(WorkplaceUpdateFlowType.ADD)).toBeTrue();
    });

    it('should return true when all pages in submittedPages for delete flow', async () => {
      [
        WorkplaceUpdatePage.TOTAL_STAFF,
        WorkplaceUpdatePage.UPDATE_VACANCIES,
        WorkplaceUpdatePage.UPDATE_LEAVERS,
      ].forEach((page) => {
        service.addToSubmittedPages(page);
      });

      expect(service.allUpdatePagesSubmitted(WorkplaceUpdateFlowType.DELETE)).toBeTrue();
    });
  });
});
